import { useEffect, useRef, useState } from "react";
import DetailProduk from "../components/client/detailProduct";
import Navbar from "../components/client/Navbar";
import ProductItem from "../components/client/product";
import Sidebar from "../components/client/sidebar";
import CursorTrail from "../components/common/cursorTrail";
import { UseGetData } from "../services/service_api";
import Filters from "../components/client/filters";

const DetailProducts = ({
  userData,
  categories,
  setViewFilter,
  viewFilter,
}) => {
  const [products, setProducts] = useState([]);
  const [urlProduct, setUrlProduct] = useState("api/products?populate=*");
  const filterBox = useRef(null);
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

  return (
    <nav>
      <CursorTrail />
      <Navbar
        categories={categories}
        setViewFilter={setViewFilter}
        viewFilter={viewFilter}
        userData={userData}
      />
      <Sidebar categories={categories} />
      <main className="w-full lg:w-[77%] min-h-[100vh] h-fit lg:ml-[22%] mt-[95px]">
        <DetailProduk userData={userData} />
        <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-2 mt-3 px-2  lg:grid-cols-4 mb-3">
          {products?.map((item, index) => (
            <ProductItem item={item} key={`product-${index}`} />
          ))}
        </div>
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
export default DetailProducts;
