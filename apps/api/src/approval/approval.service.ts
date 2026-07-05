import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ApprovalTask } from '../database/entities/approval-task.entity';
import { ApprovalDelegation } from '../database/entities/approval-delegation.entity';
import { DOARule } from '../database/entities/doa-rule.entity';
import { NotificationService } from '../notification/notification.service';
import { ApprovalDecision, ApprovalTaskStatus } from '@p2p/shared';

export interface ApprovalResultHandler {
  onApprove: (documentId: string, decidedBy: string) => Promise<void>;
  onReject: (documentId: string, reason: string, decidedBy: string) => Promise<void>;
  onRevise: (documentId: string, reason: string, decidedBy: string) => Promise<void>;
}

@Injectable()
export class ApprovalService {
  private handlers = new Map<string, ApprovalResultHandler>();

  constructor(
    @InjectRepository(ApprovalTask)
    private taskRepo: Repository<ApprovalTask>,
    @InjectRepository(ApprovalDelegation)
    private delegationRepo: Repository<ApprovalDelegation>,
    @InjectRepository(DOARule)
    private doaRepo: Repository<DOARule>,
    private notificationService: NotificationService,
  ) {}

  /** Consumer modules (PR, PO, Bidding, ...) register how to react when a route they started finishes. */
  registerHandler(documentType: string, handler: ApprovalResultHandler) {
    this.handlers.set(documentType, handler);
  }

  private async findMatchingRules(companyId: string, docType: string, amount: number) {
    const rules = await this.doaRepo.find({
      where: {
        company_id: companyId,
        doc_type: docType,
        amount_min: LessThanOrEqual(amount),
        amount_max: MoreThanOrEqual(amount),
      },
      order: { approval_level: 'ASC' },
    });
    return rules;
  }

  /** Creates approval tasks for the first (lowest) pending level. Call once when a document is submitted. */
  async initiateRoute(documentType: string, documentId: string, companyId: string, amount: number): Promise<ApprovalTask[]> {
    const rules = await this.findMatchingRules(companyId, documentType, amount);
    if (rules.length === 0) {
      throw new BadRequestException(
        `ไม่พบกฎ DOA (Delegation of Authority) สำหรับเอกสารประเภท ${documentType} มูลค่า ${amount} กรุณาแจ้ง Admin ให้ตั้งค่า DOA Rule ก่อนดำเนินการต่อ`,
      );
    }
    const currentLevel = rules[0].approval_level;
    return this.createTasksForLevel(documentType, documentId, companyId, amount, rules, currentLevel);
  }

  private async createTasksForLevel(
    documentType: string,
    documentId: string,
    companyId: string,
    amount: number,
    rules: DOARule[],
    level: number,
  ): Promise<ApprovalTask[]> {
    const rulesAtLevel = rules.filter((r) => r.approval_level === level);
    const tasks = rulesAtLevel.map((rule) => {
      const slaDue = new Date();
      slaDue.setHours(slaDue.getHours() + (rule.sla_hours || 48));
      return this.taskRepo.create({
        document_type: documentType,
        document_id: documentId,
        company_id: companyId,
        amount,
        step_level: level,
        approver_role: rule.approver_role,
        status: ApprovalTaskStatus.PENDING,
        sla_due_at: slaDue,
      });
    });
    const saved = await this.taskRepo.save(tasks);

    for (const task of saved) {
      await this.notificationService.createNotification(
        // Role-based inbox: no single recipient user yet, so notify is best-effort against Admin;
        // per-user delivery happens when the approver's role matches in getMyTasks().
        '00000006-0000-0000-0000-000000000010',
        'In-app',
        'APPROVAL_TASK_ASSIGNED',
        `มีเอกสาร ${documentType} รอการอนุมัติจากตำแหน่ง ${task.approver_role} (Task ${task.task_id})`,
      );
    }

    return saved;
  }

  private async isAuthorizedForTask(task: ApprovalTask, userId: string, userRoles: string[]): Promise<boolean> {
    if (userRoles.includes(task.approver_role)) {
      return true;
    }
    // Delegation: is this user an active delegate for someone holding the required role?
    const now = new Date();
    const activeDelegation = await this.delegationRepo.findOne({
      where: {
        delegate_user_id: userId,
        role: task.approver_role,
        active: true,
        effective_from: LessThanOrEqual(now),
        effective_to: MoreThanOrEqual(now),
      },
    });
    return !!activeDelegation;
  }

  async decide(taskId: string, userId: string, userRoles: string[], decision: ApprovalDecision, reason?: string): Promise<ApprovalTask> {
    const task = await this.taskRepo.findOne({ where: { task_id: taskId } });
    if (!task) {
      throw new NotFoundException('ไม่พบ Approval Task');
    }
    if (task.status !== ApprovalTaskStatus.PENDING) {
      throw new BadRequestException(`Task นี้ถูกดำเนินการไปแล้ว (สถานะ ${task.status})`);
    }
    if (!(await this.isAuthorizedForTask(task, userId, userRoles))) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์อนุมัติเอกสารนี้');
    }
    if ((decision === ApprovalDecision.REJECT || decision === ApprovalDecision.REVISE) && !reason) {
      throw new BadRequestException('กรุณาระบุเหตุผลในการปฏิเสธหรือส่งกลับแก้ไข');
    }

    task.decided_by = userId;
    task.decided_at = new Date();
    task.decision_reason = reason || null;

    const handler = this.handlers.get(task.document_type);

    if (decision === ApprovalDecision.REJECT) {
      task.status = ApprovalTaskStatus.REJECTED;
      await this.taskRepo.save(task);
      await this.terminateRoute(task.document_type, task.document_id, task.task_id);
      if (handler) await handler.onReject(task.document_id, reason!, userId);
      return task;
    }

    if (decision === ApprovalDecision.REVISE) {
      task.status = ApprovalTaskStatus.REVISE_REQUESTED;
      await this.taskRepo.save(task);
      await this.terminateRoute(task.document_type, task.document_id, task.task_id);
      if (handler) await handler.onRevise(task.document_id, reason!, userId);
      return task;
    }

    // Approve
    task.status = ApprovalTaskStatus.APPROVED;
    await this.taskRepo.save(task);

    const pendingSiblings = await this.taskRepo.count({
      where: {
        document_type: task.document_type,
        document_id: task.document_id,
        step_level: task.step_level,
        status: ApprovalTaskStatus.PENDING,
      },
    });

    if (pendingSiblings > 0) {
      // Still waiting on the rest of this parallel-approval group.
      return task;
    }

    // Whole level cleared — look for the next level.
    const rules = await this.findMatchingRules(task.company_id, task.document_type, Number(task.amount));
    const nextRule = rules.find((r) => r.approval_level > task.step_level);

    if (nextRule) {
      await this.createTasksForLevel(task.document_type, task.document_id, task.company_id, Number(task.amount), rules, nextRule.approval_level);
      return task;
    }

    // No more levels — route fully approved.
    if (handler) await handler.onApprove(task.document_id, userId);
    return task;
  }

  /** Marks any still-pending sibling tasks in the same route as Skipped (route terminated by reject/revise). */
  private async terminateRoute(documentType: string, documentId: string, excludeTaskId: string) {
    const siblings = await this.taskRepo.find({
      where: {
        document_type: documentType,
        document_id: documentId,
        status: ApprovalTaskStatus.PENDING,
      },
    });
    for (const sibling of siblings) {
      if (sibling.task_id === excludeTaskId) continue;
      sibling.status = ApprovalTaskStatus.SKIPPED;
      await this.taskRepo.save(sibling);
    }
  }

  async getMyTasks(userRoles: string[]): Promise<ApprovalTask[]> {
    if (userRoles.length === 0) return [];
    return this.taskRepo.find({
      where: userRoles.map((role) => ({ approver_role: role, status: ApprovalTaskStatus.PENDING })),
      order: { sla_due_at: 'ASC' },
    });
  }

  async getTasksForDocument(documentType: string, documentId: string): Promise<ApprovalTask[]> {
    return this.taskRepo.find({
      where: { document_type: documentType, document_id: documentId },
      order: { step_level: 'ASC', created_at: 'ASC' },
    });
  }

  /** Used by legacy single-shot endpoints (e.g. PATCH /pr/:id/approve) to locate the caller's active task. */
  async findMyPendingTaskForDocument(documentType: string, documentId: string, userId: string, userRoles: string[]): Promise<ApprovalTask> {
    const tasks = await this.taskRepo.find({
      where: { document_type: documentType, document_id: documentId, status: ApprovalTaskStatus.PENDING },
    });
    for (const task of tasks) {
      if (await this.isAuthorizedForTask(task, userId, userRoles)) {
        return task;
      }
    }
    throw new NotFoundException('ไม่พบ Approval Task ที่คุณมีสิทธิ์ดำเนินการสำหรับเอกสารนี้');
  }

  async checkEscalations(): Promise<{ escalated_count: number }> {
    const now = new Date();
    const overdue = await this.taskRepo.find({
      where: { status: ApprovalTaskStatus.PENDING, sla_due_at: LessThanOrEqual(now), is_escalated: false },
    });

    for (const task of overdue) {
      task.is_escalated = true;
      await this.taskRepo.save(task);

      const rules = await this.doaRepo.find({
        where: { company_id: task.company_id, doc_type: task.document_type, approval_level: task.step_level },
      });
      const escalateToRole = rules.find((r) => r.escalate_to_role)?.escalate_to_role;

      await this.notificationService.createNotification(
        '00000006-0000-0000-0000-000000000010',
        'In-app',
        'APPROVAL_SLA_ESCALATED',
        `Task อนุมัติเอกสาร ${task.document_type} (${task.document_id}) เกินกำหนด SLA แล้ว${escalateToRole ? ` — Escalate ไปยัง ${escalateToRole}` : ''}`,
      );
    }

    return { escalated_count: overdue.length };
  }
}
