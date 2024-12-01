import { useNavigate, useParams } from "react-router-dom";
import CursorTrail from "../components/common/cursorTrail";
import Navbar from "../components/client/Navbar";
import {
  UseCreateData,
  UseGetData,
  UseUpdateData,
} from "../services/service_api";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../components/common/useToast";
import { useCostOngkir, useFetchRajaOngkir } from "../services/fetchData";
import useSnapPayment from "../components/client/useSnapPayment";
import "../assets/stylesheets/checkout.css";
import payment_methods from "../utils/method_payment.json";
import { get_settings } from "../services/fetch_settings";
import useSpinner from "../components/common/spinner";

const CheckOut = ({ categories, dataClient }) => {
  const navigate = useNavigate();
  const [dataOrder, SetDataOrder] = useState([]);
  const [Voucher, setVoucher] = useState();
  const [voucerUsed, setVoucerUsed] = useState(null);
  const [VoucerInput, setVoucerInput] = useState("");
  const { showToast, ToastComponent } = useToast();
  const [urlGet, setUrlGet] = useState("");
  const [isPayment, setIsPayment] = useState(false);
  const [settings, setSettings] = useState({});
  const SnapEmbed = useSnapPayment();
  const { spinner, showSpinner, hideSpinner } = useSpinner();
  const params = useParams();
  const orderId = params["*"];
  const [loading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    province: "",
    city: "",
    complete_address: "",
    postal_code: "",
    phone: "",
    id: "",
  });

  const [shopAddress, setShopAddress] = useState(null);

  const [productCheckout, setProductCheckOut] = useState({
    quantity: 0,
    hargaTotal: 0,
    discount: 0,
    harga_akhir: 0,
    shipping_cost: 0,
    payment_method: "",
    token: null,
  });

  if (!dataClient) {
    navigate("/auth/login");
  }

  const FetchData = async () => {
    setIsLoading(true);
    const { data } = await UseGetData(urlGet);

    const NewDataOrder = processOrderItems(data.data);

    const vouchercode = await UseGetData(`api/Discounts`);
    if (vouchercode.status == "success") {
      setVoucher(vouchercode.data.data);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }

    SetDataOrder(NewDataOrder);
  };

  const FetchDataAlamat = async () => {
    setIsLoading(true);
    const data = await useFetchRajaOngkir(`city?id=${userData.city}`);
    if (
      data.rajaongkir.results.province &&
      data.rajaongkir.results.province != ""
    ) {
      setUserData((prevState) => ({
        ...prevState,
        province_name: data?.rajaongkir?.results?.province,
        city_name: data?.rajaongkir?.results?.city_name,
      }));
    }

    const formData = new FormData();
    formData.append("origin", shopAddress);
    formData.append("destination", userData.city);
    formData.append("weight", 1000);
    formData.append("courier", "jne");
    const cost = await useCostOngkir("cost", formData);

    cost?.rajaongkir?.results?.[0]?.costs?.map((item) => {
      if (item?.service == "REG") {
        setProductCheckOut((prevState) => ({
          ...prevState,
          shipping_cost: item?.cost[0].value,
          harga_akhir: productCheckout.harga_akhir + item?.cost[0].value,
        }));
      }
    });

    setIsLoading(false);
    return data.rajaongkir.results;
  };

  // format meubah angka ke format rupiah
  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  useEffect(() => {
    if (orderId.indexOf("filters") !== -1) {
      setUrlGet(
        `api/orders/?${orderId}&populate[user_id][populate][profile]=*&populate[user_id][populate][address]=*&populate[order_items][populate][product_variant][populate][product_id][populate]=*`
      );
    } else {
      setUrlGet(
        `api/orders/${orderId}?populate[user_id][populate][profile]=*&populate[user_id][populate][address]=*&populate[order_items][populate][product_variant][populate][product_id][populate]=*`
      );
    }

    FetchData();
  }, [orderId, urlGet]);

  useEffect(() => {
    if (dataOrder.length > 0) {
      const totalHarga = dataOrder.reduce(
        (acc, item) => acc + (item?.total_price || 0),
        0
      );

      setUserData({
        name: `${dataOrder?.[0]?.user_id?.first_name || ""} ${
          dataOrder?.[0]?.user_id?.last_name || ""
        }`,
        id: dataOrder?.[0]?.user_id?.documentId || "",
        province: dataOrder?.[0]?.user_id?.address?.province || "",
        city: dataOrder?.[0]?.user_id?.address?.city || "",
        complete_address:
          dataOrder?.[0]?.user_id?.address?.complete_address || "",
        postal_code: dataOrder?.[0]?.user_id?.address?.postal_code,
        phone: `${dataOrder?.[0]?.user_id?.phone_number || ""}`,
      });

      setProductCheckOut((prevState) => ({
        ...prevState,
        hargaTotal: totalHarga,
        quantity: 0,
        harga_akhir: totalHarga + productCheckout.shipping_cost,
        token: dataOrder.map((order) => order.token_payment),
      }));
    }
  }, [dataOrder]);

  useEffect(() => {
    if (!userData.city_name) {
      FetchDataAlamat();
    }

    const response = get_settings();
    setShopAddress(response?.shop_address);
  }, [userData]);

  const processOrderItems = (orders) => {
    // Pastikan orders bertipe array
    const ordersArray = Array.isArray(orders) ? orders : [orders];

    return ordersArray.map((singleOrder) => {
      const groupedItems = {};
      let harga_total = 0;

      // Loop untuk setiap order item dalam singleOrder
      singleOrder?.order_items?.forEach((item) => {
        if (!groupedItems[item?.product_variant?.product_id?.documentId]) {
          groupedItems[item?.product_variant?.product_id?.documentId] = {
            ...item,
            product_name: item?.product_variant?.product_id?.name,
            thumbnail: item?.product_variant?.product_id?.thumbnail[0],
            variasi_product: [
              {
                ...item?.product_variant,
                quantity: item?.quantity,
                orderItemId: item?.documentId,
              },
            ],
          };
        } else {
          groupedItems[
            item?.product_variant?.product_id?.documentId
          ].variasi_product.push({
            ...item?.product_variant,
            quantity: item?.quantity,
            orderItemId: item?.documentId,
          });
        }

        const harga_total_variant =
          item?.product_variant?.price * item?.quantity;

        const discountCategories =
          item?.product_variant?.product_id?.categories?.map(
            (item) => item.discount_categories
          );

        const maxDiscount = Math.max(...discountCategories);
        const variantDiscount = (harga_total_variant * maxDiscount) / 100;

        harga_total = harga_total + (harga_total_variant - variantDiscount);
      });

      return {
        ...singleOrder,
        total_price: harga_total,
        harga_akhir: harga_total,
        discount: 0,
        order_items: Object.values(groupedItems),
      };
    });
  };

  const cekPromo = () => {
    console.log(Voucher);

    Voucher.map((item) => {
      const startDate = new Date(item.start_date);
      const endDate = new Date(item.end_date);
      const now = new Date();

      if (
        item?.code == VoucerInput &&
        now >= startDate &&
        now <= endDate &&
        !voucerUsed
      ) {
        setProductCheckOut((prevState) => {
          const hargaAkhir = parseInt(prevState.hargaTotal) || 0;
          const discountPercentage = parseInt(item?.discount_percentage) || 0;
          const discount = (hargaAkhir * discountPercentage) / 100;

          return {
            ...prevState,
            discount: discountPercentage,
            harga_akhir: hargaAkhir - discount + prevState.shipping_cost,
          };
        });

        showToast("Berhasil Memakai Kode Promo", "success", 2000);
        setVoucerUsed(item?.documentId);
      } else {
        showToast("Kode Promo Tidak Valid", "warning", 5000);
      }
    });
  };

  const handleCheckout = async () => {
    function truncateText(text, maxLength = 50) {
      return text?.length || 0 > maxLength ? text.slice(0, maxLength) : text;
    }
    if (
      !userData.province ||
      !userData.city ||
      !userData.complete_address ||
      !userData.phone ||
      (!dataClient.first_name && !dataClient.last_name)
    ) {
      showToast("Mohon Lengkapi Data Diri", "warning", 5000);
      return;
    }

    let tokenCheck = false;

    dataOrder.map((item) => {
      if (item.token) {
        tokenCheck == true;
      }
    });

    if (
      !tokenCheck &&
      (!productCheckout.payment_method || productCheckout.payment_method == "")
    ) {
      showToast("Mohon isi metode pembayaran", "warning", 5000);
      return;
    }
    setIsPayment(true);
    try {
      let orderId = [];
      let order_price = [];
      const itemsDetail = [];

      for (const orders of dataOrder) {
        orderId.push(orders.documentId);
        order_price.push(orders.harga_akhir);

        for (const orderItems of orders.order_items) {
          for (const item of orderItems.variasi_product) {
            // Mencari Diskon Dari Kategori
            const harga_total_variant = item?.price * item?.quantity;
            const discountCategories =
              orderItems?.product_variant?.product_id?.categories?.map(
                (item) => item.discount_categories
              );
            const maxDiscount = Math.max(...discountCategories);
            const variantDiscount = (harga_total_variant * maxDiscount) / 100;

            // Membuat Payload
            const oi = {
              id: item.documentId,
              price: parseInt(item.price) - parseInt(variantDiscount),
              quantity: item.quantity,
              name: `${truncateText(item.product_id.name, 20)} (${
                truncateText(item.Color, 10) || ""
              } ${truncateText(item.Size, 10) || ""} ${
                truncateText(item.Variant, 10) || ""
              })`,
            };

            itemsDetail.push(oi);

            const payloadOrderItem = {
              data: { quantity: item.quantity },
            };

            setIsLoading(true);
            const orderItemPut = await UseUpdateData(
              "api/order-items",
              item.orderItemId,
              payloadOrderItem
            );
            setIsLoading(false);

            if (orderItemPut.status !== "success") {
              showToast(orderItemPut.message, "danger", 5000);
              return; // Hentikan proses jika ada error
            }

            // Tambahkan jeda kecil antara setiap update (opsional)
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        const payloadData = {
          data: {
            order_status: "Pending",
            total_price: orders.total_price,
            payment_status: "Unpaid",
            discount: [voucerUsed || null],
          },
        };

        setIsLoading(true);
        const orderOrder = await UseUpdateData(
          "api/orders",
          orders.documentId,
          payloadData
        );

        setIsLoading(false);

        if (orderOrder.status !== "success") {
          showToast(orderOrder.message, "danger", 5000);
          return;
        }
      }

      if (productCheckout.discount > 0) {
        let discountOrder = 0;
        console.log(itemsDetail);

        for (const item of itemsDetail) {
          discountOrder -=
            item.price * (productCheckout.discount / 100) * item.quantity;
        }
        const discounts = {
          id: "discountVoucher",
          name: "Diskon Voucher",
          price: discountOrder,
          quantity: 1,
        };

        itemsDetail.push(discounts);
      }

      const ongkir = {
        id: "ongkosKirim",
        name: "Ongkos Kirim",
        price: productCheckout.shipping_cost,
        quantity: 1,
      };

      const ongkirExists = itemsDetail.some((item) => item.id === ongkir.id);

      if (!ongkirExists) {
        itemsDetail.push(ongkir);
      }

      if (productCheckout.harga_akhir == 0) {
        const biayaLayanan = {
          id: "biayaLayanan",
          name: "Biaya Layanan",
          price: 10,
          quantity: 1,
        };

        const layananExists = itemsDetail.some(
          (item) => item.id === biayaLayanan.id
        );

        if (!layananExists) {
          itemsDetail.push(biayaLayanan);
        }
      }

      const payload = {
        data: {
          orders: orderId,
          user: [userData.id],
          final_price: parseInt(productCheckout.harga_akhir),
          normal_price: parseInt(productCheckout.hargaTotal),
          discount: parseInt(productCheckout.discount),
          shipping_cost: parseInt(productCheckout.shipping_cost),
          payment_method: productCheckout.payment_method,
        },
      };

      setIsLoading(true);
      const Invoice = await UseCreateData("api/invoices", payload);
      setIsLoading(false);

      if (Invoice.status !== "success") {
        showToast(Invoice.message, "danger", 5000);
        return;
      }

      showToast("Lakukan pembayaran sekarang", "success", 2000);

      if (productCheckout?.token && productCheckout?.token?.[0] == null) {
        console.log(productCheckout.harga_akhir);

        const payloadPayment = {
          orderId: `order-${Invoice.data.data.documentId}`,
          grossAmount:
            Math.round(productCheckout.harga_akhir) === 0
              ? 10
              : Math.round(productCheckout.harga_akhir),
          customerDetails: {
            first_name: dataClient.first_name,
            last_name: dataClient.last_name,
            email: dataClient.email,
            phone: dataClient.phone_number,
          },
          item_detail: itemsDetail,
          payment_selected: [productCheckout.payment_method],
        };

        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsLoading(true);
        const paymentResponse = await UseCreateData(
          "api/transactions",
          payloadPayment
        );
        setIsLoading(false);

        if (paymentResponse.status !== "success") {
          showToast(
            `Gagal memproses pembayaran: ${paymentResponse.message}`,
            "danger",
            5000
          );
          setIsPayment(false);
          return;
        }

        let snapToken = paymentResponse?.data?.token || null;
        if (!snapToken) {
          showToast("Respon pembayaran tidak valid", "danger", 5000);
          setIsPayment(false);
          return;
        }

        SnapEmbed(snapToken, "snap-embed-container", {
          onSuccess: async (result) => {
            console.log("Pembayaran sukses", result, Invoice.data.documentId);
            showToast("Berhasil membeli produk", "success", 2000);
            setIsPayment(false);
            onPayment("success", null, Invoice.data.data.documentId);
          },
          onPending: (result) => {
            console.log("Pembayaran pending", result);
            showToast("Pembayaran Pending", "warning", 5000);
            setIsPayment(false);
            onPayment("pending", snapToken);
          },
          onClose: () => {
            console.log("Pembayaran ditutup oleh pengguna");
            setIsPayment(false);
            onPayment("pending", snapToken);
          },
        });
      } else {
        let snapToken = productCheckout.token[0];
        if (!snapToken) {
          showToast("Tidak ada token tersedia", "danger", 5000);
          setIsPayment(false);
          return;
        }

        SnapEmbed(snapToken, "snap-embed-container", {
          onSuccess: async (result) => {
            console.log("Pembayaran sukses", result, Invoice.data.documentId);
            showToast("Berhasil membeli produk", "success", 2000);
            setIsPayment(false);
            onPayment("success", null, Invoice.data.data.documentId);
          },
          onPending: (result) => {
            console.log("Pembayaran pending", result);
            showToast("Pembayaran Pending", "warning", 5000);
            setIsPayment(false);
            onPayment("pending", snapToken);
          },
          onClose: () => {
            console.log("Pembayaran ditutup oleh pengguna");
            setIsPayment(false);
            onPayment("pending", snapToken);
          },
        });
      }
    } catch (error) {
      console.log(error);
      showToast(`Gagal Membeli Produk! ${error}`, "danger", 5000);
    }
  };

  // Fungsi meng
  const onPayment = async (status, token = null, InvoiceId = null) => {
    let payloadData;
    dataOrder.forEach(async (orders) => {
      if (status == "success") {
        payloadData = {
          data: {
            order_status: "Packed",
            payment_status: "Paid",
          },
        };
      } else {
        payloadData = {
          data: {
            token_payment: token,
          },
        };
      }

      setIsLoading(true);
      const UpdateOrder = await UseUpdateData(
        "api/orders",
        orders.documentId,
        payloadData
      );
      setIsLoading(false);

      if (UpdateOrder.status == "success") {
        if (status == "success") {
          showToast("Berhasil Melakukan Pembayaran", "success", 5000);
          navigate(`/invoice/${InvoiceId}`);
        }
      }
    });
  };

  useEffect(() => {
    if (loading) {
      showSpinner();
    } else {
      hideSpinner();
    }
  }, [loading]);

  return (
    <nav>
      {spinner}
      <CursorTrail />
      <Navbar categories={categories} userData={dataClient} />
      <div className="container mx-auto p-4 md:p-6 max-w-6xl mt-[95px]">
        {/* <!-- Progress Bar --> */}
        <div className="mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/Images/CompanyLogo.png" alt="Company Logo" />
            </div>
            <div className="ml-2 text-primary font-bold text-xl">Checkout</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* <!-- Kolom Kiri --> */}
          <div className="lg:col-span-2 space-y-6">
            {/* <!-- Alamat Pengiriman --> */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-accent">
                  Alamat Pengiriman
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative">
                    <p className="absolute -top-[10px] bg-white left-3 text-sm text-primary">
                      Nama Lengkap
                    </p>
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={userData.name}
                      readOnly
                      className="flex-1 p-3 border border-neutral-subtle rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="relative">
                    <p className="absolute -top-[10px] bg-white left-3 text-sm text-primary">
                      Telephone
                    </p>
                    <input
                      type="tel"
                      placeholder="Nomor Telepon"
                      value={userData.phone}
                      readOnly
                      className="flex-1 p-3 border border-neutral-subtle rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="relative">
                  <p className="absolute -top-[10px] bg-white left-3 text-sm text-primary">
                    Alamat Lengkap
                  </p>
                  <textarea
                    placeholder="Alamat Lengkap"
                    rows="3"
                    value={`${userData.complete_address || ""}, ${
                      userData.city_name || ""
                    }, ${userData.province_name || ""}, ${
                      userData.postal_code || ""
                    }`}
                    readOnly
                    className="w-full p-3 border border-neutral-subtle rounded-lg focus:outline-none focus:border-primary"
                  ></textarea>
                </div>
              </div>
              <button className="bg-primary hover:bg-primary-subtle px-3 py-2 rounded-md text-white mt-2">
                Tambah Alamat
              </button>
            </div>

            {/* <!-- Daftar Produk --> */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-accent mb-4">
                Produk yang Dibeli
              </h2>
              <div className="space-y-4">
                {dataOrder.map((orders, idx) =>
                  orders?.order_items?.map((item, index) => (
                    <div
                      className="border-b p-4 mb-6 bg-neutral rounded-lg"
                      key={index}
                    >
                      <div className="mb-4 flex justify-between">
                        <div className="flex items-center">
                          <p className="text-lg text-accent font-bold">
                            {item?.product_name || ""}
                          </p>
                        </div>
                      </div>

                      {item?.variasi_product.map((variant, i) => (
                        <div
                          className="mb-1 bg-neutral-subtle rounded-md flex justify-between"
                          key={i}
                        >
                          <div className="border rounded-lg p-4 flex items-center w-full">
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}${
                                item?.thumbnail?.url || ""
                              }`}
                              alt={
                                item?.product_variant?.product_id?.name || ""
                              }
                              className="w-20 h-20 object-cover rounded-lg shadow-md mr-4"
                            />
                            <div className="flex-grow">
                              <h3 className="text-lg font-semibold text-accent">
                                {variant.Color || ""}{" "}
                                {variant.Size ? `- Ukuran ${variant.Size}` : ""}
                                {variant.Variant ? `- ${variant.Variant}` : ""}
                              </h3>
                              <p className="text-gray-600">
                                {formatRupiah(variant.price)}
                              </p>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={variant?.quantity || ""}
                                min="1"
                                className="w-16 p-1 rounded-md text-center mt-2 outline-none"
                                onInput={(e) =>
                                  (e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  ))
                                }
                                onChange={(e) => {
                                  const newQuantity = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  SetDataOrder((prevOrder) =>
                                    prevOrder.map((order) => {
                                      if (order === orders) {
                                        const updatedOrderItems =
                                          order.order_items.map((orderItem) => {
                                            if (
                                              orderItem?.product_variant
                                                .product_id?.documentId ===
                                              item?.product_variant?.product_id
                                                .documentId
                                            ) {
                                              const updatedVariasiProduct =
                                                orderItem?.variasi_product.map(
                                                  (variantItem) =>
                                                    variantItem?.id ===
                                                    variant.id
                                                      ? {
                                                          ...variantItem,
                                                          quantity: newQuantity,
                                                        }
                                                      : variantItem
                                                );
                                              return {
                                                ...orderItem,
                                                quantity: newQuantity,
                                                variasi_product:
                                                  updatedVariasiProduct,
                                              };
                                            }
                                          });

                                        // Hitung total_price baru untuk order
                                        const newTotalPrice =
                                          updatedOrderItems.reduce(
                                            (total, orderItem) =>
                                              total +
                                              orderItem?.variasi_product.reduce(
                                                (itemTotal, variantItem) =>
                                                  itemTotal +
                                                  variantItem?.price *
                                                    (variantItem?.quantity ||
                                                      0),
                                                0
                                              ),
                                            0
                                          );

                                        return {
                                          ...order,
                                          order_items: updatedOrderItems,
                                          total_price: newTotalPrice,
                                          harga_akhir: newTotalPrice,
                                        };
                                      }
                                      return order;
                                    })
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* <!-- Kolom Kanan --> */}
          <div className="space-y-6">
            {/* <!-- Ringkasan Belanja --> */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-accent mb-4">
                Ringkasan Belanja
              </h2>

              {/* <!-- Kode Promo --> */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan kode promo"
                    onChange={(e) => {
                      setVoucerInput(e.target.value);
                    }}
                    onInput={(e) =>
                      (e.target.value = e.target.value.toUpperCase())
                    }
                    value={VoucerInput}
                    className="flex-1 p-3 border border-neutral-subtle rounded-lg focus:outline-none focus:border-primary"
                  />
                  <button
                    className="bg-secondary text-white px-4 rounded-lg hover:bg-opacity-90"
                    onClick={cekPromo}
                  >
                    Pakai
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Harga</span>
                  <span className="font-medium">
                    {formatRupiah(productCheckout.hargaTotal)}
                  </span>
                </div>
                {productCheckout?.discount > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diskon</span>
                    <span className="font-medium">
                      {productCheckout?.discount}%
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Ongkos Kirim</span>
                  <span className="font-medium">
                    {formatRupiah(productCheckout.shipping_cost)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Pembayaran</span>
                  <span className="font-medium text-primary">
                    {formatRupiah(productCheckout.harga_akhir)}
                  </span>
                </div>
              </div>
            </div>

            {/* <!-- Metode Pembayaran --> */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-accent mb-4">
                Metode Pembayaran
              </h2>
              <div className="space-y-4">
                {payment_methods.map((item, index) => (
                  <div className="flex items-center" key={index}>
                    <input
                      type="radio"
                      id={item.enabled_payment}
                      name="payment"
                      className="mr-2"
                      value={item.enabled_payment}
                      onChange={(e) => {
                        setProductCheckOut((prevState) => ({
                          ...prevState,
                          payment_method: e.target.value,
                        }));
                      }}
                    />
                    <label htmlFor={item.enabled_payment}>{item.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                className="bg-primary text-white w-full py-3 rounded-md hover:bg-primary-subtle transition"
                onClick={() => {
                  handleCheckout();
                  // navigate("/invoice");
                }}
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
      {ToastComponent}
      {isPayment ? (
        <div
          id="snap-embed-container"
          className="fixed left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] w-fit h-fit z-50 shadow-custom rounded-md"
        ></div>
      ) : null}
    </nav>
  );
};
export default CheckOut;
