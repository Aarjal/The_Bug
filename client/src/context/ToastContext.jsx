import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import "../styles/Toast.css";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="toast-container">
        {toasts.map((toast) => {
          let Icon = Info;
          if (toast.type === "success") Icon = CheckCircle;
          if (toast.type === "error") Icon = AlertTriangle;

          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <span className={`toast-icon toast-icon-${toast.type}`}>
                <Icon size={18} />
              </span>
              <span style={{ flex: 1, paddingRight: "0.5rem" }}>{toast.message}</span>
              <button
                className="toast-close-btn"
                onClick={() => removeToast(toast.id)}
                aria-label="Close toast notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
