import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import "../styles/Toast.css";

const ToastContext = createContext();

function ToastItem({ toast, onDismiss }) {
  const IconComponent =
    toast.type === "success"
      ? CheckCircle
      : toast.type === "error"
      ? AlertTriangle
      : Info;

  return (
    <div className={`toast toast-${toast.type}`}>
      <span className={`toast-icon toast-icon-${toast.type}`}>
        <IconComponent size={18} />
      </span>
      <span style={{ flex: 1, paddingRight: "0.5rem" }}>{toast.message}</span>
      <button
        className="toast-close-btn"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const toastId = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((activeToasts) => [...activeToasts, { id: toastId, message, type }]);

    setTimeout(() => {
      setToasts((activeToasts) => activeToasts.filter((item) => item.id !== toastId));
    }, 4000);
  }, []);

  const removeToast = useCallback((targetToastId) => {
    setToasts((activeToasts) => activeToasts.filter((item) => item.id !== targetToastId));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
