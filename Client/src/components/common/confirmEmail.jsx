import { Link, useNavigate } from "react-router-dom";
import {
  UseCreateData,
  UseGetData,
  UseUpdateData,
} from "../../services/service_api";
import { useState } from "react";
import axios from "axios";

const ConfirmEmail = () => {
  const [confirmUser, setConfirmUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    status: "success",
    message: "",
  });

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const formSubmited = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const email = formData.get("email");
      const confirm = formData.get("confirm");
      if (!email && email == "") {
        setErrorMessage({
          status: "error",
          message: "Masukan Email Yang Terdaftar",
        });
        return;
      }
      if (!confirmUser) {
        const payload = {
          identifier: email,
        };
        const fetchData = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/auth/login`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (fetchData.status == 200 && fetchData.data) {
          setErrorMessage({
            status: "success",
            message: "",
          });
          setConfirmUser(true);
          localStorage.setItem("jwt", fetchData.data.jwt);
          setUser(fetchData.data.user);
        } else {
          setErrorMessage({
            status: "error",
            message: "Email Tidak Ditemukan",
          });
        }
      } else {
        if (!user.username && !user.phone_number) {
          setErrorMessage({
            status: "error",
            message:
              "Anda tidak dapat menvalidasi akun anda harap hubungi costumer service",
          });
          return;
        } else if (confirm == "") {
          setErrorMessage({
            status: "error",
            message: "Harap isi semua bidang",
          });
        } else if (user.username == confirm || user.phone_number == confirm) {
          setErrorMessage({
            status: "success",
            message: "",
          });

          const expired = new Date();
          expired.setHours(expired.getHours() + 1);
          const options = {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
          };

          const formattedDate = new Intl.DateTimeFormat(
            "en-US",
            options
          ).format(expired);

          const newUserToken = {
            ...user,
            expired: formattedDate,
          };

          const resetPassToken = btoa(JSON.stringify(newUserToken));

          navigate(`password?token=${resetPassToken}`);
          return;
        } else {
          setErrorMessage({
            status: "error",
            message: "Informasi akun salah",
          });
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md sm:h-screen md:h-fit">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-300 p-4 rounded-full">
            <i className="fas fa-envelope text-primary text-2xl"></i>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-2">
          Masukan email anda
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Masukan email anda sebelumnya untuk menerima email konfirmasi
        </p>
        <form onSubmit={formSubmited}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              type="email"
              id="email"
              name="email"
              placeholder="Masukan email yang terdaftar"
            />
          </div>
          {confirmUser ? (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Username / Nomer Telephone
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                type="text"
                id="confirm"
                name="confirm"
                placeholder="Masukan username atau nomer telephone untuk mengkonfigurasi"
              />
            </div>
          ) : null}
          {errorMessage.status == "error" ? (
            <div
              className="p-4 mb-4 mt-4 text-sm text-red-800 rounded-lg bg-red-100"
              role="alert"
            >
              {errorMessage.message}
            </div>
          ) : null}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary transition duration-200"
          >
            {confirmUser ? "Konfigurasi Data Diri" : "Kirim Email"}
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
export default ConfirmEmail;
