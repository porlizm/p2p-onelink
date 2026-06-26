import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';

@Injectable()
export class AiAuditService {
  constructor(
    @InjectRepository(PurchaseRequisition)
    private prRepo: Repository<PurchaseRequisition>,
  ) {}

  async detectSplitPurchases() {
    // 1. Fetch all PRs with lines and relations
    const prs = await this.prRepo.find({
      relations: ['lines', 'requester', 'company'],
      order: { created_at: 'DESC' },
    });

    const flaggedGroups: any[] = [];

    // Group PRs by requester_id
    const prsByUser: { [userId: string]: PurchaseRequisition[] } = {};
    for (const pr of prs) {
      if (!prsByUser[pr.requester_id]) {
        prsByUser[pr.requester_id] = [];
      }
      prsByUser[pr.requester_id].push(pr);
    }

    // Identify split PRs: PRs created within 7 days of each other, where individual amounts < 50k (DOA limit) but combined > 50k
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const DOA_THRESHOLD = 50000;

    for (const userId of Object.keys(prsByUser)) {
      const userPrs = prsByUser[userId];
      if (userPrs.length < 2) continue;

      // Sort by created_at ascending
      userPrs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      // Sliding window to find split clusters
      for (let i = 0; i < userPrs.length; i++) {
        const cluster: PurchaseRequisition[] = [userPrs[i]];
        const startTime = new Date(userPrs[i].created_at).getTime();

        for (let j = i + 1; j < userPrs.length; j++) {
          const prTime = new Date(userPrs[j].created_at).getTime();
          if (prTime - startTime <= SEVEN_DAYS_MS) {
            cluster.push(userPrs[j]);
          } else {
            break;
          }
        }

        if (cluster.length >= 2) {
          const totalCombined = cluster.reduce((sum, p) => sum + Number(p.total_amount), 0);
          const allBelowThreshold = cluster.every((p) => Number(p.total_amount) < DOA_THRESHOLD);

          if (allBelowThreshold && totalCombined >= DOA_THRESHOLD) {
            const requesterName = cluster[0].requester?.username || 'Unknown Requester';
            flaggedGroups.push({
              requester_id: userId,
              requester_name: requesterName,
              total_combined_amount: totalCombined,
              risk_level: totalCombined > 150000 ? 'High' : 'Medium',
              reason: `พบการขอซื้อย่อยจำนวน ${cluster.length} รายการภายใน 7 วัน โดยผู้ร้องขอท่านเดียวกัน ซึ่งมียอดรวม ${totalCombined} THB เกินวงเงินอนุมัติขั้นต้นของแผนก (DOA limit ${DOA_THRESHOLD} THB) ส่อเจตนาแบ่งซอยงบสั่งซื้อเพื่อเลี่ยงเกณฑ์การอนุมัติ`,
              pr_details: cluster.map((p) => ({
                pr_id: p.pr_id,
                pr_no: p.pr_no,
                total_amount: Number(p.total_amount),
                created_at: p.created_at,
              })),
            });
            // Advance counter to skip redundant sub-clusters
            i += cluster.length - 1;
          }
        }
      }
    }

    return {
      success: true,
      scan_timestamp: new Date(),
      audit_type: 'DOA_SPLIT_PURCHASE_SCAN',
      flagged_count: flaggedGroups.length,
      results: flaggedGroups,
    };
  }
}
