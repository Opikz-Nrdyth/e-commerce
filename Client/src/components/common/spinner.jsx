import { useState } from "react";

const useSpinner = () => {
  const [isLoading, setIsLoading] = useState(false);

  const showSpinner = () => setIsLoading(true);
  const hideSpinner = () => setIsLoading(false);

  const spinner = isLoading ? (
    <div className="fixed z-10 w-full h-screen flex justify-center items-center bg-[rgba(0,0,0,0.7)]">
      <div class="spinner"></div>
    </div>
  ) : null;

  return { spinner, showSpinner, hideSpinner };
};

export default useSpinner;
