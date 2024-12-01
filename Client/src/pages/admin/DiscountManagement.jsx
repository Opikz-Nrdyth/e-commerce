import { useEffect, useRef, useState } from "react";
import InputData from "../../components/admin/inputData";
import { UseDeleteData, UseGetData } from "../../services/service_api";
import { useToast } from "../../components/common/useToast";
import ModalDelete from "../../components/admin/modaldelete";

const DiscountManagement = () => {
  const [discount, setDiscount] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(null);

  // Delete Process
  const [openModal, setOpenModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [idDeleteCategories, setIdDeleteCategories] = useState(null);
  const { showToast, ToastComponent } = useToast();
  const [urlGet, setUrlGet] = useState("api/discounts?populate=*");
  const [sort, setSort] = useState("asc");

  const handleSort = (sortName) => {
    if (sort == "asc") {
      setUrlGet(`api/discounts?populate=*&sort=${sortName}:asc`);
      setSort("desc");
    } else {
      setUrlGet(`api/discounts?populate=*&sort=${sortName}:desc`);
      setSort("asc");
    }

    FetchData();
  };

  useEffect(() => {
    if (returnModal && idDeleteCategories) {
      const handleDelete = async () => {
        try {
          const response = await UseDeleteData(
            "api/discounts",
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

  const FetchData = async () => {
    const response = await UseGetData(urlGet);
    if (response.status == "success") {
      setDiscount(response.data.data);
    }
  };

  useEffect(() => {
    FetchData();
  }, []);

  const [dataInput, setDataInput] = useState({
    title: "Products",
    type: "add",
    data: [
      {
        name: "code",
        type: "text",
        defaultValue: "",
      },
      {
        name: "discount_percentage",
        type: "number",
        defaultValue: "",
      },
      {
        name: "start_date",
        type: "datetime",
        defaultValue: "",
      },
      {
        name: "end_date",
        type: "datetime",
        defaultValue: "",
      },
    ],
  });

  const [isInputData, setIsInputData] = useState(false);

  const handleEditData = (item) => {
    setDataInput((prev) => ({
      ...prev,
      type: "Edit",
      data: [
        {
          name: "id",
          type: "id",
          defaultValue: item.documentId,
        },
        {
          name: "code",
          type: "text",
          defaultValue: item.code,
        },
        {
          name: "discount_percentage",
          type: "number",
          defaultValue: item.discount_percentage,
        },
        {
          name: "start_date",
          type: "date",
          defaultValue: item.start_date,
        },
        {
          name: "end_date",
          type: "date",
          defaultValue: item.end_date,
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

  const formatedDateIndonesia = (dateString) => {
    const originalDate = new Date(dateString); // Format valid

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    // Menggunakan Intl.DateTimeFormat untuk memformat tanggal dalam bahasa Indonesia
    const formattedDate = new Intl.DateTimeFormat("id-ID", options).format(
      originalDate
    );

    return formattedDate;
  };

  const filteredDiscount = discount?.filter(
    (item) =>
      item?.start_date?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      item?.end_date?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className=" bg-white rounded-lg w-full shadow-lg sm:px-1 lg:px-6 py-4 ">
      {ToastComponent}

      <ModalDelete
        openModal={openModal}
        setOpenModal={setOpenModal}
        setReturnModal={setReturnModal}
        title={"Apakah Anda ingin diskon kategori ini?"}
      />
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        Daftar Diskon
      </h1>
      {/* Search */}
      <div className="relative m-[2px] mb-3 float-left">
        <label htmlFor="inputSearch" className="sr-only">
          Search{" "}
        </label>
        <input
          ref={searchRef}
          id="inputSearch"
          type="date"
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
      <button
        className="my-[2px] mb-3 mr-5 float-left text-white bg-secondary h-10 px-3 rounded-md hover:bg-secondary-subtle"
        onClick={() => {
          setSearchTerm("");
          searchRef.current.value = "";
        }}
      >
        clear
      </button>
      <div className="relative m-[2px] mb-3 float-right hidden sm:block">
        <button
          className="px-2 py-1 bg-success rounded-md hover:bg-success-subtle text-white"
          onClick={() => {
            setIsInputData(true);
          }}
        >
          <i className="fa-solid fa-plus"></i> Tambah Diskon
        </button>
      </div>
      <div className="w-full overflow-auto">
        <table className="min-w-full border-b-2">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-2 whitespace-nowrap">Diskon_id</th>
              <th className="px-4 py-2 whitespace-nowrap">Kode</th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("discount_percentage");
                }}
              >
                Presentase Diskon <i className="fa-solid fa-sort"></i>
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("start_date");
                }}
              >
                Mulai <i className="fa-solid fa-sort"></i>
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("end_date");
                }}
              >
                Selesai <i className="fa-solid fa-sort"></i>
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
            {filteredDiscount.length > 0 ? (
              filteredDiscount?.map((item, index) => (
                <tr className=" hover:bg-neutral" key={index}>
                  <td className="px-4 py-2">{item.documentId}</td>
                  <td className="px-4 py-2">{item.code}</td>
                  <td className="px-4 py-2">
                    {item.discount_percentage
                      ? `${item.discount_percentage}%`
                      : "0%"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatedDateIndonesia(item.start_date)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatedDateIndonesia(item.end_date)}
                  </td>
                  <td className="px-4 py-2">{formattedDate(item.createdAt)}</td>
                  <td className="px-4 py-2">{formattedDate(item.updatedAt)}</td>
                  <td className="px-4 py-2 flex gap-1 justify-center">
                    <button
                      className="bg-secondary hover:bg-secondary-subtle px-2 py-1 rounded-md"
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
                  Tidak ada diskon dalam database
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagenation
      <nav
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
          loadData={FetchData}
          pointing={"api/discounts"}
          refTarget={"api::discount.discount"}
        />
      ) : null}
    </div>
  );
};
export default DiscountManagement;
