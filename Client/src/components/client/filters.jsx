import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Filters = ({ setViewFilter }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filterSelect, setFilterSelect] = useState({
    rating: "",
    min: "",
    max: "",
  });

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilterSelect((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRatingChange = (e) => {
    setFilterSelect((prevState) => ({
      ...prevState,
      rating: e.target.value,
    }));
  };

  const handleSetFilter = () => {
    // Ambil query parameter yang ada
    const params = new URLSearchParams(location.search);

    // Menyusun string query baru
    let query = "";

    if (filterSelect.min > 0) {
      query += `min=${filterSelect.min}&`;
    }

    if (filterSelect.max > 0) {
      query += `max=${filterSelect.max}&`;
    }

    if (filterSelect.rating) {
      query += `rating=${filterSelect.rating}&`;
    }

    // Gabungkan dengan query parameter q jika ada
    if (params.has("q")) {
      query += `q=${params.get("q")}&`; // Menambahkan query q yang ada
    }

    // Menghapus tanda '&' terakhir jika ada
    query = query.slice(0, -1);

    // Navigasi ke URL dengan query parameter filter
    navigate(`/filter?${query}`);
    setViewFilter(false);
  };

  return (
    <nav>
      <nav>
        <p className="font-bold text-xl mb-2 text-gray-700">Harga</p>
        <div className="flex">
          <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
            Rp.
          </span>
          <input
            type="text"
            name="min"
            className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Harga Minimum"
            inputMode="numeric"
            value={filterSelect.min}
            onChange={handlePriceChange}
            pattern="[0-9]*"
            onKeyPress={(event) => {
              if (!/[0-9]/.test(event.key)) {
                event.preventDefault();
              }
            }}
            onPaste={(e) => {
              const pasteData = e.clipboardData.getData("text");
              if (!/^\d+$/.test(pasteData)) {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div className="flex mt-2">
          <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
            Rp.
          </span>
          <input
            type="text"
            name="max"
            className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Harga Maximum"
            inputMode="numeric"
            value={filterSelect.max}
            onChange={handlePriceChange}
            pattern="[0-9]*"
            onKeyPress={(event) => {
              if (!/[0-9]/.test(event.key)) {
                event.preventDefault();
              }
            }}
            onPaste={(e) => {
              const pasteData = e.clipboardData.getData("text");
              if (!/^\d+$/.test(pasteData)) {
                e.preventDefault();
              }
            }}
          />
        </div>

        <p className="font-bold text-xl my-2 text-gray-700">Rating</p>
        <div className="space-y-3">
          {/* Filter Bintang 5 */}
          <div className="flex items-center">
            <input
              type="radio"
              id="rating-5"
              name="rating"
              value="5"
              checked={filterSelect.rating === "5"}
              onChange={handleRatingChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
            />
            <label
              htmlFor="rating-5"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <div className="flex items-center mr-2">
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-yellow-500"></i>
              </div>
              <span>5 Bintang</span>
            </label>
          </div>

          {/* Filter Bintang 4 Keatas */}
          <div className="flex items-center">
            <input
              type="radio"
              id="rating-4-up"
              name="rating"
              value="4"
              checked={filterSelect.rating === "4"}
              onChange={handleRatingChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
            />
            <label
              htmlFor="rating-4-up"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <div className="flex items-center mr-2">
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-gray-300"></i>
              </div>
              <span>4 Bintang Keatas</span>
            </label>
          </div>

          {/* Filter Bintang 3 Keatas */}
          <div className="flex items-center">
            <input
              type="radio"
              id="rating-3-up"
              name="rating"
              value="3"
              checked={filterSelect.rating === "3"}
              onChange={handleRatingChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
            />
            <label
              htmlFor="rating-3-up"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <div className="flex items-center mr-2">
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-yellow-500"></i>
                <i className="fas fa-star text-gray-300"></i>
                <i className="fas fa-star text-gray-300"></i>
              </div>
              <span>3 Bintang Keatas</span>
            </label>
          </div>
        </div>

        <button
          className="bg-accent hover:bg-secondary w-[90%] py-2 ml-[5%] text-white mt-3 rounded-md"
          onClick={handleSetFilter}
        >
          Set Filter
        </button>
      </nav>
    </nav>
  );
};

export default Filters;
