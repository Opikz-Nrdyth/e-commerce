import { useEffect, useState } from "react";
import {
  UseDeleteData,
  UseGetData,
  UseUpdateData,
} from "../../services/service_api";
import { Popover } from "flowbite-react";

import { Link } from "react-router-dom";
import InputData from "../../components/admin/inputData";
import { useToast } from "../../components/common/useToast";

const SlideshowManagement = () => {
  const [isInputData, setIsInputData] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const [SlideShows, setSlideShows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [urlGet, setUrlGet] = useState("api/slideshows?populate=*");
  const [sort, setSort] = useState("asc");
  const [dataInput, setDataInput] = useState({
    title: "Slide Show",
    type: "add",
    data: [
      {
        name: "slideshow_id",
        type: "id",
        defaultValue: "*****",
      },
      {
        name: "thumbnail",
        type: "file",
        accept: "images/jpeg, images/png, images/jpg",
        defaultValue: "",
        multipe: false,
      },
      {
        name: "shorturl",
        type: "text",
        defaultValue: "",
      },
      {
        name: "status_show",
        type: "select",
        defaultValue: ["active", "nonactive"],
        selected: "active",
      },
    ],
  });

  const handleSort = (sortName) => {
    if (sort == "asc") {
      setUrlGet(`api/slideshows?populate=*&sort=${sortName}:asc`);
      setSort("desc");
    } else {
      setUrlGet(`api/slideshows?populate=*&sort=${sortName}:desc`);
      setSort("asc");
    }

    FetchData();
  };

  const FetchData = async () => {
    const response = await UseGetData(urlGet);
    if (response.status == "success") {
      setSlideShows(response.data.data);
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

  const shortToName = (short) => {
    return short?.replaceAll("https://", "").replaceAll("http://", "");
  };

  const filteredSlideShow = SlideShows?.filter((item) =>
    item?.shorturl?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleEdit = (status_show, id, url) => {
    try {
      const payload = {
        data: {
          thumbnail: [url],
          status_show,
        },
      };

      const updateData = UseUpdateData("api/slideshows", id, payload);
      FetchData();

      showToast("Berhasil Merubah Status", "success", 2000);
    } catch (error) {
      showToast(`Gagal Merubah Status!! ${error}`, "danger", 5000);
    }
  };

  const handleDelete = (id) => {
    try {
      const updateData = UseDeleteData("api/slideshows", id);

      showToast("Berhasil Menghapus Status", "success", 2000);

      FetchData();
    } catch (error) {
      showToast(`Gagal Menghapus Status!! ${error}`, "danger", 5000);
    }
  };
  return (
    <div className=" bg-white rounded-lg w-full shadow-lg sm:px-1 lg:px-6 py-4 ">
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        Daftar SlideShow
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
      {/* Add Data */}
      <div className="relative m-[2px] mb-3 hidden float-right sm:block">
        <button
          className="px-2 py-1 bg-success rounded-md hover:bg-success-subtle text-white"
          onClick={() => {
            setIsInputData(true);
          }}
        >
          <i className="fa-solid fa-plus"></i> Tambah Slideshow
        </button>
      </div>
      <div className="w-full overflow-auto">
        <table className="min-w-full border-b-2">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-2 whitespace-nowrap">Slide_Id</th>
              <th className="px-4 py-2 whitespace-nowrap">Thumbnail</th>
              <th className="px-4 py-2 whitespace-nowrap">Shorturl</th>
              <th className="px-4 py-2 whitespace-nowrap">Status</th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("createdAt");
                }}
              >
                Terbuat <i className="fa-solid fa-sort"></i>
              </th>
              <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredSlideShow.length > 0 ? (
              filteredSlideShow.map((item, index) => (
                <tr className=" hover:bg-neutral" key={index}>
                  <td className="px-4 py-2">{item.documentId}</td>
                  <td className="px-4 py-2">
                    <img
                      src={
                        item?.thumbnail?.url
                          ? `${import.meta.env.VITE_BASE_URL}${
                              item?.thumbnail.url
                            }`
                          : "https://placehold.jp/3d4070/ffffff/150x150.png"
                      }
                      alt="Thubnail"
                      className="w-[45px] h-[45px] rounded-full border border-gray-300 shadow-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={item.shorturl}
                      className="px-2 py-1 text-primary hover:text-primary-subtle rounded-md"
                    >
                      {shortToName(item?.shorturl)}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Popover
                      placement="bottom"
                      title="Popover title"
                      content={
                        <div className="p-4">
                          <button
                            className="px-2 py-1 bg-success hover:bg-success-subtle text-white rounded-l-md"
                            onClick={() => {
                              handleEdit(
                                "active",
                                item.documentId,
                                item?.thumbnail?.id
                              );
                            }}
                          >
                            Aktifkan
                          </button>
                          <button
                            className="px-2 py-1 bg-danger hover:bg-danger-subtle text-white rounded-r-md"
                            onClick={() => {
                              handleEdit(
                                "nonactive",
                                item.documentId,
                                item?.thumbnail?.id
                              );
                            }}
                          >
                            Non Aktifkan
                          </button>
                        </div>
                      }
                      trigger="click"
                    >
                      <button
                        className={`px-2 py-1 ${
                          item.status_show == "active"
                            ? "bg-success"
                            : "bg-danger"
                        } text-white rounded-md`}
                      >
                        {item.status_show}
                      </button>
                    </Popover>
                  </td>
                  <td className="px-4 py-2">{item.createdAt}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-danger px-2 py-1 rounded-md text-white"
                      onClick={() => {
                        handleDelete(item.documentId);
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  Tidak ada Slide Show dalam database
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
      {isInputData ? (
        <InputData
          dataInput={dataInput}
          setIsInputData={setIsInputData}
          pointing={"api/slideshows"}
          loadData={FetchData}
          refTarget={"api::slideshow.slideshow"}
        />
      ) : null}
      {ToastComponent}
    </div>
  );
};
export default SlideshowManagement;
