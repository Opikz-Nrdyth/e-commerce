import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get_settings } from "../../services/fetch_settings";

const Navbar = ({ setViewFilter, viewFilter, categories, userData }) => {
  const [searchActive, setSearchActive] = useState(false);
  const navigate = useNavigate();
  const path = useParams();
  const params = path["*"];
  const [settings, setSettings] = useState(null);
  const desktop = window.screen.width > 900;

  const handleSearch = (value) => {
    // Ambil query parameters yang ada
    const currentParams = new URLSearchParams(window.location.search);

    // Perbarui atau tambahkan query 'q' dengan nilai baru
    currentParams.set("q", value);

    // Cek apakah pathnya adalah 'filter' dan arahkan URL dengan query parameters yang sudah ada
    if (params === "filter") {
      navigate(`?${currentParams.toString()}`);
    } else {
      // Jika bukan 'filter', arahkan ke URL utama dengan query parameters yang sudah ada
      navigate(`/?${currentParams.toString()}`);
    }

    // Menutup search setelah 400ms
    const timeout = setTimeout(() => {
      setSearchActive(false);
      clearTimeout(timeout);
    }, 400);
  };

  const ChangePath = (name) => {
    let path = name.replaceAll(" ", "").toLowerCase();
    return `/categories/${path}`;
  };

  // Mengacak array
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
  // Membatasi hanya 5 item
  const limitedCategories = desktop
    ? shuffledCategories.slice(0, 5)
    : categories;

  const fetchSettings = async () => {
    const response = await get_settings();
    setSettings(response);
  };
  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <header className="fixed z-20 w-[100%] top-0" id="header">
      {/* Navbar */}
      <nav className="flex justify-between px-3 items-center bg-primary h-[60px]">
        <div className="flex gap-2 items-center">
          <div
            className="w-[45px]"
            onClick={() => {
              navigate("/");
            }}
          >
            <img src={settings?.thumbnail} alt="Company logo" />
          </div>
          <p className="text-3xl font-bold text-white xs:hidden md:block">
            {settings?.shop_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="md:hidden sm:block text-white hover:bg-secondary hover:text-black w-[50px] h-[40px] text-xl transition duration-300 ease-in-out rounded-md"
            onClick={() => {
              setViewFilter(true);
            }}
          >
            <i className="fa-solid fa-filter"></i>
          </button>
          <button
            className=" text-white hover:bg-secondary hover:text-black w-[50px] h-[40px] text-xl transition duration-300 ease-in-out rounded-md"
            onClick={() => {
              setSearchActive(true);
            }}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          <button
            className=" text-white hover:bg-secondary hover:text-black w-[50px] h-[40px] text-xl transition duration-300 ease-in-out rounded-md"
            onClick={() => {
              navigate("/keranjang");
            }}
          >
            <i className="fa-solid fa-cart-shopping"></i>
          </button>
          <div
            className="w-[50px] h-[50px] aspect-square rounded-md cursor-pointer bg-white"
            onClick={() => {
              navigate("/profile");
            }}
          >
            <img
              src={
                userData?.profile?.url
                  ? `${import.meta.env.VITE_BASE_URL}${userData?.profile?.url}`
                  : userData?.profile_url
                  ? userData?.profile_url
                  : userData?.jenis_kelamin == "woman"
                  ? "/Images/user-woman.jpg"
                  : "/Images/user-man.jpg"
              }
              className="rounded-md object-cover w-full h-full"
              alt="User Profile"
            />
          </div>
        </div>
      </nav>
      {/* Categories */}
      <div className="w-full overflow-x-scroll md:overflow-x-hidden">
        <nav className="flex justify-center w-fit md:w-full bg-primary-subtle h-[34px]">
          <nav
            className="px-4 py-1 text-white hover:bg-secondary hover:text-black transition duration-300 ease-in-out whitespace-nowrap"
            onClick={() => {
              navigate(`/`);
            }}
          >
            Home
          </nav>
          {limitedCategories?.map((item, index) => (
            <nav
              className="px-4 py-1 text-white hover:bg-secondary hover:text-black transition duration-300 ease-in-out whitespace-nowrap"
              key={index}
              onClick={() => {
                navigate(`${ChangePath(item.name)}`);
              }}
            >
              {item.name}
            </nav>
          ))}
        </nav>
      </div>
      {/* Search */}
      {searchActive ? (
        <nav className="fixed w-[100%] h-[100vh] backdrop-blur-sm bg-white/20 top-0 z-30">
          <div className="w-full h-full flex justify-center items-center ">
            <input
              autoFocus
              className="w-[70%] lg:w-[40%] placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow focus:scale-125 transition duration-300 ease"
              placeholder="Cari Produk..."
              inputMode="search"
              onBlur={(e) => {
                handleSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  handleSearch(e.target.value);
                }
              }}
            />
          </div>
        </nav>
      ) : null}
    </header>
  );
};
export default Navbar;
