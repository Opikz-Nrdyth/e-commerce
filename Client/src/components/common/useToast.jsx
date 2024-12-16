import { useState } from "react";
import Toast from "./Toast";

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success", duration = 3000) => {
    setToast({ message, type });

    // Auto-hide after a set duration
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  return {
    showToast,
    ToastComponent: toast && (
      <Toast {...toast} onClose={() => setToast(null)} />
    ),
  };
};
