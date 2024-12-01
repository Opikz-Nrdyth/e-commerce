import React, { useEffect, useState } from "react";

const Toast = ({ message, type, onClose }) => {
  const [show, setShow] = useState(true);

  // Effect to handle fade-out after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onClose(), 500); // Close the toast after fade-out is complete
    }, 3000); // Display toast for 3 seconds

    return () => clearTimeout(timer); // Cleanup timer if the component is unmounted
  }, [onClose]);

  const renderIcon = () => {
    if (type === "success") {
      return <i className="fas fa-check-circle text-white text-xl"></i>;
    } else if (type === "danger") {
      return <i className="fas fa-times-circle text-white text-xl"></i>;
    } else if (type === "warning") {
      return <i className="fas fa-exclamation-circle text-white text-xl"></i>;
    }
    return null;
  };

  return (
    <div
      className={`fixed top-5 right-5 flex items-center p-4 rounded-md shadow-lg text-white transition-opacity duration-500 ease-out ${
        type === "success"
          ? "bg-green-600"
          : type === "danger"
          ? "bg-red-600"
          : type === "warning"
          ? "bg-yellow-500"
          : "bg-gray-600"
      } ${show ? "opacity-100" : "opacity-0"}`}
      style={{ zIndex: 1000 }}
    >
      <div className="mr-3">{renderIcon()}</div>
      <p className="text-sm flex-1">{message}</p>
      <button
        onClick={() => {
          setShow(false);
          setTimeout(onClose, 500);
        }}
        className="ml-4 text-white text-lg font-bold opacity-80 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
