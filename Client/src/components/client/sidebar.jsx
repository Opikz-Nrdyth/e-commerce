import { useEffect, useRef, useState } from "react";
import Filters from "./filters";
import { useNavigate } from "react-router-dom";
import { UseGetData } from "../../services/service_api";

const Sidebar = ({ setViewFilter, categories }) => {
  const sidebar = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [lastTop, setLastTop] = useState(0); // Menyimpan posisi terakhir sebelum menjadi fixed
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (sidebar.current) {
        const rect = sidebar.current.getBoundingClientRect(); // Posisi elemen relatif terhadap viewport
        const sidebarHeight = sidebar.current.clientHeight; // Tinggi sidebar
        const viewportHeight = window.innerHeight; // Tinggi viewport

        // Cek apakah bagian bawah sidebar sudah mencapai bagian bawah viewport
        if (rect.bottom <= viewportHeight && !isFixed) {
          // Menjadi fixed jika bagian bawah sidebar sudah masuk viewport
          setLastTop(rect.top); // Menyimpan posisi terakhir sidebar
          setIsFixed(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isFixed]);

  useEffect(() => {
    // Fungsi untuk mengupdate posisi scroll dan log posisi scroll
    const handleScroll = () => {
      const newScrollY = window.scrollY;

      if (newScrollY < 50) {
        setIsFixed(false);
      }
    };

    // Menambahkan event listener saat komponen dipasang
    window.addEventListener("scroll", handleScroll);

    // Membersihkan event listener saat komponen dilepas
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const ChangePath = (name) => {
    let path = name.replaceAll(" ", "").toLowerCase();
    return `/categories/${path}`;
  };
  return (
    <div
      ref={sidebar}
      className="hidden lg:block absolute w-[10%] lg:w-[20%] top-[96px] left-[1%]"
      style={{
        position: isFixed ? "fixed" : "absolute",
        top: isFixed ? `${lastTop}px` : "96px", // Tetapkan top terakhir saat fixed atau 20vh saat absolute
      }}
    >
      <div className="bg-white rounded-md shadow-md">
        <p className="text-xl font-bold px-5 py-2 bg-secondary">
          <i className="fa-solid fa-list"></i>{" "}
          <span className="hidden lg:inline">KATEGORIES</span>
        </p>
        <div>
          {categories?.map((category, index) => (
            <nav
              key={index}
              className="flex items-center gap-3 px-4 py-3 text-black font-semibold transition duration-300 ease-in-out hover:bg-primary hover:text-white"
              onClick={() => navigate(ChangePath(category?.name))}
            >
              <img
                src={`${import.meta.env.VITE_BASE_URL}${
                  category?.thumbnail?.url
                }`}
                alt={category?.name}
                width="40px"
                height="60px"
              />
              <span className="hidden lg:block">{category?.name}</span>
            </nav>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-md mt-3 p-3 shadow-md">
        <Filters setViewFilter={setViewFilter} />
      </div>
    </div>
  );
};

export default Sidebar;
