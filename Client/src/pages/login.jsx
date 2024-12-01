import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useFetchData } from "../services/fetchData";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { UseUpdateData } from "../services/service_api";
import { useToast } from "../components/common/useToast";

const Login = ({ userData }) => {
  const path = useParams();
  const params = path["*"];
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [statusLogin, setStatusLogin] = useState(true);

  const { ToastComponent, showToast } = useToast();

  function generateRandomUserId() {
    let result = "";
    for (let i = 0; i < 4; i++) {
      let randomDigit = Math.floor(Math.random() * 10); // Angka acak antara 0-9
      result += randomDigit; // Gabungkan digit ke hasil
    }
    return result;
  }

  function NameFormat(text) {
    return text
      .replace("_", " ")
      .split(" ") // Membagi teks menjadi array berdasarkan spasi
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Kapitalisasi huruf pertama setiap kata
      .join(" "); // Menggabungkan kembali menjadi string
  }

  const FormSubmited = async (e) => {
    e.preventDefault();
    setStatusLogin(true);

    // Ambil nilai input berdasarkan name
    const formData = new FormData(e.target);
    const identifier = formData.get("email");
    const password = formData.get("password");
    let postData = {
      identifier: identifier,
      password: password,
    };

    if (params === "register") {
      const username = formData.get("username");

      postData = {
        username: username,
        email: identifier,
        password: password,
      };
    }
    // Tentukan endpoint sesuai dengan params
    const endpoint =
      params === "login" ? "api/auth/local" : "api/auth/local/register"; // Menggunakan register jika params adalah "register"

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${endpoint}`,
        postData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setStatusLogin(true);
      localStorage.setItem("jwt", data.jwt);

      if (params == "register") {
        const payloadEdit = {
          first_name: username,
          last_name: "",
        };

        const updateData = await UseUpdateData(
          "api/users",
          data.user.id,
          payloadEdit
        );

        if (updateData.status == "success") {
          window.location.reload();
        } else {
          setStatusLogin(false);
        }
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.log("Error during submission:", error);
      setStatusLogin(false);
    }
  };

  useEffect(() => {
    setStatusLogin(true);
  }, []);

  useEffect(() => {
    if (userData) {
      if (userData?.role?.name == "Authenticated") {
        navigate("/");
      }
      if (userData?.role?.name == "Admin") {
        navigate("/admin");
      }
    }
  }, [userData]);

  const LoginWithGoogle = async (dataGoogle) => {
    setStatusLogin(true);
    const usernameData = dataGoogle.given_name + generateRandomUserId();
    let postData = {
      identifier: dataGoogle.email,
    };

    if (params === "register") {
      postData = {
        username: usernameData,
        email: dataGoogle.email,
        password: dataGoogle.sub,
      };
    }

    const endpoint =
      params === "login" ? "api/auth/login" : "api/auth/local/register";
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${endpoint}`,
        postData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setStatusLogin(true);
      localStorage.setItem("jwt", data.jwt);
      if (params == "register") {
        const payloadEdit = {
          first_name: NameFormat(dataGoogle.given_name) || "",
          last_name: NameFormat(dataGoogle.family_name) || "",
          profile_url: dataGoogle.picture,
        };

        const interval = setInterval(async () => {
          if (localStorage.jwt) {
            clearInterval(interval);

            const updateData = await UseUpdateData(
              "api/users",
              data.user.id,
              payloadEdit
            );

            if (updateData.status == "success") {
              window.location.reload();
            } else {
              setStatusLogin(false);
            }
          }
        }, 100);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.log("Error during submission:", error);
      showToast(error.response.data.error.message, "danger", 5000);
      setStatusLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      {ToastComponent}
      <div className="max-w-screen-xl lg:m-3 sm:m-4 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 lg:p-6 sm:p-12">
          <div>
            <img src="/Images/CompanyLogo.png" className="w-32 mx-auto" />
          </div>
          <div className="mt-5 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              {params === "login" ? "Sign in" : "Sign up"}
            </h1>
            <form className="w-full flex-1 mt-3" onSubmit={FormSubmited}>
              <div className="mx-auto max-w-xs">
                {params === "register" ? (
                  <input
                    name="username"
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-5"
                    type="text"
                    placeholder="Username"
                  />
                ) : null}
                <input
                  name="email"
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Email"
                />
                <div className="h-fit mt-5 relative">
                  <input
                    name="password"
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type={!showPassword ? "password" : "text"}
                    placeholder="Password"
                  />

                  <button
                    type="button"
                    className="absolute right-[10px] top-[50%] -translate-y-[50%]"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  >
                    {!showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15 12c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3zm9-.449s-4.252 8.449-11.985 8.449c-7.18 0-12.015-8.449-12.015-8.449s4.446-7.551 12.015-7.551c7.694 0 11.985 7.551 11.985 7.551zm-7 .449c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.885 14.988l3.104-3.098.011.11c0 1.654-1.346 3-3 3l-.115-.012zm8.048-8.032l-3.274 3.268c.212.554.341 1.149.341 1.776 0 2.757-2.243 5-5 5-.631 0-1.229-.13-1.785-.344l-2.377 2.372c1.276.588 2.671.972 4.177.972 7.733 0 11.985-8.449 11.985-8.449s-1.415-2.478-4.067-4.595zm1.431-3.536l-18.619 18.58-1.382-1.422 3.455-3.447c-3.022-2.45-4.818-5.58-4.818-5.58s4.446-7.551 12.015-7.551c1.825 0 3.456.426 4.886 1.075l3.081-3.075 1.382 1.42zm-13.751 10.922l1.519-1.515c-.077-.264-.132-.538-.132-.827 0-1.654 1.346-3 3-3 .291 0 .567.055.833.134l1.518-1.515c-.704-.382-1.496-.619-2.351-.619-2.757 0-5 2.243-5 5 0 .852.235 1.641.613 2.342z" />
                      </svg>
                    )}
                  </button>
                </div>
                <Link
                  to="/auth/forgot"
                  className="text-primary text-sm text-end"
                >
                  Lupa Password?
                </Link>
                {!statusLogin ? (
                  <div
                    className="p-4 mb-4 mt-4 text-sm text-red-800 rounded-lg bg-red-50"
                    role="alert"
                  >
                    <span className="font-medium">Login Gagal!</span> Cek
                    Kembali Username atau Password
                  </div>
                ) : null}
                <button
                  type="submit"
                  className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <svg
                    className="w-6 h-6 -ml-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  <span className="ml-3">
                    {params === "login" ? "Sign In" : "Sign Up"}
                  </span>
                </button>
              </div>
            </form>
            <div className="my-3 border-b text-center">
              <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                Or {params === "login" ? "Sign in" : "Sign up"} with e-mail
              </div>
            </div>
            <div className="flex flex-col items-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse?.credential);
                  LoginWithGoogle(decoded);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>

            <div className="text-center text-accent mt-3">
              {params === "login" ? (
                <p>
                  Belum punya akun?{" "}
                  <Link
                    to="register"
                    className="text-primary-subtle cursor-pointer"
                  >
                    Sign up Sekarang
                  </Link>
                </p>
              ) : (
                <p>
                  Sudah punya akun?{" "}
                  <Link
                    to="login"
                    className="text-primary-subtle cursor-pointer"
                  >
                    Sign in Sekarang
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
export default Login;
