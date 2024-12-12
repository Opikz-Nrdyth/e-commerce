import { useEffect, useState } from "react";
import { UseGetData } from "../../services/service_api";
import { Popover } from "flowbite-react";

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [urlGet, setUrlGet] = useState("api/reviews?populate=*");
  const [sort, setSort] = useState("asc");

  const handleSort = (sortName) => {
    if (sort == "asc") {
      setUrlGet(`api/reviews?populate=*&sort=${sortName}:asc`);
      setSort("desc");
    } else {
      setUrlGet(`api/reviews?populate=*&sort=${sortName}:desc`);
      setSort("asc");
    }

    FetchData();
  };

  const FetchData = async () => {
    const response = await UseGetData(urlGet);
    if (response.status == "success") {
      setReviews(response.data.data);
    }
  };

  useEffect(() => {
    FetchData();
  }, []);

  const formattedDate = (dateString) => {
    const date = new Date(dateString);

    // Format tanggal Indonesia: hari/bulan/tahun
    const newFormattedDate = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return `${newFormattedDate} ${formattedTime}`;
  };

  const filteredReview = reviews?.filter((item) =>
    item?.product_id?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className=" bg-white rounded-lg w-full shadow-lg sm:px-1 lg:px-6 py-4 ">
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        Daftar Review
      </h1>
      {/* Search */}
      <div className="relative m-[2px] mb-3 float-left">
        <label htmlFor="inputSearch" className="sr-only">
          Search{" "}
        </label>
        <input
          id="inputSearch"
          type="text"
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          placeholder="Search..."
          className="block w-64 rounded-lg border py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform">
          <i className="fa-solid fa-magnifying-glass"></i>
        </span>
      </div>
      <div className="w-full overflow-auto">
        <table className="min-w-full border-b-2">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-2 whitespace-nowrap">Review_id</th>
              <th className="px-4 py-2 whitespace-nowrap">Produk</th>
              <th className="px-4 py-2 whitespace-nowrap">Email</th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("rating");
                }}
              >
                Rating <i className="fa-solid fa-sort"></i>
              </th>
              <th className="px-4 py-2 whitespace-nowrap">Komentar</th>
              <th className="px-4 py-2 whitespace-nowrap">Foto</th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("createdAt");
                }}
              >
                Terbuat <i className="fa-solid fa-sort"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReview?.length > 0 ? (
              filteredReview.map((item, index) => (
                <tr className=" hover:bg-neutral" key={index}>
                  <td className="px-4 py-2">{item.documentId}</td>
                  <td className="px-4 py-2">{item?.product_id?.name}</td>
                  <td className="px-4 py-2">{item?.user_id?.email}</td>
                  <td className="px-4 py-2">
                    {Array.from({ length: 5 }, (_, index) => (
                      <i
                        key={index}
                        className={`fas fa-star ${
                          index < item.rating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      ></i>
                    ))}
                  </td>
                  <td className="px-4 py-2">
                    <Popover
                      placement="bottom"
                      title="Popover title"
                      content={
                        <p className="bg-white p-3 text-sm">{item.comment}</p>
                      }
                      trigger="hover"
                    >
                      <button className="text-white bg-secondary rounded-md text-sm px-2 py-1 text-center">
                        Deskripsi
                      </button>
                    </Popover>
                  </td>
                  <td className="px-4 py-2">
                    {item?.thumbnail && item?.thumbnail?.length > 1 ? (
                      <Popover
                        placement="auto"
                        title="Foto-foto"
                        content={
                          <div className="grid grid-cols-3 gap-2 p-2">
                            {item.thumbnail.map((photo, index) => (
                              <img
                                key={index}
                                src={`${import.meta.env.VITE_BASE_URL}${
                                  photo.url
                                }`}
                                alt={`foto-${index}`}
                                className="w-[150px] h-[150px] rounded-lg object-cover border border-gray-300 shadow-sm"
                              />
                            ))}
                          </div>
                        }
                        trigger="hover"
                      >
                        <div className="flex">
                          {item.thumbnail.slice(0, 5).map((photo, index) => (
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}${
                                photo.url
                              }`}
                              key={index}
                              alt="foto"
                              className={`w-[35px] h-[35px] ${
                                index > 0 ? "-ml-6" : ""
                              } cursor-pointer rounded-full border border-gray-300 shadow-sm`}
                            />
                          ))}
                        </div>
                      </Popover>
                    ) : (
                      <img
                        src={
                          item?.thumbnail?.[0]?.url
                            ? `${import.meta.env.VITE_BASE_URL}${
                                item?.thumbnail?.[0].url
                              }`
                            : "https://placehold.jp/3d4070/ffffff/150x150.png"
                        }
                        alt="Thubnail"
                        className="w-[45px] h-[45px] rounded-full border border-gray-300 shadow-sm"
                      />
                    )}
                  </td>
                  <td>{formattedDate(item?.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  Tidak ada Review dalam database
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagenation */}
      {/* <nav
        className="mt-5 flex items-center sm:justify-center lg:justify-between text-sm"
        aria-label="Page navigation example"
      >
        <p className="sm:hidden lg:block">
          Menampilkan <strong>25</strong> data
        </p>

        <ul className="list-style-none flex">
          <li>
            <a
              className="relative block rounded bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100"
              href="#!"
            >
              Previous
            </a>
          </li>
          <li>
            <a
              className="relative block rounded bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100"
              href="#!"
            >
              1
            </a>
          </li>
          <li aria-current="page">
            <a
              className="relative block rounded bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition-all duration-300"
              href="#!"
            >
              2
              <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
                (current)
              </span>
            </a>
          </li>
          <li>
            <a
              className="relative block rounded bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100"
              href="#!"
            >
              3
            </a>
          </li>
          <li>
            <a
              className="relative block rounded bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100"
              href="#!"
            >
              Next
            </a>
          </li>
        </ul>
      </nav> */}
    </div>
  );
};
export default ReviewsManagement;
