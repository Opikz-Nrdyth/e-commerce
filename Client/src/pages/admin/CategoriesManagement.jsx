import { useEffect, useState } from "react";
import InputData from "../../components/admin/inputData";
import { UseDeleteData, UseGetData } from "../../services/service_api";
import ModalDelete from "../../components/admin/modaldelete";
import { useToast } from "../../components/common/useToast";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Delete Process
  const [openModal, setOpenModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [idDeleteCategories, setIdDeleteCategories] = useState(null);
  const { showToast, ToastComponent } = useToast();
  const [urlGet, setUrlGet] = useState("api/categories?populate=*");
  const [sort, setSort] = useState("asc");

  const handleSort = (sortName) => {
    if (sort == "asc") {
      setUrlGet(`api/categories?populate=*&sort=${sortName}:asc`);
      setSort("desc");
    } else {
      setUrlGet(`api/categories?populate=*&sort=${sortName}:desc`);
      setSort("asc");
    }

    FetchData();
  };

  const FetchData = async () => {
    const response = await UseGetData(urlGet);
    if (response.status == "success") {
      setCategories(response.data.data);
    }
  };

  useEffect(() => {
    FetchData();
  }, []);

  const [dataInput, setDataInput] = useState({
    title: "Kategori",
    type: "add",
    data: [
      {
        name: "kategori_id",
        type: "id",
        defaultValue: "*****",
      },
      {
        name: "thumbnail",
        type: "file",
        accept: "images/jpeg, images/png, images/jpg",
        defaultValue: "",
      },
      {
        name: "name",
        type: "text",
        defaultValue: "",
      },
      {
        name: "discount_categories",
        type: "number",
        defaultValue: "",
      },
    ],
  });

  const [isInputData, setIsInputData] = useState(false);

  const handleEditData = (item) => {
    console.log(item);

    setDataInput((prev) => ({
      ...prev,
      type: "Edit",
      data: [
        {
          name: "documentId",
          type: "id",
          defaultValue: item?.documentId || "",
        },
        {
          name: "thumbnail",
          type: "file",
          accept: "images/jpeg, images/png, images/jpg",
          defaultValue: [item.thumbnail],
        },
        {
          name: "name",
          type: "text",
          defaultValue: item?.name,
        },
        ,
        {
          name: "discount_categories",
          type: "number",
          defaultValue: item?.discount_categories,
        },
      ],
    }));
    setIsInputData(true);
  };

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

  const filteredCategories = categories?.filter((item) =>
    item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  useEffect(() => {
    if (returnModal && idDeleteCategories) {
      const handleDelete = async () => {
        try {
          const response = await UseDeleteData(
            "api/categories",
            idDeleteCategories.documentId
          );
          setIdDeleteCategories(null);
          setReturnModal(false);
          if (response.status == "success") {
            showToast(`Berhasil menghapus kategori`, "success", 2000);
            FetchData();
          } else {
            showToast(
              `Gagal menghapus kategori: ${response.message}`,
              "danger",
              5000
            );
          }
        } catch (error) {
          // console.error("Error dalam menghapus product kategori:", error);
          showToast(`Error dalam menghapus kategori: ${error}`, "danger", 5000);
        }
      };

      // Panggil fungsi handleDelete
      handleDelete();
    }
  }, [returnModal, idDeleteCategories]);

  return (
    <div className=" bg-white rounded-lg w-full shadow-lg sm:px-1 lg:px-6 py-4 ">
      <ModalDelete
        openModal={openModal}
        setOpenModal={setOpenModal}
        setReturnModal={setReturnModal}
        title={"Apakah Anda ingin menghapus kategori ini?"}
      />
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        Daftar Kategori
      </h1>
      {/* Search */}
      <div className="relative m-[2px] mb-3 mr-5 float-left">
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
      <div className="relative m-[2px] mb-3 float-right hidden sm:block">
        <button
          className="px-2 py-1 bg-success rounded-md hover:bg-success-subtle text-white"
          onClick={() => {
            setIsInputData(true);
          }}
        >
          <i className="fa-solid fa-plus"></i> Tambah Kategori
        </button>
      </div>
      <div className="w-full overflow-auto">
        <table className="min-w-full border-b-2">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-2 whitespace-nowrap">Kategori_id</th>
              <th className="px-4 py-2 whitespace-nowrap">Thumbnail</th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("name");
                }}
              >
                Nama <i className="fa-solid fa-sort"></i>
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("discount_categories");
                }}
              >
                Diskon Kategori <i className="fa-solid fa-sort"></i>
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("createdAt");
                }}
              >
                Terbuat <i className="fa-solid fa-sort"></i>
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("updatedAt");
                }}
              >
                Update <i className="fa-solid fa-sort"></i>
              </th>
              <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories?.length > 0 ? (
              filteredCategories?.map((item, index) => (
                <tr className=" hover:bg-neutral" key={index}>
                  <td className="px-4 py-2">{item?.documentId}</td>
                  <td className="px-4 py-2">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}${
                        item?.thumbnail?.url
                      }`}
                      alt="foto"
                      className="w-[45px] h-[45px]"
                    />
                  </td>
                  <td className="px-4 py-2">{item?.name}</td>
                  <td className="px-4 py-2">
                    {item?.discount_categories
                      ? `${item?.discount_categories}%`
                      : "0%"}
                  </td>
                  <td className="px-4 py-2">
                    {formattedDate(item?.createdAt)}
                  </td>
                  <td className="px-4 py-2">
                    {formattedDate(item?.updatedAt)}
                  </td>
                  <td className="px-4 py-2 flex gap-1 justify-center">
                    <button
                      className="bg-secondary px-2 py-1 rounded-md"
                      onClick={() => {
                        handleEditData(item);
                      }}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      className="bg-danger px-2 py-1 rounded-md text-white"
                      onClick={() => {
                        setOpenModal(true);
                        setIdDeleteCategories(item);
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
                  Tidak ada kategori dalam database
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
      {ToastComponent}
      {isInputData ? (
        <InputData
          dataInput={dataInput}
          setIsInputData={setIsInputData}
          pointing={"api/categories"}
          loadData={FetchData}
          refTarget={"api::categori.categori"}
        />
      ) : null}
    </div>
  );
};
export default CategoriesManagement;
