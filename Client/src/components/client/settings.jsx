import { Link } from "react-router-dom";

const Settings = () => {
  return (
    <nav className="flex flex-col items-center py-5 gap-3">
      <Link
        to="/auth/forgot"
        className="py-3 w-[80%] border border-gray-300 text-center cursor-pointer rounded-md hover:bg-primary hover:text-white"
      >
        <i className="fas fa-lock mr-2"></i>
        Ganti Password
      </Link>
    </nav>
  );
};
export default Settings;
