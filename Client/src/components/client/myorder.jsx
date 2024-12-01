import { useEffect, useState } from "react";
import { UseGetData } from "../../services/service_api";
import { useNavigate } from "react-router-dom";
import Review from "./review";

const MyOrder = ({ userData }) => {
  const [filter, setFilter] = useState({
    filterQuery: "",
    filterValue: "",
    filterMethod: "",
  });
  const [showReview, setShowReview] = useState(false);
  const [dataReview, setDataReview] = useState({
    product_id: "",
    product_name: "",
    user_id: userData?.id,
  });

  const navigate = useNavigate();

  const [order, setOrder] = useState([]);
  const FetchData = async () => {
    const { data } = await UseGetData(
      `api/orders?filters[order_status][$ne]=Cart${
        filter.filterMethod != ""
          ? `&filters[${filter.filterQuery}][${filter.filterMethod}]=${filter.filterValue}`
          : ""
      }&filters[user_id][id][$eq]=${
        userData?.id
      }&populate[order_items][populate][product_variant][populate][product_id][populate]=thumbnail`
    );

    setOrder(ProcessData(data.data));
  };

  const ProcessData = (data) => {
    const newProductItems = data
      ?.filter((order) => order.order_items.length > 0)
      .map((order) =>
        order?.order_items.map((item) => {
          const variant = item?.product_variant;
          const product = variant?.product_id;

          return {
            documentId: order.documentId,
            product_name: product?.name,
            size: variant?.Size,
            variant: variant?.Variant,
            color: variant?.Cariant,
            id: item?.id,
            order_status: order?.order_status,
            payment_status: order?.payment_status,
            createdAt: item?.createdAt,
            updatedAt: item?.updatedAt,
            price: parseFloat(variant?.price), // Harga varian produk
            stock: parseInt(variant?.stock, 10), // Stok varian produk
            quantity: parseInt(item?.quantity),
            total: item?.quantity * parseFloat(variant?.price), // Total biaya berdasarkan kuantitas
            final_price: parseFloat(order?.total_price), // Harga total pesanan
            thumbnail: variant?.product_id?.thumbnail?.[0]?.url,
            product_id: variant?.product_id?.documentId,
          };
        })
      );

    return newProductItems;
  };

  const formatDate = (isoString, type = "date") => {
    const date = new Date(isoString);

    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    if (type == "date") {
      return `${day} ${month} ${year}`;
    } else if (type == "time") {
      return `${hours}:${minutes}:${seconds}`;
    } else {
      return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
    }
  };

  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  useEffect(() => {
    FetchData();
  }, [filter, userData]);

  useEffect(() => {
    if (userData) {
      setDataReview({
        product_id: "",
        product_name: "",
        user_id: userData?.id,
      });
    }
  }, [userData]);

  console.log(order);

  const handleCheckout = (orderItem) => {
    const documentIds = orderItem.map((order) => order.documentId);
    const queryString = `filters[documentId][$in]=${documentIds.join(
      "&filters[documentId][$in]="
    )}`;

    navigate(`/checkout/${queryString}`);
  };

  return (
    <nav>
      {/* <!-- Navigation Tabs --> */}

      <div className="flex mt-6 font-medium relative group overflow-auto w-full bg-neutral px-3">
        <div
          className="relative px-6 py-2 cursor-pointer group/item hover:text-secondary"
          onClick={() => {
            setFilter({
              filterQuery: "order_status",
              filterValue: "Cart",
              filterMethod: "$ne",
            });
          }}
        >
          <div className="flex items-center gap-2  transition-colors duration-300 whitespace-nowrap">
            Semua
          </div>
          {/* Garis hover untuk item */}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover/item:w-full"></span>
        </div>

        <div
          className="relative px-6 py-2 cursor-pointer group/item hover:text-secondary"
          onClick={() => {
            setFilter({
              filterQuery: "payment_status",
              filterValue: "Unpaid",
              filterMethod: "$eq",
            });
          }}
        >
          <div className="flex items-center gap-2 transition-colors duration-300 whitespace-nowrap">
            Belum dibayar
          </div>
          {/* Garis hover untuk item */}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover/item:w-full"></span>
        </div>

        <div
          className="relative px-6 py-2 cursor-pointer group/item hover:text-secondary"
          onClick={() => {
            setFilter({
              filterQuery: "order_status",
              filterValue: "Packed",
              filterMethod: "$eq",
            });
          }}
        >
          <div className="flex items-center gap-2 transition-colors duration-300 whitespace-nowrap">
            Sedang dikemas
          </div>
          {/* Garis hover untuk item */}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover/item:w-full"></span>
        </div>

        <div
          className="relative px-6 py-2 cursor-pointer group/item hover:text-secondary"
          onClick={() => {
            setFilter({
              filterQuery: "order_status",
              filterValue: "Sent",
              filterMethod: "$eq",
            });
          }}
        >
          <div className="flex items-center gap-2  transition-colors duration-300 whitespace-nowrap">
            Dikirim
          </div>
          {/* Garis hover untuk item */}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover/item:w-full"></span>
        </div>

        <div
          className="relative px-6 py-2 cursor-pointer group/item hover:text-secondary"
          onClick={() => {
            setFilter({
              filterQuery: "order_status",
              filterValue: "Success",
              filterMethod: "$eq",
            });
          }}
        >
          <div className="flex items-center gap-2  transition-colors duration-300 whitespace-nowrap">
            Selesai
          </div>
          {/* Garis hover untuk item */}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover/item:w-full"></span>
        </div>

        <div
          className="relative px-6 py-2 cursor-pointer group/item hover:text-secondary"
          onClick={() => {
            setFilter({
              filterQuery: "order_status",
              filterValue: "Cancelled",
              filterMethod: "$eq",
            });
          }}
        >
          <div className="flex items-center gap-2  transition-colors duration-300">
            Dibatalkan
          </div>
          {/* Garis hover untuk item */}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover/item:w-full"></span>
        </div>
      </div>
      {/* <!-- Search Bar --> */}
      {/* <div className="p-4">
        <div className="relative">
          <input
            className="w-full p-2 border rounded"
            placeholder="Kamu bisa cari berdasarkan No. Pesanan atau Nama Produk"
            type="text"
          />
          <i className="fas fa-search absolute top-3 right-3 text-gray-400"></i>
        </div>
      </div> */}
      {/* <!-- Order Details --> */}
      <nav className="flex flex-col gap-3">
        {order?.map((item, index) => (
          <nav key={index}>
            <div className="p-4 border-t bg-neutral">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-store text-gray-600"></i>
                  <span className="ml-2 text-gray-800 font-semibold">
                    {item?.[0]?.product_name}
                  </span>
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                  <button className="ml-4 text-secondary font-bold">
                    {item?.[0]?.order_status === "Pending" && (
                      <span className="py-2 px-3">
                        <i className="fas fa-clock mr-2"></i> Pending
                      </span>
                    )}
                    {item?.[0]?.order_status === "Packed" && (
                      <span className="py-2 px-3">
                        <i className="fas fa-box mr-2"></i> Packed
                      </span>
                    )}
                    {item?.[0]?.order_status === "Sent" && (
                      <span className="py-2 px-3">
                        <i className="fas fa-shipping-fast mr-2"></i> Sent
                      </span>
                    )}
                    {item?.[0]?.order_status === "Success" && (
                      <span className="py-2 px-3">
                        <i className="fas fa-check mr-2"></i> Success
                      </span>
                    )}
                    {item?.[0]?.order_status === "Cancelled" && (
                      <span className="py-2 px-3">
                        <i className="fas fa-times mr-2"></i> Cancelled
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-4">
                {/* product */}
                {item?.map((order_items, index) => (
                  <div
                    className={`flex gap-1 ${
                      item?.length > 1
                        ? index == item?.length - 1
                          ? "p-4 "
                          : "p-4 border-b-2"
                        : "px-4"
                    }`}
                  >
                    <img
                      alt={order_items.product_name}
                      className="w-20 h-20 sm:w-12 sm:h-12"
                      height="100"
                      src={`${import.meta.env.VITE_BASE_URL}${
                        order_items.thumbnail
                      }`}
                      width="100"
                    />
                    <div className="ml-4">
                      <h2 className="text-gray-800 font-semibold">
                        {order_items.product_name}
                      </h2>
                      <p className="text-gray-600">
                        Variasi:{" "}
                        {`${order_items.size ? order_items.size : ""}${
                          order_items.color ? " ," + order_items.color : ""
                        }${
                          order_items.variant ? ", " + order_items.variant : ""
                        }`}
                      </p>
                      <p className="text-gray-600">x{order_items.quantity}</p>
                    </div>
                    <div className="ml-auto text-gray-800 font-semibold mt-4 md:mt-0">
                      {formatRupiah(order_items.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* <!-- Order Summary --> */}
            {item?.[0]?.order_status == "Success" ? (
              <div className="p-4 bg-neutral border-t">
                <p className="text-gray-600">
                  Pesanan diterima pada tanggal
                  <span className="text-secondary font-bold">
                    {" "}
                    {formatDate(item?.[0]?.updatedAt)}
                  </span>
                </p>
              </div>
            ) : null}
            {/* <!-- Total and Actions --> */}
            <div className="p-4 bg-neutral border-t flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="text-gray-800 font-semibold">
                Total Pesanan:
                <span className="text-secondary">
                  {formatRupiah(item?.[0]?.final_price)}
                </span>
              </div>
              {item?.[0]?.order_status == "Success" &&
              item?.[0]?.payment_status == "Paid" ? (
                <div className="flex mt-4 md:mt-0">
                  <button
                    className="px-4 py-2 bg-secondary hover:bg-secondary-subtle text-white rounded"
                    onClick={() => {
                      setDataReview({
                        product_id: item?.[0]?.product_id,
                        product_name: item?.[0]?.product_name,
                        user_id: userData.id,
                      });
                      setShowReview(true);
                    }}
                  >
                    Nilai
                  </button>
                </div>
              ) : item?.[0]?.payment_status == "Unpaid" ? (
                <div className="flex mt-4 md:mt-0">
                  <button
                    className="px-4 py-2 bg-secondary hover:bg-secondary-subtle text-white rounded"
                    onClick={() => {
                      handleCheckout(item);
                    }}
                  >
                    Bayar Sekarang
                  </button>
                </div>
              ) : item?.[0]?.order_status == "Sent" ? (
                <div className="flex mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary-subtle text-white rounded">
                    Lacak Paket
                  </button>
                </div>
              ) : null}
            </div>
          </nav>
        ))}
      </nav>

      {userData && dataReview?.user_id ? (
        <Review
          show={showReview}
          setShow={setShowReview}
          dataReview={dataReview}
          setData={setDataReview}
        />
      ) : null}
    </nav>
  );
};
export default MyOrder;
