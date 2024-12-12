import { useEffect, useState } from "react";
import {
  UseDeleteData,
  UseGetData,
  UseUpdateData,
} from "../../services/service_api";
import { Popover } from "flowbite-react";
import { useToast } from "../../components/common/useToast";

const CostumersManagement = () => {
  const [costumer, setCostumer] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTerm, setFilterTerm] = useState("Authenticated");
  const { showToast, ToastComponent } = useToast();
  const [urlGet, setUrlGet] = useState("api/users?populate=*");
  const [sort, setSort] = useState("asc");

  const handleSort = (sortName) => {
    if (sort == "asc") {
      setUrlGet(`api/users?populate=*&sort=${sortName}:asc`);
      setSort("desc");
    } else {
      setUrlGet(`api/users?populate=*&sort=${sortName}:desc`);
      setSort("asc");
    }

    FetchData();
  };

  const FetchData = async () => {
    const response = await UseGetData(urlGet);
    if (response.status == "success") {
      setCostumer(response.data);
    }
  };

  const setSettings = async (id, set, value) => {
    const payload = {
      [set]: value,
    };
    try {
      let response;
      if (set == "delete") {
        response = await UseDeleteData("api/users", id);
      } else {
        response = await UseUpdateData("api/users", id, payload);
      }
      if (response.status == "success") {
        FetchData();
        showToast("Berhasil Mengupdate User", "success", 2000);
      } else {
        showToast(`Gagal Mengupdate User ${response.message}`, "danger", 5000);
      }
    } catch (error) {
      showToast(`Gagal Mengupdate User ${error}`, "danger", 5000);
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

  const filteredCostumer = costumer.filter((item) => {
    const firstNameMatch = item.first_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const lastNameMatch = item.last_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const roleMatch = filterTerm
      ? item?.role?.name?.toLowerCase().includes(filterTerm.toLowerCase())
      : true;

    if (searchTerm == "") {
      return roleMatch;
    } else {
      return (firstNameMatch || lastNameMatch) && roleMatch;
    }
  });

  return (
    <div className=" bg-white rounded-lg w-full shadow-lg sm:px-1 lg:px-6 py-4 ">
      {ToastComponent}
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        Daftar Costumer
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
      {/*  Filter*/}
      <div className="relative m-[2px] mb-3 float-right hidden sm:block">
        <label htmlFor="inputFilter" className="sr-only">
          Filter
        </label>
        <select
          id="inputFilter"
          onChange={(e) => {
            setFilterTerm(e.target.value);
          }}
          className="block w-40 rounded-lg border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Semua</option>
          <option value="Authenticated" selected>
            Client
          </option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <div className="w-full overflow-auto">
        <table className="min-w-full border-b-2">
          <thead>
            <tr className="bg-primary text-white">
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("username");
                }}
              >
                user_id <i className="fa-solid fa-sort"></i>
              </th>
              <th className="px-4 py-2 whitespace-nowrap">Profile</th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("first_name");
                }}
              >
                Nama <i className="fa-solid fa-sort"></i>
              </th>
              <th className="px-4 py-2 whitespace-nowrap">Role</th>
              <th className="px-4 py-2 whitespace-nowrap">Email</th>
              <th className="px-4 py-2 whitespace-nowrap">Telephone</th>
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
            {filteredCostumer?.length > 0 ? (
              filteredCostumer?.map((item, index) => (
                <tr className=" hover:bg-neutral" key={index}>
                  <td className="px-4 py-2">{item?.username}</td>
                  <td className="px-4 py-2">
                    <img
                      src={
                        item?.profile?.url
                          ? `${import.meta.env.VITE_BASE_URL}${
                              item?.profile?.url
                            }`
                          : item?.profile_url
                          ? item?.profile_url
                          : item?.jenis_kelamin == "woman"
                          ? "/Images/user-woman.jpg"
                          : "/Images/user-man.jpg"
                      }
                      alt="foto"
                      className="w-[45px] h-[45px]"
                    />
                  </td>
                  <td className="px-4 py-2">{`${item?.first_name} ${item?.last_name}`}</td>
                  <td className="px-4 py-2">
                    <p
                      className={`${
                        item?.role?.name == "Admin"
                          ? "bg-secondary"
                          : "bg-primary"
                      } px-2 py-1 rounded-md text-white text-center`}
                    >
                      {item?.role?.name}
                    </p>
                  </td>
                  <td className="px-4 py-2">{item?.email}</td>
                  <td className="px-4 py-2">{item?.phone_number}</td>
                  <td className="px-4 py-2">
                    {formattedDate(item?.createdAt)}
                  </td>
                  <td className="px-4 py-2">
                    {formattedDate(item?.updatedAt)}
                  </td>
                  <td className="px-4 py-2">
                    <Popover
                      placement="auto"
                      title="Foto-foto"
                      content={
                        <div className="p-3 flex flex-col gap-2">
                          {item?.role?.name == "Admin" ? (
                            <button
                              className="bg-primary hover:bg-primary-subtle py-1 px-2 rounded-sm text-white"
                              onClick={() => {
                                setSettings(item.id, "role", 1);
                              }}
                            >
                              Jadikan Client
                            </button>
                          ) : (
                            <button
                              className="bg-secondary hover:bg-secondary-subtle py-1 px-2 rounded-sm text-white"
                              onClick={() => {
                                setSettings(item.id, "role", 3);
                              }}
                            >
                              Jadikan Admin
                            </button>
                          )}

                          {item.role.name != "Admin" ? (
                            item.blocked ? (
                              <button
                                className="bg-primary hover:bg-primary-subtle py-1 px-2 rounded-sm text-white"
                                onClick={() => {
                                  setSettings(item.id, "blocked", false);
                                }}
                              >
                                Buka Blokir
                              </button>
                            ) : (
                              <button
                                className="bg-danger hover:bg-danger-subtle py-1 px-2 rounded-sm text-white"
                                onClick={() => {
                                  setSettings(item.id, "blocked", true);
                                }}
                              >
                                Blokir
                              </button>
                            )
                          ) : null}

                          <button
                            className="bg-danger hover:bg-danger-subtle py-1 px-2 rounded-sm text-white"
                            onClick={() => {
                              setSettings(item.id, "delete", 0);
                            }}
                          >
                            Hapus Costumer
                          </button>
                        </div>
                      }
                      trigger="hover"
                    >
                      <button className="bg-secondary hover:bg-secondary-subtle py-1 px-2 rounded-md">
                        Aksi
                      </button>
                    </Popover>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  Tidak ada costumer dalam database
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
export default CostumersManagement;
