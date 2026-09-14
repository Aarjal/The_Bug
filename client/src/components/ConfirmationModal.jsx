import { AlertTriangle, Info, X } from "lucide-react";
import "../styles/ConfirmationModal.css";

export default function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
}) {
  if (!isOpen) return null;

  const isDestructive = type === "danger";
  const IconComponent = isDestructive || type === "warning" ? AlertTriangle : Info;
  const confirmButtonClass = isDestructive ? "btn-danger" : "btn-primary";

  return (
    <div className="confirm-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="confirm-card" onClick={(event) => event.stopPropagation()}>
        <div className="confirm-header">
          <div className="confirm-title-wrapper">
            <IconComponent className={`confirm-icon icon-${type}`} size={20} />
            <h3>{title}</h3>
          </div>
          <button className="confirm-close-btn" onClick={onCancel} aria-label="Close dialog">
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
            className={`btn btn-sm ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
