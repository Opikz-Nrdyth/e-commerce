import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UseGetData } from "../../services/service_api";
import { useFetchRajaOngkir } from "../../services/fetchData";
import { get_settings } from "../../services/fetch_settings";

const InvoicePaper = ({ invoiceId }) => {
  const [invoice, setInvoice] = useState({});
  const [settings, setSettings] = useState({});

  const FetchData = async () => {
    const { data } = await UseGetData(
      `api/invoices/${invoiceId}?populate[user][populate][address]=*&populate[orders][populate][order_items][populate][product_variant][populate][product_id]=*`
    );

    setInvoice(calculateProductItems(data?.data));
  };

  const FetchAddress = async () => {
    if (invoice?.user?.address?.province?.length <= 3) {
      const data = await useFetchRajaOngkir(
        `city?id=${invoice?.user?.address?.city}`
      );
      if (
        data?.rajaongkir?.results?.province &&
        data?.rajaongkir?.results?.province != ""
      ) {
        setInvoice((statePrev) => ({
          ...statePrev,
          user: {
            ...statePrev?.user,
            address: {
              ...statePrev?.user?.address,
              city: data?.rajaongkir?.results?.city_name,
              province: data?.rajaongkir?.results?.province,
            },
          },
        }));
      }
    }
  };

  useEffect(() => {
    FetchData();

    const settings = get_settings();
    setSettings(settings);
  }, []);

  useEffect(() => {
    if (invoice) {
      FetchAddress();
    }
  }, [invoice]);

  console.log(settings);

  const calculateProductItems = (data) => {
    let payment_status = "";
    const newProductItems = data?.orders?.flatMap((order) =>
      order.order_items.map((item) => {
        const variant = item.product_variant;
        const product = variant.product_id;
        payment_status = order.payment_status;
        return {
          product: `${product.name} (${variant.Size}, ${
            variant.Variant || "Default"
          }, ${variant.Color})`,
          price: parseFloat(variant.price), // Harga varian produk
          stock: parseInt(variant.stock, 10), // Stok varian produk
          quantity: parseInt(item.quantity),
          total: item.quantity * parseFloat(variant.price), // Total biaya berdasarkan kuantitas
          final_price: parseFloat(order.total_price), // Harga total pesanan
        };
      })
    );

    delete data?.orders;
    const newData = {
      ...data,
      productItems: newProductItems,
      payment_status: payment_status,
    };
    return newData;
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
      {/* <!-- Header --> */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-accent">Invoice</h1>
          <p className="text-gray-600">INV-{invoiceId || "000"}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <img
            src={settings?.thumbnail}
            alt="Company Logo"
            className="h-[30px] md:h-[70px] w-fit"
          />
          <p className="text-sm text-gray-600 mt-2">
            {formatDate(invoice?.createdAt) || "00-00-0000"}
          </p>
        </div>
      </div>

      {/* <!-- Informasi Pelanggan --> */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-accent mb-2">
          Informasi Pelanggan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Nama:</p>
            <p>{`${invoice?.user?.first_name || ""} ${
              invoice?.user?.last_name || ""
            }`}</p>
          </div>
          <div>
            <p className="font-medium">Alamat:</p>
            <p>{`${invoice?.user?.address?.complete_address || ""}, ${
              invoice?.user?.address?.city || ""
            }, ${invoice?.user?.address?.province || ""}, ${
              invoice?.user?.address?.postal_code || ""
            }`}</p>
          </div>
          <div>
            <p className="font-medium">Email:</p>
            <p>{invoice?.user?.email || ""}</p>
          </div>
          <div>
            <p className="font-medium">Telepon:</p>
            <p>{invoice?.user?.phone_number || ""}</p>
          </div>
        </div>
      </div>

      {/* <!-- Daftar Produk --> */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-accent mb-4">
          Daftar Produk
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-subtle">
                <th className="p-2 text-left">Produk</th>
                <th className="p-2 text-right">Harga</th>
                <th className="p-2 text-right">Jumlah</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.productItems?.map((item, index) => (
                <tr key={index}>
                  <td className="p-2">{item?.product}</td>
                  <td className="p-2 text-right">
                    {formatRupiah(item?.price)}
                  </td>
                  <td className="p-2 text-right">{item?.quantity}</td>
                  <td className="p-2 text-right">
                    {formatRupiah(item?.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* <!-- Ringkasan Pembayaran --> */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-accent mb-4">
          Ringkasan Pembayaran
        </h2>
        <div className="bg-neutral p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>{formatRupiah(invoice?.normal_price)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Ongkos Kirim</span>
            <span>{formatRupiah(invoice?.shipping_cost)}</span>
          </div>
          {invoice?.discount > 0 ? (
            <div className="flex justify-between mb-2">
              <span>Discount</span>
              <span>{invoice?.discount}%</span>
            </div>
          ) : null}
          <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t border-gray-300">
            <span>Total</span>
            <span className="text-primary">
              {formatRupiah(invoice?.final_price)}
              {invoice.payment_status == "Unpaid" ? (
                <p className="text-danger bg-red-100 text-sm text-center rounded-md">
                  Belum Bayar
                </p>
              ) : (
                <p className="text-success bg-green-100 text-sm text-center rounded-md">
                  Lunas
                </p>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* <!-- Metode Pembayaran --> */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-accent mb-2">
          Metode Pembayaran
        </h2>
        <p>{invoice?.payment_method?.toUpperCase()}</p>
      </div>

      {/* <!-- Catatan --> */}
      <div className="text-sm text-gray-600">
        <p>
          Terima kasih atas pembelian Anda. Jika Anda memiliki pertanyaan,
          silakan hubungi layanan pelanggan kami.
        </p>
      </div>
    </div>
  );
};

export default InvoicePaper;
