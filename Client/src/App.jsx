import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./pages/Landing";
import DetailProducts from "./pages/DetailProducts";
import Cart from "./pages/cart";
import CheckOut from "./pages/checkout";
import Invoice from "./pages/invoice";
import UserProfile from "./pages/userProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import OrdersManagement from "./pages/admin/OrderManagement";
import CostumersManagement from "./pages/admin/CostumerManagement";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import DiscountManagement from "./pages/admin/DiscountManagement";
import ReviewsManagement from "./pages/admin/ReviewsManagement";
import ProductsManagement from "./pages/admin/ProductsManagement";
import ShopSettings from "./pages/admin/ShopSettings";
import Login from "./pages/login";
import { useFetchData } from "./services/fetchData";
import { UseGetData } from "./services/service_api";
import ResetPage from "./pages/resetPage";
import SlideshowManagement from "./pages/admin/SlideshowManagement";
import { get_settings } from "./services/fetch_settings";

function App() {
  const [userData, setUserData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [viewFilter, setViewFilter] = useState(false);

  const fetchData = async () => {
    const response = await useFetchData();
    setUserData(response);
    try {
      const { data } = await UseGetData("api/categories?populate=*");
      if (data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
    const settings = get_settings();
    document
      .querySelector("link[rel=icon]")
      .setAttribute("href", settings?.thumbnail);
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/*" element={<Login userData={userData} />} />
      <Route
        path="/"
        element={
          <LandingPage
            categories={categories}
            userData={userData}
            setViewFilter={setViewFilter}
            viewFilter={viewFilter}
          />
        }
      />
      <Route
        path="/categories/*"
        element={
          <LandingPage
            categories={categories}
            userData={userData}
            setViewFilter={setViewFilter}
            viewFilter={viewFilter}
          />
        }
      />
      <Route
        path="/filter/*"
        element={
          <LandingPage
            categories={categories}
            userData={userData}
            setViewFilter={setViewFilter}
            viewFilter={viewFilter}
          />
        }
      />
      <Route
        path="/produk/*"
        element={
          <DetailProducts
            categories={categories}
            userData={userData}
            setViewFilter={setViewFilter}
            viewFilter={viewFilter}
          />
        }
      />
      <Route
        path="/keranjang/*"
        element={<Cart categories={categories} userData={userData} />}
      />
      <Route
        path="/checkout/*"
        element={<CheckOut categories={categories} dataClient={userData} />}
      />
      <Route
        path="/invoice/*"
        element={<Invoice categories={categories} userData={userData} />}
      />
      <Route
        path="/profile/*"
        element={
          <UserProfile
            userData={userData}
            fetchData={fetchData}
            categories={categories}
            setUserData={setUserData}
          />
        }
      />
      <Route
        path="/auth/forgot/*"
        element={<ResetPage userData={userData} />}
      />

      <Route
        path="/admin/*"
        element={<AdminLayout userData={userData} setUserData={setUserData} />}
      >
        {/* Admin Routes */}
        <Route path="" element={<AdminDashboard />} />
        <Route path="product" element={<ProductsManagement />} />
        <Route path="orders" element={<OrdersManagement />} />
        <Route path="customers" element={<CostumersManagement />} />
        <Route path="categories" element={<CategoriesManagement />} />
        <Route path="discounts" element={<DiscountManagement />} />
        <Route path="reviews" element={<ReviewsManagement />} />
        <Route path="slideshow" element={<SlideshowManagement />} />
        <Route path="settings" element={<ShopSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
