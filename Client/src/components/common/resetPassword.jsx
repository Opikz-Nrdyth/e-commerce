import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UseUpdateData } from "../../services/service_api";

const ResetPassword = () => {
  const [errorMessage, setErrorMessage] = useState({
    status: "success",
    message: "",
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let token = window.location.search;
    token = token.split("=")[1] || null;
    if (!token) {
      navigate("/auth/forgot");
      return;
    }

    try {
      let userData = atob(token);
      userData = JSON.parse(userData);
      const expiredDate = new Date(userData.expired);
      const currentDate = new Date();

      if (!userData) {
        navigate("/auth/forgot");
        return;
      } else if (currentDate > expiredDate) {
        navigate("/auth/forgot");
        return;
      } else {
        setUser(userData);
      }
    } catch (error) {
      navigate("/auth/forgot");
      return;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const pass = formData.get("password");
    const confirmPass = formData.get("confirm-password");

    if (!pass || !confirmPass || pass == "" || confirmPass == "") {
      setErrorMessage({
        status: "error",
        message: "Harap isi semua bidang",
      });
    } else if (pass != confirmPass) {
      setErrorMessage({
        status: "error",
        message: "Password dan Konfirmasi Password Harus Sama",
      });
    } else {
      setErrorMessage({
        status: "success",
        message: "",
      });

      const payload = {
        password: pass,
      };

      const updatePassword = await UseUpdateData("api/users", user.id, payload);
      if (updatePassword.status == "success") {
        navigate("success");
      }
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md sm:h-screen md:h-fit">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-300 p-4 rounded-full">
            <i className="fas fa-key text-primary text-2xl"></i>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-2">
          Tetapkan kata sandi baru
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Kata sandi baru Anda harus berbeda dengan kat sandi yang digunakan
          sebelumnya.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary password-input"
              type="password"
              id="password"
              name="password"
            />
            <p className="text-gray-500 text-sm mt-1">Minimal 8 karakter</p>
          </div>
          <div>
            <label
              className="block text-gray-700 mb-2"
              htmlFor="confirm-password"
            >
              Confirm password
            </label>
            <input
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary password-input"
              type="password"
              id="confirm-password"
              name="confirm-password"
            />
          </div>
          <div className="mb-6">
            <input
              type="checkbox"
              id="viewPass"
              onChange={(e) => {
                const passwordFields =
                  document.querySelectorAll(".password-input");
                passwordFields.forEach((field) => {
                  if (e.target.checked) {
                    field.setAttribute("type", "text");
                  } else {
                    field.setAttribute("type", "password");
                  }
                });
              }}
            />
            <label htmlFor="viewPass"> Lihat Password</label>
          </div>
          {errorMessage.status == "error" ? (
            <div
              className="p-4 mb-4 mt-4 text-sm text-red-800 rounded-lg bg-red-100"
              role="alert"
            >
              {errorMessage.message}
            </div>
          ) : null}
          <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary transition duration-200">
            Reset password
          </button>
        </form>
        <div className="text-center mt-6">
          <Link to="/auth/login">
            <i className="fas fa-arrow-left mr-2"></i>Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;
