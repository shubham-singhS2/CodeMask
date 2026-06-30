import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={16} />,
  error:   <AlertCircle size={16} />,
  info:    <Info size={16} />,
};

export function Toast({ toast, onHide }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`} key={toast.id}>
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span className="toast-msg">{toast.message}</span>
      <button className="toast-close" onClick={onHide}><X size={13} /></button>
    </div>
  );
}
