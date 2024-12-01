import Navbar from "../components/client/Navbar";
import "../assets/stylesheets/landing.css";
import Sidebar from "../components/client/sidebar";
import Slideshow from "../components/client/slideshow";
import ProductItem from "../components/client/product";
import CursorTrail from "../components/common/cursorTrail";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Filters from "../components/client/filters";
import { UseGetData } from "../services/service_api";
import CartBox from "../components/client/cartBox";

const LandingPage = ({ categories, userData, setViewFilter, viewFilter }) => {
  const filterBox = useRef(null);
  const [viewCart, setViewCart] = useState(false);
  const [products, setProducts] = useState([]);
  const [urlProduct, setUrlProduct] = useState("api/products?populate=*");
  const [itemInCart, setItemInCart] = useState({});
  const params = useParams();
  const categoryTerm = params["*"];

  const FetchData = async () => {
    const { data } = await UseGetData(urlProduct);

    setProducts(data.data);
  };

  useEffect(() => {
    FetchData();
  }, []);

  useEffect(() => {
    if (filterBox.current) {
      if (viewFilter) {
        filterBox.current.style.display = "block";
      } else {
        filterBox.current.style.display = "none";
      }
    }
  }, [viewFilter]);

  const getFilterParams = (filterQuery) => {
    const defaultParams = {
      min: 0,
      max: Infinity,
      rating: 0,
    };

    if (!filterQuery) return defaultParams;

    if (typeof filterQuery === "string") {
      const searchParams = new URLSearchParams(filterQuery);
      return {
        min: searchParams.get("min")
          ? parseInt(searchParams.get("min"))
          : defaultParams.min,
        max: searchParams.get("max")
          ? parseInt(searchParams.get("max"))
          : defaultParams.max,
        rating: searchParams.get("rating")
          ? parseInt(searchParams.get("rating"))
          : defaultParams.rating,
      };
    }

    return {
      min: filterQuery.min ? parseInt(filterQuery.min) : defaultParams.min,
      max: filterQuery.max ? parseInt(filterQuery.max) : defaultParams.max,
      rating: filterQuery.rating
        ? parseInt(filterQuery.rating)
        : defaultParams.rating,
    };
  };

  function getAverageRating(reviews) {
    if (!reviews || !reviews.length) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }

  function parseFilterQuery(query) {
    const searchParams = new URLSearchParams(query);
    return {
      minPrice: searchParams.get("min") ? parseInt(searchParams.get("min")) : 0,
      maxPrice: searchParams.get("max")
        ? parseInt(searchParams.get("max"))
        : Infinity,
      rating: searchParams.get("rating")
        ? parseInt(searchParams.get("rating"))
        : 0,
      searchTerm: searchParams.get("q") || "", // Tambahkan searchTerm dari URL
    };
  }

  const filteredProducts = products?.filter((product) => {
    if (!product.categories || product.categories.length === 0) {
      return false;
    }

    const prices = product.product_variants.map((variant) =>
      parseInt(variant.price)
    );
    const lowestPrice = Math.min(...prices);

    const avgRating = getAverageRating(product.reviews);

    const { minPrice, maxPrice, rating, searchTerm } = parseFilterQuery(
      window.location.search
    );

    const filterUtama = product.categories.some((category) =>
      category.name
        .toLowerCase()
        .replaceAll(" ", "")
        .includes(categoryTerm?.toLowerCase() || "")
    );

    const filterNama =
      searchTerm.trim() === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());

    const filterPendukung =
      lowestPrice >= minPrice && lowestPrice <= maxPrice && avgRating >= rating;

    return minPrice || maxPrice || rating || searchTerm
      ? filterUtama && filterPendukung && filterNama
      : filterUtama && filterNama;
  });

  return (
    <nav>
      <CursorTrail />
      <Navbar
        setViewFilter={setViewFilter}
        viewFilter={viewFilter}
        categories={categories}
        userData={userData}
      />
      <Sidebar categories={categories} setViewFilter={setViewFilter} />
      <main className="w-full  lg:w-[77%] min-h-[100vh] h-fit  lg:ml-[22%] mt-[95px]">
        <Slideshow />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 px-2 md:grid-cols-2 lg:grid-cols-4">
          {filteredProducts?.map((item, index) => (
            <ProductItem
              key={`product-${index}`}
              setViewCart={setViewCart}
              item={item}
              setItemInCart={setItemInCart}
            />
          ))}
        </div>
        {/* Cartbox */}
        <CartBox
          viewCart={viewCart}
          setViewCart={setViewCart}
          products={itemInCart}
          userData={userData}
        />
        {/* Filter */}
        <div
          ref={filterBox}
          className="fixed p-4 bg-neutral sm:w-[83%] lg:w-[40%] h-fit sm:max-h-[470px] lg:max-h-[450px] border top-[50%] left-[0%] -translate-y-[40%] sm:translate-x-[10%] lg:translate-x-[80%] z-10 shadow-custom rounded-md"
        >
          <button
            className="absolute -right-3 -top-3 w-[30px] h-[30px] rounded-full bg-danger text-white"
            onClick={() => {
              setViewFilter(false);
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <p className="text-2xl font-bold text-center">Filter Produk</p>
          <Filters setViewFilter={setViewFilter} />
        </div>
      </main>
    </nav>
  );
};
export default LandingPage;
