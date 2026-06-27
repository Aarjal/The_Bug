import { AlertTriangle, X } from "lucide-react";
import "../styles/ConfirmationModal.css";

export default function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning", // 'warning' | 'danger' | 'info'
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <div className="confirm-title-wrapper">
            {(type === "danger" || type === "warning") && (
              <AlertTriangle className={`confirm-icon icon-${type}`} size={20} />
            )}
            <h3>{title}</h3>
          </div>
          <button className="confirm-close-btn" onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-footer">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${type === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
