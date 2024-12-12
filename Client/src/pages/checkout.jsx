import { useNavigate, useParams } from "react-router-dom";
import CursorTrail from "../components/common/cursorTrail";
import Navbar from "../components/client/Navbar";
import "../assets/stylesheets/checkout.css";
import payment_methods from "../utils/method_payment.json";
import { useEffect, useRef, useState } from "react";
import useSpinner from "../components/common/spinner";
import { useToast } from "../components/common/useToast";
import {
  UseCreateData,
  UseGetData,
  UseUpdateData,
} from "../services/service_api";
import { useFetchOngkir } from "../services/fetchData";
import { get_settings } from "../services/fetch_settings";
import useSnapPayment from "../components/client/useSnapPayment";

const dataCheckout = () => {
  const [dataPayment, setDataPayment] = useState({
    orderId: `777du2h13`,
    grossAmount: 0,
    customerDetails: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
    item_detail: [],
    payment_selected: [],
  });

  const [dataInvoice, setDataInvoice] = useState({
    orders: [],
    user: [],
    final_price: 0,
    shipping_cost: 0,
    payment_method: "",
    discount: 0,
    normal_price: 0,
  });

  return { dataPayment, setDataPayment, dataInvoice, setDataInvoice };
};

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

const UsersData = ({ userData, setDataPayment, setDataInvoice }) => {
  let city = "";
  let province = "";
  if (userData?.address?.city) {
    const cityArr = JSON.parse(userData?.address?.city);
    city = cityArr.name;
  }

  useEffect(() => {
    if (userData) {
      const customerDetails = {
        first_name: userData?.first_name || "",
        last_name: userData?.last_name || "",
        email: userData?.email || "",
        phone: userData?.phone_number || "",
      };
      setDataPayment((prevState) => ({
        ...prevState,
        customerDetails: customerDetails,
      }));

      setDataInvoice((prevState) => ({
        ...prevState,
        user: [userData.id],
      }));
    }
  }, [userData]);

  if (userData?.address?.province) {
    const provinceArr = JSON.parse(userData?.address?.province);
    province = provinceArr.name;
  }

  const complateAddress = `${userData?.address?.complete_address}, ${city}, ${province}`;
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-accent">Alamat Pengiriman</h2>
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
              value={`${userData?.first_name || ""} ${
                userData?.last_name || ""
              }`}
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
              value={userData?.phone_number}
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
            value={complateAddress}
            readOnly
            className="w-full p-3 border border-neutral-subtle rounded-lg focus:outline-none focus:border-primary"
          ></textarea>
        </div>
      </div>
      <button className="bg-primary hover:bg-primary-subtle px-3 py-2 rounded-md text-white mt-2">
        Tambah Alamat
      </button>
    </div>
  );
};

const ProductData = (setDataInvoice) => {
  const [dataOrder, SetDataOrder] = useState([]);
  const params = useParams();
  const idOrder = params["*"];

  // Mengambil Data Produk Yang dibeli
  useEffect(() => {
    const FetchDataProduk = async () => {
      const { data } = await UseGetData(
        `api/orders?${idOrder}&populate[order_items][populate][product_variant][populate][product_id][populate]=*`
      );

      let idOrders = [];

      const processDataOrder = data.data.map((order) => {
        idOrders.push(order.documentId);
        const firstProduct =
          order?.order_items?.[0]?.product_variant?.product_id || {};

        const totalNormalPrice = order?.order_items?.reduce((total, oi) => {
          const { product_variant } = oi;
          const normalPrice = product_variant.price;
          const quantity = oi.quantity;
          return total + normalPrice * quantity; // Menghitung total harga normal
        }, 0);

        const totalPrice = order?.order_items?.reduce((total, oi) => {
          const { product_variant } = oi;
          const normalPrice = product_variant.price;

          // Menghitung diskon dari categories
          const discount =
            product_variant.product_id?.categories?.reduce(
              (maxDiscount, category) => {
                const categoryDiscount = category?.discount_categories || 0;
                return Math.max(maxDiscount, categoryDiscount);
              },
              0
            ) || 0;

          // Menghitung harga setelah diskon
          const price = normalPrice - (normalPrice * discount) / 100;
          const quantity = oi.quantity;
          return total + price * quantity; // Menghitung total harga setelah diskon
        }, 0);

        return {
          ...order,
          product_id: firstProduct.id || null,
          product_name: firstProduct.name || null,
          product_thumbnail: firstProduct.thumbnail || null,
          categories: firstProduct.categories || [],
          order_items: order?.order_items?.map((oi) => {
            const { product_variant } = oi;
            const normalPrice = product_variant.price;

            // Menghitung diskon dari categories
            const discount =
              product_variant.product_id?.categories?.reduce(
                (maxDiscount, category) => {
                  const categoryDiscount = category?.discount_categories || 0;
                  return Math.max(maxDiscount, categoryDiscount);
                },
                0
              ) || 0;

            // Menghitung harga setelah diskon
            const price = normalPrice - (normalPrice * discount) / 100;

            return {
              id: product_variant.id,
              documentId: product_variant.documentId,
              Color: product_variant.Color,
              Size: product_variant.Size,
              Variant: product_variant.Variant,
              normal_price: normalPrice,
              price: Math.round(price), // Pembulatan jika diperlukan
              stock: product_variant.stock,
              quantity: oi.quantity,
            };
          }),
          total_normal_price: totalNormalPrice, // Total harga normal
          total_price: Math.round(totalPrice), // Total harga setelah diskon
        };
      });

      setDataInvoice((prevState) => ({
        ...prevState,
        orders: idOrders,
      }));

      SetDataOrder(processDataOrder);
    };

    FetchDataProduk();
  }, []);

  const tagProduct = (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-accent mb-4">
        Produk yang Dibeli
      </h2>
      <div className="space-y-4">
        {dataOrder.map((orders, idx) => (
          <div className="border-b p-4 mb-6 bg-neutral rounded-lg" key={idx}>
            <div className="mb-4 flex justify-between">
              <div className="flex items-center">
                <p className="text-lg text-accent font-bold">
                  {orders?.product_name || ""}
                </p>
              </div>
            </div>

            {orders?.order_items.map((variant, i) => (
              <div
                className="mb-1 bg-neutral-subtle rounded-md flex justify-between"
                key={i}
              >
                <div className="border rounded-lg p-4 flex items-center w-full">
                  <img
                    src={`${import.meta.env.VITE_BASE_URL}${
                      orders?.product_thumbnail?.[0]?.url || ""
                    }`}
                    alt={orders?.product_name || ""}
                    className="w-20 h-20 object-cover rounded-lg shadow-md mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-accent">
                      {variant.Color || ""}{" "}
                      {variant.Size ? `- Ukuran ${variant.Size}` : ""}
                      {variant.Variant ? `- ${variant.Variant}` : ""}
                    </h3>
                    <p className="text-secondary font-bold text-md">
                      {formatRupiah(variant.price)}{" "}
                      {variant.price != variant.normal_price ? (
                        <s className="text-gray-500 font-normal text-sm">
                          {formatRupiah(variant.normal_price)}
                        </s>
                      ) : null}
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={variant?.quantity || ""}
                      min="1"
                      className="w-16 p-1 rounded-md text-center mt-2 outline-none"
                      onInput={(e) =>
                        (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
                      }
                      onChange={(e) => {
                        let newQuantity = e.target.value.replace(/[^0-9]/g, "");

                        const newData = dataOrder.map((order) =>
                          order.id === orders.id
                            ? {
                                ...order,
                                order_items: order.order_items.map((oi) =>
                                  oi.id === variant.id
                                    ? {
                                        ...oi,
                                        quantity: newQuantity,
                                      }
                                    : oi
                                ),
                                total_price: order.order_items.reduce(
                                  (total, oi) => {
                                    const itemTotal =
                                      oi.id === variant.id
                                        ? newQuantity * oi.price
                                        : oi.quantity * oi.price;
                                    return total + itemTotal;
                                  },
                                  0
                                ),
                              }
                            : order
                        );

                        SetDataOrder(newData);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return { tagProduct, dataOrder };
};

const RingkasanBelanja = ({
  dataOrder,
  userData,
  showSpinner,
  hideSpinner,
  setDataPayment,
  dataPayment,
  showToast,
  setDataInvoice,
  setDiscountId,
}) => {
  let totalNormalPrice = 0;
  let totalDiscountPrice = 0;
  const [ongkir, setOngkir] = useState(0);
  const [discount, setDiscount] = useState(0); // ini adalah discount yang diambil dari data diskon. misal 30%
  const [minPriceDiscount, setMinPriceDiscount] = useState(0); // ini adalah harga dari pengurangan harga asli dengan diskon. misal 10000 - 30% maka isinya 7000
  const [isFetchingOngkir, setIsFetchingOngkir] = useState(false);
  const inputVoucher = useRef(null);

  const [address, setAddress] = useState({
    origin: null,
    destination: null,
  });

  dataOrder.reduce((acc, order) => {
    totalNormalPrice += order.total_normal_price;
    totalDiscountPrice += order.total_price;
    return acc;
  }, []);

  useEffect(() => {
    if (userData?.address?.city) {
      const cityArr = JSON.parse(userData?.address?.city);
      setAddress((prevState) => ({
        ...prevState,
        destination: cityArr?.name
          ?.replaceAll("KAB. ", "")
          ?.replaceAll("KOTA ", "")
          ?.replaceAll(" ", "")
          ?.toLowerCase(),
      }));
    }

    const SettingHandle = async () => {
      const settings = await get_settings();
      const AddressArr = JSON.parse(settings?.shop_address);
      setAddress((prevState) => ({
        ...prevState,
        origin: AddressArr?.kotaName
          ?.replaceAll("KAB. ", "")
          ?.replaceAll("KOTA ", "")
          ?.replaceAll(" ", "")
          ?.toLowerCase(),
      }));
    };

    SettingHandle();
  }, [dataOrder, userData]);

  const cekOngkir = async () => {
    const response = await useFetchOngkir(
      `v1/cost?courier=jne&origin=${address.origin}&destination=${address.destination}&weight=1&volume=100x100x100&`
    );

    let dataOngkir = {
      id: "Ongkir",
      price: 20100,
      quantity: 1,
      name: "Ongkos Kirim",
    };

    const cost = getPrioritizedShipping(response?.data?.costs);

    setOngkir(cost.price);

    console.log(response);

    if (response && response.status == 200) {
      dataOngkir = {
        id: "Ongkir",
        price: cost.price || 2,
        quantity: 1,
        name: "Ongkos Kirim",
      };
    } else {
    }

    setDataPayment((prevState) => {
      const existingItemIndex = prevState.item_detail.findIndex(
        (item) => item.id === "Ongkir"
      );

      if (existingItemIndex !== -1) {
        // Jika item sudah ada, update item tersebut
        const updatedItemDetail = prevState.item_detail.map((item) =>
          item.id === "Ongkir" ? { ...item, price: dataOngkir.price } : item
        );
        return {
          ...prevState,
          item_detail: updatedItemDetail,
        };
      } else {
        // Jika item belum ada, tambahkan item baru
        return {
          ...prevState,
          item_detail: [...prevState.item_detail, dataOngkir],
        };
      }
    });
  };

  const cekVoucher = async () => {
    const codeVoucher = inputVoucher.current.value.toUpperCase();
    const { data } = await UseGetData(
      `api/discounts?filters[code][$eq]=${codeVoucher.toUpperCase()}`
    );

    const discounts = data?.data || [];

    const today = new Date();
    const validPromos = discounts.filter((promo) => {
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);
      return today >= startDate && today <= endDate;
    });

    if (validPromos.length == 0) {
      showToast(
        "Kode promo tidak valid atau sudah kedaluarsa",
        "warning",
        5000
      );
      return null;
    }
    if (discount > 0) {
      showToast(
        "Hanya bisa menggunakan 1 kode promo pada setiap 1 order",
        "warning",
        5000
      );
    }

    // Ambil promo dengan diskon terbesar jika ada, jika tidak kembalikan {}
    const dataPromo =
      validPromos.reduce((max, promo) => {
        return promo.discount_percentage > (max?.discount_percentage || 0)
          ? promo
          : max;
      }, null) || {};

    const total = Number(totalDiscountPrice);

    const presentaseDiscount = dataPromo.discount_percentage / 100;
    const nilaiDiscount = total * presentaseDiscount;

    const dataDiscount = {
      id: "Discount",
      price: -parseFloat(nilaiDiscount.toFixed(0)),
      quantity: 1,
      name: "Diskon Produk",
    };

    setDiscount(dataPromo.discount_percentage);
    setDiscountId(dataPromo.documentId);

    setMinPriceDiscount(parseFloat(nilaiDiscount.toFixed(0)));

    setDataPayment((prevState) => {
      const existingItemIndex = prevState.item_detail.findIndex(
        (item) => item.id === "Discount"
      );

      if (existingItemIndex !== -1) {
        // Jika item sudah ada, update item tersebut
        const updatedItemDetail = prevState.item_detail.map((item) =>
          item.id === "Discount" ? { ...item, price: dataDiscount.price } : item
        );
        return {
          ...prevState,

          item_detail: updatedItemDetail,
        };
      } else {
        // Jika item belum ada, tambahkan item baru
        return {
          ...prevState,
          item_detail: [...prevState.item_detail, dataDiscount],
        };
      }
    });
  };

  const getPrioritizedShipping = (data) => {
    if (!data || data.length === 0) return null;

    // Filter layanan dengan service REG atau YES
    const prioritizedServices = data.filter(
      (item) => item.service === "REG" || item.service === "YES"
    );

    // Jika ada layanan REG atau YES, pilih yang paling murah
    if (prioritizedServices.length > 0) {
      return prioritizedServices.reduce((cheapest, current) =>
        parseInt(current.price) < parseInt(cheapest.price) ? current : cheapest
      );
    }

    // Jika tidak ada REG atau YES, pilih yang termurah di semua layanan
    return data.reduce((cheapest, current) =>
      parseInt(current.price) < parseInt(cheapest.price) ? current : cheapest
    );
  };

  useEffect(() => {
    if (address.destination && address.origin) {
      if (
        dataPayment &&
        dataPayment.item_detail.some((item) => item.id !== "Ongkir")
      ) {
        if (!isFetchingOngkir) {
          showSpinner();
          cekOngkir();
          setIsFetchingOngkir(true);
        }
      } else if (dataPayment.item_detail.length == 0) {
        if (!isFetchingOngkir) {
          showSpinner();
          cekOngkir();
          setIsFetchingOngkir(true);
        }
      } else {
        hideSpinner();
      }
    }
  }, [address]);

  if (dataPayment.item_detail.some((item) => item.id === "Ongkir")) {
    hideSpinner();
  }

  const total =
    Number(totalDiscountPrice) - Number(minPriceDiscount) + Number(ongkir);

  useEffect(() => {
    setDataPayment((prevState) => ({
      ...prevState,
      grossAmount: total,
    }));

    setDataInvoice((prevState) => ({
      ...prevState,
      final_price: total,
      shipping_cost: Number(ongkir),
      discount: discount,
      normal_price: Number(totalDiscountPrice),
    }));
  }, [total]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-accent mb-4">
        Ringkasan Belanja
      </h2>

      {/* <!-- Kode Promo --> */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            ref={inputVoucher}
            placeholder="Masukkan kode promo"
            onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
            className="flex-1 p-3 border border-neutral-subtle rounded-lg focus:outline-none focus:border-primary"
          />
          <button
            className="bg-secondary text-white px-4 rounded-lg hover:bg-opacity-90"
            onClick={cekVoucher}
          >
            Pakai
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Harga</span>
          <span className="font-medium">
            {formatRupiah(totalDiscountPrice)}
          </span>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between">
            <span className="text-gray-600">Diskon Produk</span>
            <span className="font-medium">
              {parseFloat(discount.toFixed(0))}%
            </span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-gray-600">Total Ongkos Kirim</span>
          <span className="font-medium">{formatRupiah(ongkir)}</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between">
          <span className="font-semibold">Total Pembayaran</span>
          <span className="font-medium text-primary">
            {formatRupiah(dataPayment.grossAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

const PaymentMethod = ({ setDataPayment, setDataInvoice }) => {
  const [paymentSelected, setPaymentSelected] = useState(null);

  useEffect(() => {
    if (paymentSelected) {
      setDataPayment((prevState) => ({
        ...prevState,
        payment_selected: [paymentSelected],
      }));
    }

    setDataInvoice((prevState) => ({
      ...prevState,
      payment_method: paymentSelected,
    }));
  }, [paymentSelected]);

  return (
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
                setPaymentSelected(e.target.value);
              }}
            />
            <label htmlFor={item.enabled_payment}>{item.name}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

const CheckOut = ({ categories, dataClient }) => {
  const { hideSpinner, showSpinner, spinner } = useSpinner();
  const { ToastComponent, showToast } = useToast();
  const [isPayment, setIsPayment] = useState(false);
  const { dataPayment, setDataPayment, dataInvoice, setDataInvoice } =
    dataCheckout();
  const { tagProduct, dataOrder } = ProductData(setDataInvoice); // Getting produk data
  const [discountId, setDiscountId] = useState(null);

  const SnapEmbed = useSnapPayment();
  useEffect(() => {
    if (dataOrder && dataOrder.length > 0) {
      const newItems = dataOrder.flatMap((item) => {
        // Dapatkan total diskon kategori
        const totalDiscount = item.categories
          .filter((cat) => cat.discount_categories > 0)
          .reduce((sum, cat) => sum + cat.discount_categories, 0);

        // Iterasi order_items dan kurangkan diskon kategori
        return item.order_items.map((oi) => ({
          id: oi.documentId,
          price: Math.max(0, oi.normal_price - totalDiscount), // Pastikan tidak negatif
          quantity: oi.quantity,
          name: `${item.product_name}${oi.Color ? " | " + oi.Color : ""}${
            oi.Size ? " | " + oi.Size : ""
          }${oi.Variant ? " | " + oi.Variant : ""}`,
        }));
      });

      // Filter items yang belum ada di dataPayment
      const uniqueItems = newItems.filter(
        (newItem) =>
          !dataPayment.item_detail.some(
            (existingItem) => existingItem.id === newItem.id
          )
      );

      // Jika ada items baru, update state
      if (uniqueItems.length > 0) {
        setDataPayment((prevState) => ({
          ...prevState,
          item_detail: [...prevState.item_detail, ...uniqueItems],
        }));
      }
    }
  }, [dataOrder, dataPayment.item_detail, setDataPayment]);

  const handleCheckout = async () => {
    console.log(dataInvoice);

    if (dataPayment.payment_selected.length === 0) {
      showToast("Pilih metode pembayaran", "danger", 5000);
      return;
    }
    if (!dataPayment.item_detail.some((item) => item.id === "Ongkir")) {
      showToast(
        "Tunggu hingga biaya ongkos kirim muncul atau refresh halaman",
        "danger",
        5000
      );
      return;
    }

    const updateOrderStatus = async (
      orderId,
      order_status,
      payment_status,
      token_payment
    ) => {
      const payload = {
        data: {
          order_status: order_status,
          payment_status: payment_status,
          token_payment: token_payment,
        },
      };
      await UseUpdateData("api/orders", orderId, payload);
    };

    const createEmbededPayment = (snapToken, invoiceId) => {
      try {
        SnapEmbed(snapToken, "snap-embed-container", {
          onSuccess: async (result) => {
            console.log("Pembayaran sukses", result, invoiceId);
            showToast("Berhasil membeli produk", "success", 2000);
            onPayment("success", null, invoiceId);
          },
          onPending: (result) => {
            console.log("Pembayaran pending", result);
            showToast("Pembayaran Pending", "warning", 5000);
            onPayment("pending", snapToken);
          },
          onClose: () => {
            console.log("Pembayaran ditutup oleh pengguna");
            onPayment("pending", snapToken);
          },
        });
      } catch (error) {
        console.log(error);
      }
    };

    const onPayment = async (status, token = null, InvoiceId = null) => {
      let payloadData;
      dataInvoice.orders.forEach(async (orders) => {
        if (status == "success") {
          payloadData = {
            data: {
              order_status: "Packed",
              payment_status: "Paid",
              discount: [discountId],
            },
          };
        } else {
          payloadData = {
            data: {
              token_payment: token,
              discount: [discountId],
            },
          };
        }

        const UpdateOrder = await UseUpdateData(
          "api/orders",
          orders,
          payloadData
        );

        if (UpdateOrder.status == "success") {
          if (status == "success") {
            showToast("Berhasil Melakukan Pembayaran", "success", 5000);
            navigate(`/invoice/${InvoiceId}`);
          }
        }
      });
    };

    showSpinner();
    try {
      let tokenPayment = [];
      let invoiceId = "";

      for (const item of dataInvoice.orders) {
        const cekOrderTokenPayment = await UseGetData(
          `api/orders/${item}?populate=*`
        );

        const token = cekOrderTokenPayment.data.data.token_payment;
        invoiceId = cekOrderTokenPayment.data.data.invoice.documentId;

        // Periksa apakah token belum ada di array
        if (!tokenPayment.includes(token)) {
          tokenPayment.push(token);
        }
      }

      setIsPayment(true);

      if (tokenPayment.length == 2 && tokenPayment?.[0] != null) {
        createEmbededPayment(tokenPayment?.[0], invoiceId);
      } else {
        // Buat invoice
        const payloadInvoice = { data: dataInvoice };
        const createInvoice = await UseCreateData(
          "api/invoices",
          payloadInvoice
        );

        if (createInvoice.status === "success") {
          // Update status order untuk setiap item
          await Promise.all(
            dataInvoice.orders.map((item) =>
              updateOrderStatus(item, "Pending", "Unpaid", "")
            )
          );

          // Perbarui dataPayment dengan orderId
          const updatedDataPayment = {
            ...dataPayment,
            orderId: createInvoice.data.data.documentId,
          };
          setDataPayment(updatedDataPayment); // Optional, jika Anda ingin menyimpan ke state

          // Buat transaksi menggunakan dataPayment yang diperbarui
          const paymentResponse = await UseCreateData(
            "api/transactions",
            updatedDataPayment
          );

          let snapToken = paymentResponse?.data?.token || null;
          if (!snapToken) {
            showToast("Respon pembayaran tidak valid", "danger", 5000);
            setIsPayment(false);
            return;
          }

          if (paymentResponse.status == "success") {
            dataInvoice.orders.map((item) =>
              updateOrderStatus(item, "Pending", "Unpaid", snapToken)
            );

            createEmbededPayment(snapToken, createInvoice.data.data.documentId);
          } else {
            showToast(
              `Gagal memproses pembayaran: ${paymentResponse.message}`,
              "danger",
              5000
            );
          }

          // Tindakan lanjutan berdasarkan hasil transaksi
          if (paymentResponse.status !== "success") {
            showToast("Gagal membuat transaksi", "danger", 5000);
          }
        }
      }
    } catch (error) {
      showToast("Terjadi kesalahan, silakan coba lagi", "danger", 5000);
      console.log(error);
    } finally {
      hideSpinner();
    }
  };

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
            <UsersData
              userData={dataClient}
              setDataPayment={setDataPayment}
              dataPayment={dataPayment}
              setDataInvoice={setDataInvoice}
            />
            {/* <!-- Daftar Produk --> */}
            {tagProduct}
          </div>

          {/* <!-- Kolom Kanan --> */}
          <div className="space-y-6">
            {/* <!-- Ringkasan Belanja --> */}
            <RingkasanBelanja
              dataOrder={dataOrder}
              userData={dataClient}
              showSpinner={showSpinner}
              hideSpinner={hideSpinner}
              dataPayment={dataPayment}
              setDataPayment={setDataPayment}
              showToast={showToast}
              setDataInvoice={setDataInvoice}
              setDiscountId={setDiscountId}
            />
            {/* <!-- Metode Pembayaran --> */}
            <PaymentMethod
              setDataInvoice={setDataInvoice}
              setDataPayment={setDataPayment}
            />
            <div className="mt-6 text-right">
              <button
                className="bg-primary text-white w-full py-3 rounded-md hover:bg-primary-subtle transition"
                onClick={() => {
                  handleCheckout();
                }}
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
      {ToastComponent}
      <div
        id="snap-embed-container"
        className={`fixed left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] w-fit h-fit z-50 shadow-custom rounded-md ${
          !isPayment ? "hidden" : ""
        }`}
      ></div>
    </nav>
  );
};
export default CheckOut;
