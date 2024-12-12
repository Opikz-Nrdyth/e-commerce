import { useEffect, useState } from "react";
import { Outlet, Link, useParams, useNavigate } from "react-router-dom";
import { get_settings } from "../../services/fetch_settings";
import { UseGetData } from "../../services/service_api";

const AdminLayout = ({ userData, setUserData }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  if (!userData) {
    navigate("/auth/login");
  } else if (userData?.role?.name != "Admin") {
    localStorage.removeItem("jwt");
    setUserData(null);
    navigate("/auth/login");
  }

  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const path = useParams();
  const params = path["*"];
  const motherPath = params.split("/")[0];

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(
    window.innerWidth < 950
  );

  const fetchSettings = async () => {
    const settings = await get_settings();
    setSettings(settings);
  };

  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }

  const Pemasukan = async () => {
    const { data } = await UseGetData(
      "api/invoices?filters[orders][id][$gt]=0&populate=*"
    );

    // Hitung total pemasukan
    const pemasukan = data.data.reduce((total, invoice) => {
      const ordersPaid = invoice.orders.filter(
        (order) => order.payment_status === "Paid"
      );

      return ordersPaid?.length > 0 ? total + invoice.final_price : total;
    }, 0);
    setTotalPemasukan(pemasukan);
  };

  useEffect(() => {
    Pemasukan();
    fetchSettings();
  }, []);

  return (
    <div className="flex min-h-screen h-fit bg-base">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ease-in-out ${
          isSidebarMinimized ? "w-12" : "w-64"
        } bg-primary text-white py-5 px-0 space-y-6 transform hover:translate-x-0 fixed md:relative md:translate-x-0 top-0 left-0 bottom-0 shadow-lg z-10`}
      >
        {/* Logo */}
        {!isSidebarMinimized && (
          <div className="flex items-center space-x-2 px-2">
            <img
              src={settings?.thumbnail}
              alt="Logo"
              className="w-10 h-10 rounded-full"
            />
            <h2 className="text-2xl font-bold">Admin Panel</h2>
          </div>
        )}

        {/* Sidebar Links */}
        <nav className="mt-4">
          <ul>
            <li>
              <Link
                to="/admin/"
                className="block p-3 mb-4 hover:bg-primary-subtle transition-all duration-200"
              >
                <i className="fas fa-tachometer-alt mr-2"></i>
                {!isSidebarMinimized && "Dashboard"}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/product"
                className="block p-3 mb-4 hover:bg-primary-subtle transition-all duration-200"
              >
                <i className="fa-solid fa-shirt"></i>
                {!isSidebarMinimized && " Products"}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="block p-3 mb-4 hover:bg-primary-subtle transition-all duration-200"
              >
                <i className="fas fa-box mr-2"></i>
                {!isSidebarMinimized && "Orders"}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/customers"
                className="block p-3 mb-4 hover:bg-primary-subtle transition-all duration-200"
              >
                <i className="fas fa-users mr-2"></i>
                {!isSidebarMinimized && "Customers"}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/categories"
                className="block p-3 mb-4 hover:bg-primary-subtle transition-all duration-200"
              >
                <i className="fas fa-list-alt mr-2"></i>
                {!isSidebarMinimized && "Categories"}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/discounts"
                className="block p-3 mb-4 hover:bg-primary-subtle transition-all duration-200"
              >
                <i className="fas fa-tags mr-2"></i>
                {!isSidebarMinimized && "Discounts"}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/reviews"
                className="block p-3 mb-4 hover:bg-primary-subtle transition-all duration-200"
              >
                <i className="fas fa-star mr-2"></i>
                {!isSidebarMinimized && "Reviews"}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/slideshow"
                className="block p-3 mb-4 hover:bg-primary-subtle transition-all duration-200"
              >
                <i className="fas fa-images mr-2"></i>
                {!isSidebarMinimized && "SlideShow"}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className="block p-3 mb-4 hover:bg-primary-subtle transition-all duration-200"
              >
                <i className="fas fa-cogs mr-2"></i>
                {!isSidebarMinimized && "Settings"}
              </Link>
            </li>
          </ul>
        </nav>
        <button
          className="absolute -top-6 right-0 px-2 py-1 bg-secondary rounded-l-md hover:bg-accent"
          onClick={() => {
            setIsSidebarMinimized(!isSidebarMinimized);
          }}
        >
          <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col sm:ml-12 md:ml-0 w-60">
        {/* Navbar */}
        <header className="bg-accent text-white p-4 flex justify-between items-center shadow-lg">
          <div className="sm:text-sm md:text-base lg:text-xl font-semibold capitalize">
            <span className="sm:hidden md:inline">Admin</span>{" "}
            {params == "" ? "Dashboard" : motherPath}
          </div>
          <div className="flex items-center space-x-4 ">
            <p className="flex gap-2 items-center">
              <span className="text-gray-400">
                <i className="fa-solid fa-wallet"></i>{" "}
                <span className="sm:hidden lg:inline">Pemasukan:</span>
              </span>{" "}
              <span className="font-bold text-white sm:text-sm md:text-base xl:text-xl">
                {" "}
                {formatRupiah(totalPemasukan)}
              </span>
            </p>
            <button
              className="bg-danger text-white p-2 sm:text-sm md:text-base rounded-lg hover:bg-primary-subtle transition-all duration-200"
              onClick={() => {
                localStorage.removeItem("jwt");
                setUserData(null);
                navigate("/auth/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="sm:p-2 lg:p-6 flex-1 overflow-auto transition-all duration-300 ease-in-out">
          <h1 className="text-3xl font-bold mb-6 animate__animated animate__fadeIn">
            Welcome to the Admin Panel
          </h1>
          {/* The Outlet component will render the nested route components */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
