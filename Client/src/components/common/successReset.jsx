import { Link } from "react-router-dom";

const SuccessReset = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <i className="fas fa-check text-green-500 text-3xl"></i>
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Password reset</h1>
        <p className="text-gray-600 mb-4">
          Your password has been successfully reset.
          <br />
          Click below to log in magically.
        </p>
        <div className="text-center mt-6">
          <Link to="/auth/login">
            <i className="fas fa-arrow-left mr-2"></i>Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SuccessReset;
