import { reactive } from 'vue';

export type DialogVariant = 'info' | 'success' | 'warning' | 'danger';

interface DialogOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

interface DialogState {
  open: boolean;
  type: 'alert' | 'confirm';
  message: string;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: DialogVariant;
  resolve: ((value: boolean) => void) | null;
}

const state = reactive<DialogState>({
  open: false,
  type: 'alert',
  message: '',
  title: '',
  confirmLabel: 'ตกลง',
  cancelLabel: 'ยกเลิก',
  variant: 'info',
  resolve: null,
});

export const dialogState = state;

export const useDialog = () => {
  const alert = (message: string, options: DialogOptions = {}): Promise<void> => {
    return new Promise((resolve) => {
      state.open = true;
      state.type = 'alert';
      state.message = message;
      state.title = options.title ?? defaultTitle(options.variant ?? 'info');
      state.confirmLabel = options.confirmLabel ?? 'ตกลง';
      state.cancelLabel = options.cancelLabel ?? 'ยกเลิก';
      state.variant = options.variant ?? 'info';
      state.resolve = () => { resolve(); };
    });
  };

  const confirm = (message: string, options: DialogOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      state.open = true;
      state.type = 'confirm';
      state.message = message;
      state.title = options.title ?? 'ยืนยันการดำเนินการ';
      state.confirmLabel = options.confirmLabel ?? 'ยืนยัน';
      state.cancelLabel = options.cancelLabel ?? 'ยกเลิก';
      state.variant = options.variant ?? 'warning';
      state.resolve = resolve;
    });
  };

  return { alert, confirm };
};

const defaultTitle = (variant: DialogVariant) => ({
  info: 'แจ้งให้ทราบ',
  success: 'ดำเนินการสำเร็จ',
  warning: 'คำเตือน',
  danger: 'ไม่สามารถดำเนินการได้',
}[variant]);
