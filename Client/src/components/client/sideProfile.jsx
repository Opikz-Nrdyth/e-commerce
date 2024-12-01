import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SideProfile = ({ visibalitySide, setVisibalitySide, setUserData }) => {
  const navigate = useNavigate();

  const cekMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent);
  };
  useEffect(() => {
    const visibility = cekMobile();
    setVisibalitySide(!visibility);
  }, []);
  return (
    <div
      className={`${
        visibalitySide ? "lg:w-[20%] sm:w-[60%] " : "lg:w-[4%] sm:w-[11%] "
      }bg-primary text-white h-screen py-6 shadow-lg fixed transition-all ease-in-out z-10`}
      id="sideProfile"
    >
      <button
        className="absolute right-0 top-0 text-2xl sm:text-sm bg-danger hover:bg-secondary p-1 rounded-l-md"
        onClick={() => {
          setVisibalitySide(!visibalitySide);
        }}
      >
        <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
      </button>
      {visibalitySide ? (
        <h2 className="text-2xl font-bold mb-6 px-6 sm:px-3">Profile User</h2>
      ) : null}
      <nav>
        <nav
          className="py-4 px-6 sm:px-3 hover:bg-secondary cursor-pointer"
          onClick={() => {
            navigate("/profile");
          }}
        >
          <i className="fas fa-user-circle mr-2"></i>{" "}
          {visibalitySide ? "Profil" : ""}
        </nav>

        <nav
          className="py-4 px-6 sm:px-3 hover:bg-secondary cursor-pointer"
          onClick={() => {
            navigate("/profile/alamat");
          }}
        >
          <i className="fa-solid fa-map-location-dot"></i>{" "}
          {visibalitySide ? "Alamat" : ""}
        </nav>

        <nav
          className="py-4 px-6 sm:px-3 hover:bg-secondary cursor-pointer"
          onClick={() => {
            navigate("/profile/myorder");
          }}
        >
          <i className="fas fa-shopping-cart mr-2"></i>{" "}
          {visibalitySide ? "Pesanan" : ""}
        </nav>

        <nav
          className="py-4 px-6 sm:px-3 hover:bg-secondary cursor-pointer"
          onClick={() => {
            navigate("/profile/setting");
          }}
        >
          <i className="fas fa-cog mr-2"></i>{" "}
          {visibalitySide ? "Pengaturan" : ""}
        </nav>
        <nav
          className="py-4 px-6 sm:px-3 hover:bg-danger cursor-pointer"
          onClick={() => {
            localStorage.removeItem("jwt");
            setUserData(null);
            navigate("/auth/login");
          }}
        >
          <i className="fas fa-sign-out-alt mr-2"></i>{" "}
          {visibalitySide ? "Keluar" : ""}
        </nav>
      </nav>
    </div>
  );
};
export default SideProfile;
