import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary'
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await onConfirm();
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const isDestructive = confirmVariant === 'danger';
  const Icon = isDestructive ? AlertTriangle : Info;

  const btnClass = 
    confirmVariant === 'danger' ? 'btn-danger' : 
    confirmVariant === 'warning' ? 'btn-secondary text-amber-700 border-amber-300 hover:bg-amber-50' : 
    'btn-primary';

  const iconClass = 
    confirmVariant === 'danger' ? 'text-red-600 bg-red-100' : 
    confirmVariant === 'warning' ? 'text-amber-600 bg-amber-100' : 
    'text-blue-600 bg-blue-100';

  return (
    <Modal isOpen={isOpen} onClose={isConfirming ? () => {} : onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center px-4 py-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 mb-6">{message}</p>
        
        <div className="flex w-full gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1 btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`flex-1 ${btnClass} flex justify-center items-center`}
          >
            {isConfirming ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
