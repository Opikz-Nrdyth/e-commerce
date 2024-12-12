import { useEffect, useState } from "react";
import {
  UseDeleteData,
  UseGetData,
  UseUpdateData,
} from "../../services/service_api";
import { Popover } from "flowbite-react";
import { useNavigate, Link } from "react-router-dom";
import InvoicePaper from "../../components/common/invoicePaper";
import { useToast } from "../../components/common/useToast";

const OrdersManagement = () => {
  const [order, setOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTime, setFilterTime] = useState("today");
  const navigate = useNavigate();
  const [invoiceId, setInvoiceId] = useState("");
  const { showToast, ToastComponent } = useToast();
  const [urlGet, setUrlGet] = useState(
    "api/orders?populate[order_items][populate][product_variant][populate]=*&populate[user_id][populate][address][populate]=*&populate[invoice][populate]=*&populate[discount][populate]=*"
  );
  const [sort, setSort] = useState("asc");

  const handleSort = (sortName) => {
    if (sort == "asc") {
      setUrlGet(
        `api/orders?populate[order_items][populate][product_variant][populate]=*&populate[user_id][populate][address][populate]=*&populate[invoice][populate]=*&populate[discount][populate]=*&sort=${sortName}:asc`
      );
      setSort("desc");
    } else {
      setUrlGet(
        `api/orders?populate[order_items][populate][product_variant][populate]=*&populate[user_id][populate][address][populate]=*&populate[invoice][populate]=*&populate[discount][populate]=*
      ort=${sortName}:desc`
      );
      setSort("asc");
    }

    FetchData();
  };

  const FetchData = async () => {
    const { data } = await UseGetData(urlGet);

    setOrder(data.data);
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

  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }

  const getDateRange = (range) => {
    const now = new Date();
    let startDate = new Date(0); // Default ke 1970-01-01

    switch (range) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0)); // Hari ini
        break;
      case "this_week":
        const dayOfWeek = now.getDay();
        startDate = new Date(now.setDate(now.getDate() - dayOfWeek)); // Minggu ini
        break;
      case "this_month":
        startDate = new Date(now.setDate(1)); // Bulan ini
        break;
      case "3_months":
        startDate = new Date(now.setMonth(now.getMonth() - 3)); // 3 bulan lalu
        break;
      case "6_months":
        startDate = new Date(now.setMonth(now.getMonth() - 6)); // 6 bulan lalu
        break;
      case "1_year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)); // 1 tahun lalu
        break;
      default:
        startDate = new Date(0); // Default jika tidak ada filter waktu
    }

    return startDate;
  };

  const filteredOrder = order?.filter((item) => {
    const searchTermLower = searchTerm?.toLowerCase();
    const dateRange = getDateRange(filterTime); // Ambil range waktu berdasarkan filter

    // Cek apakah first_name atau last_name dari user cocok dengan searchTerm
    const userMatches =
      item?.user_id?.first_name?.toLowerCase()?.includes(searchTermLower) ||
      item?.user_id?.last_name?.toLowerCase()?.includes(searchTermLower);

    // Cek apakah nama produk induk cocok dengan searchTerm
    const productMatches = item?.order_items?.some((orderItem) =>
      orderItem?.product_variant?.product_id?.name
        ?.toLowerCase()
        ?.includes(searchTermLower)
    );

    // Cek apakah createdAt atau updatedAt dalam rentang waktu yang dipilih
    const timeMatches =
      new Date(item?.createdAt) >= dateRange ||
      new Date(item?.updatedAt) >= dateRange;

    // Filter berdasarkan user, produk, dan waktu
    return (userMatches || productMatches) && timeMatches;
  });

  const handleUpdateData = async (productId, status, resi = undefined) => {
    let payloadData;
    if (resi) {
      payloadData = {
        data: {
          order_status: status,
          tracking_number: resi,
        },
      };
    } else {
      payloadData = {
        data: {
          order_status: status,
        },
      };
    }

    const UpdateOrder = await UseUpdateData(
      "api/orders",
      productId,
      payloadData
    );

    if (UpdateOrder.status == "success") {
      FetchData();
    }
  };

  return (
    <div className=" bg-white rounded-lg w-full shadow-lg sm:px-1 lg:px-6 py-4 ">
      {ToastComponent}
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        Daftar Pesanan
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
      {/*  Filter*/}
      <div className="relative m-[2px] mb-3 float-right hidden sm:block">
        <label htmlFor="inputFilter" className="sr-only">
          Filter
        </label>
        <select
          id="inputFilter"
          onChange={(e) => {
            setFilterTime(e.target.value);
          }}
          className="block w-40 rounded-lg border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="today" selected>
            Hari ini
          </option>
          <option value="this_week">Minggu ini</option>
          <option value="this_month">Bulan Ini</option>
          <option value="3_months">3 Bulan</option>
          <option value="6_months">6 Bulan</option>
          <option value="1_year">1 Tahun</option>
        </select>
      </div>
      <div className="w-full overflow-auto">
        <table className="min-w-full border-b-2">
          <thead className="border-b-2">
            <tr className="bg-primary text-white">
              <th className="px-4 py-2 whitespace-nowrap" rowSpan="2">
                Resi / Order Id(#)
              </th>
              <th className="px-4 py-2 whitespace-nowrap" colSpan="2">
                Users
              </th>
              <th className="px-4 py-2 whitespace-nowrap" rowSpan="2">
                Products
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                rowSpan="2"
                onClick={() => {
                  handleSort("total_price");
                }}
              >
                Harga Total <i className="fa-solid fa-sort"></i>
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                rowSpan="2"
                onClick={() => {
                  handleSort("order_status");
                }}
              >
                Status <i className="fa-solid fa-sort"></i>
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                rowSpan="2"
                onClick={() => {
                  handleSort("createdAt");
                }}
              >
                Terbuat <i className="fa-solid fa-sort"></i>
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                rowSpan="2"
                onClick={() => {
                  handleSort("updatedAt");
                }}
              >
                Update <i className="fa-solid fa-sort"></i>
              </th>
              <th className="px-4 py-2 whitespace-nowrap" rowSpan="2">
                Invoice
              </th>
            </tr>
            <tr className="bg-primary-subtle text-white">
              <th className="px-4 py-2 whitespace-nowrap">User Id</th>
              <th className="px-4 py-2 whitespace-nowrap">Nama</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrder?.length > 0 ? (
              filteredOrder
                ?.filter((item) => item.order_status != "Cart")
                .map((item, index) => (
                  <tr className=" hover:bg-neutral" key={index}>
                    <td className="px-4 py-2">
                      {item?.tracking_number || `#${item?.documentId}`}
                    </td>
                    <td className="px-4 py-2">{item?.user_id?.username}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{`${item?.user_id?.first_name} ${item?.user_id?.last_name}`}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Popover
                        placement="bottom"
                        title="Popover title"
                        content={
                          <table className="min-w-full bg-neutral-subtle">
                            <thead className="bg-primary">
                              <tr className="text-white">
                                <th className="px-4 py-2">Nama Produk</th>
                                <th className="px-4 py-2">Variasi</th>
                                <th className="px-4 py-2">Color</th>
                                <th className="px-4 py-2">Quantity</th>
                                <th className="px-4 py-2">Size</th>
                                <th className="px-4 py-2">Harga</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item?.order_items?.map((order_item, i) => (
                                <tr key={i}>
                                  <td className="px-4 py-2">
                                    {
                                      order_item?.product_variant?.product_id
                                        ?.name
                                    }
                                  </td>
                                  <td className="px-4 py-2">
                                    {order_item?.product_variant?.Variant}
                                  </td>
                                  <td className="px-4 py-2">
                                    {order_item?.product_variant?.Color}
                                  </td>
                                  <td className="px-4 py-2">
                                    {order_item?.quantity}
                                  </td>
                                  <td className="px-4 py-2">
                                    {order_item?.product_variant?.Size}
                                  </td>

                                  <td className="px-4 py-2">
                                    {order_item?.product_variant?.price}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        }
                        trigger="hover"
                      >
                        <button className="text-white bg-secondary rounded-md text-sm px-2 py-1 text-center">
                          Pesanan Produk
                        </button>
                      </Popover>
                    </td>
                    <td className="px-4 py-2">
                      {formatRupiah(item?.total_price)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Popover
                        placement="auto"
                        title="Popover title"
                        content={
                          <div className="p-4">
                            {item.order_status == "Packed" ? (
                              <div className="flex flex-col">
                                <div className="relative m-[2px] mb-3 float-left">
                                  <label
                                    htmlFor="inputSearch"
                                    className="sr-only"
                                  >
                                    Nomer Resi
                                  </label>
                                  <input
                                    id="inputResi"
                                    type="text"
                                    placeholder="Nomer Resi"
                                    className="block w-64 rounded-lg border py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform">
                                    <i className="fa-solid fa-cash-register"></i>
                                  </span>
                                </div>
                                <button
                                  className="bg-primary hover:bg-primary-subtle px-2 py-1 text-white rounded-md"
                                  onClick={() => {
                                    const resi =
                                      document.getElementById(
                                        "inputResi"
                                      ).value;

                                    handleUpdateData(
                                      item.documentId,
                                      "Sent",
                                      resi
                                    );
                                  }}
                                >
                                  Ubah Status
                                </button>
                              </div>
                            ) : item.order_status == "Sent" ? (
                              <div className="flex flex-col">
                                <button
                                  className="bg-primary hover:bg-primary-subtle px-2 py-1 text-white rounded-md"
                                  onClick={() => {
                                    handleUpdateData(
                                      item.documentId,
                                      "Success"
                                    );
                                  }}
                                >
                                  Selesaikan Pesanan
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3">
                                <button
                                  className="bg-yellow-500 hover:bg-yellow-700 px-2 py-1 text-white rounded-md"
                                  onClick={() => {
                                    handleUpdateData(
                                      item.documentId,
                                      "Pending"
                                    );
                                  }}
                                >
                                  Pending Pesanan
                                </button>
                                <button
                                  className="bg-danger hover:bg-danger-subtle px-2 py-1 text-white rounded-md"
                                  onClick={() => {
                                    handleUpdateData(
                                      item.documentId,
                                      "Cancelled"
                                    );
                                  }}
                                >
                                  Batalkan Pesanan
                                </button>
                                <button
                                  className="bg-success hover:bg-success-subtle px-2 py-1 text-white rounded-md"
                                  onClick={() => {
                                    handleUpdateData(item.documentId, "Packed");
                                  }}
                                >
                                  Packing Pesanan
                                </button>
                              </div>
                            )}
                          </div>
                        }
                        trigger="click"
                      >
                        <button
                          className={`py-2 px-3 text-white rounded-md ${
                            item?.order_status === "Pending"
                              ? "bg-gray-500"
                              : item?.order_status === "Packed"
                              ? "bg-yellow-500"
                              : item?.order_status === "Sent"
                              ? "bg-blue-500"
                              : item?.order_status === "Success"
                              ? "bg-green-500"
                              : item?.order_status === "Cancelled"
                              ? "bg-red-500"
                              : ""
                          }`}
                        >
                          <i
                            className={`fas ${
                              item?.order_status === "Pending"
                                ? "fa-clock"
                                : item?.order_status === "Packed"
                                ? "fa-box"
                                : item?.order_status === "Sent"
                                ? "fa-shipping-fast"
                                : item?.order_status === "Success"
                                ? "fa-check"
                                : item?.order_status === "Cancelled"
                                ? "fa-times"
                                : ""
                            } mr-2`}
                          ></i>
                          {item?.order_status}
                        </button>
                      </Popover>
                    </td>

                    <td className="px-4 py-2">
                      {formattedDate(item?.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      {formattedDate(item?.updatedAt)}
                    </td>
                    <td className="px-4 py-2 flex gap-1 justify-center">
                      <Popover
                        placement="auto"
                        title="Popover title"
                        content={
                          <div className="container mx-auto max-w-3xl h-[600px] overflow-auto">
                            <InvoicePaper
                              invoiceId={item?.invoice?.documentId}
                            />
                          </div>
                        }
                        trigger="hover"
                      >
                        <button className="bg-success text-white px-2 py-1 rounded-md">
                          <i className="fa-solid fa-file-invoice"></i>
                        </button>
                      </Popover>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  Tidak ada pesanan dalam database
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
export default OrdersManagement;
