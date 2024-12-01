import { useEffect } from "react";
import { useState } from "react";
import { UseGetData } from "../../services/service_api";
import LineChart from "../../components/admin/LineChart";

const AdminDashboard = () => {
  const [time, setTime] = useState(new Date());
  const [data, setData] = useState([]);
  const [sales, setSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [dataUsersAuthenticated, setDataUsersAuthenticated] = useState([]);
  const [cartData, setCartData] = useState({
    categori: [],
    data: [],
  });

  // Fetch And Proses Data
  const FetchData = async () => {
    const { data } = await UseGetData(
      "api/orders?filters[order_status][$en]=Cart&filters[payment_status][$eq]=Paid&populate[order_items][populate][product_variant][populate]=product_id&sort=createdAt:desc"
    );

    let orders = data?.data;

    const productSales = {};

    // Menambah data product sales
    orders?.forEach((order) => {
      order?.order_items?.forEach((item) => {
        const productName = item?.product_variant?.product_id?.name;
        const quantity = item?.quantity;

        if (productSales[productName]) {
          productSales[productName] += quantity;
        } else {
          productSales[productName] = quantity;
        }
      });
    });

    // Urutkan berdasarkan jumlah terjual
    const sortedProducts = Object.entries(productSales)
      .map(([name, totalSold]) => ({ name, totalSold }))
      .sort((a, b) => b.totalSold - a.totalSold);

    // Tambahkan peringkat
    const rankedProducts = sortedProducts.map((product, index) => ({
      rank: index + 1,
      ...product,
    }));

    // Menghitung banyaknya penjualan berdasarkan quantity di order_items
    let totalSalesCount = 0;
    orders?.forEach((item) =>
      item?.order_items?.forEach((oi) => {
        totalSalesCount = totalSalesCount + oi.quantity;
      })
    );

    setTotalSales(totalSalesCount);
    setSales(rankedProducts);
    setData(orders);

    const userData = await UseGetData(
      "api/users?populate=*&filters[role][type][$eq]=authenticated"
    );

    setDataUsersAuthenticated(userdata?.data);
  };

  // Fungsi untuk mengatur server berjalan
  const formatTime = (date) => {
    return date.toLocaleTimeString();
  };

  // Fungsi merubah dari createdAt menjadi format waktu
  const formattedDate = (dateString, type = "datetime") => {
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

    if (type === "date") {
      return newFormattedDate;
    } else if (type === "time") {
      return formattedTime;
    } else {
      return `${newFormattedDate} ${formattedTime}`;
    }
  };

  const filterOrdersByTimeRange = (timeRange) => {
    const dataMap = data;
    const currentDate = new Date();
    let categoriData = [];
    let dataChart = [];
    const dayString = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];
    const monthString = [
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

    switch (timeRange) {
      case "weekly":
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(
          currentDate.getDate() -
            (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1)
        );

        // Buat data untuk 7 hari
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);

          // Format hari dan tanggal
          const day = dayString[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Pastikan urutan dimulai dari Senin
          const formattedDate = `${day} (${date.getDate()})`;
          categoriData?.push(formattedDate);

          // Hitung total quantity untuk hari ini
          const totalQuantity = dataMap.reduce((sum, order) => {
            const orderDate = new Date(order?.createdAt);
            const isSameDay =
              orderDate.getDate() === date.getDate() &&
              orderDate.getMonth() === date.getMonth() &&
              orderDate.getFullYear() === date.getFullYear();

            if (isSameDay) {
              const dailyQuantity = order?.order_items?.reduce(
                (itemSum, item) => itemSum + item?.quantity,
                0
              );
              return sum + dailyQuantity;
            }
            return sum;
          }, 0);

          dataChart.push(totalQuantity);
        }
        break;

      case "monthly":
        const currentMonth = 0; // Mulai dari Januari (0)
        const currentYear = currentDate.getFullYear();

        // Loop untuk setiap bulan dalam tahun ini
        for (let i = 0; i < 12; i++) {
          const month = (currentMonth + i) % 12; // Menghitung bulan dengan offset
          const year = currentYear + Math.floor((currentMonth + i) / 12); // Menyesuaikan tahun jika bulan melampaui Desember

          const formattedMonth = `${monthString[month]} ${year}`;
          categoriData?.push(formattedMonth);

          // Hitung total quantity untuk bulan ini
          const totalQuantity = dataMap.reduce((sum, order) => {
            const orderDate = new Date(order?.createdAt);
            const isSameMonth =
              orderDate.getMonth() === month &&
              orderDate.getFullYear() === year;

            if (isSameMonth) {
              const monthlyQuantity = order?.order_items?.reduce(
                (itemSum, item) => itemSum + item?.quantity,
                0
              );
              return sum + monthlyQuantity;
            }
            return sum;
          }, 0);

          dataChart.push(totalQuantity);
        }
        break;

      case "yearly":
        const currentYearForYearly = currentDate.getFullYear();

        // Loop untuk 10 tahun terakhir termasuk tahun ini
        for (let i = -9; i <= 0; i++) {
          const year = currentYearForYearly + i;
          const formattedYear = `${year}`;

          categoriData?.push(formattedYear);

          // Hitung total quantity untuk tahun ini
          const totalQuantity = dataMap.reduce((sum, order) => {
            const orderDate = new Date(order?.createdAt);
            const isSameYear = orderDate.getFullYear() === year;

            if (isSameYear) {
              const yearlyQuantity = order?.order_items?.reduce(
                (itemSum, item) => itemSum + item?.quantity,
                0
              );
              return sum + yearlyQuantity;
            }
            return sum;
          }, 0);

          dataChart.push(totalQuantity);
        }
        break;

      default:
        break;
    }

    setCartData((prevState) => ({
      ...prevState,
      data: dataChart,
      categori: categoriData,
    }));
  };

  useEffect(() => {
    if (data?.length == 0) {
      const fetchDataAndFilter = async () => {
        await FetchData();
      };

      fetchDataAndFilter();
    }
    filterOrdersByTimeRange("monthly");
  }, [data]);

  return (
    <div>
      <div className="flex lg:justify-between sm:flex-col lg:flex-row lg:items-center gap-3">
        <div className="sm:w-full lg:w-[70%] h-[350px] bg-neutral border-2 border-primary rounded-md">
          <div className="bg-primary px-3 py-1 rounded-t-sm flex justify-between">
            <p className="text-white outline-none">Grafik Penjualan Bulanan</p>
            <select
              className="px-2 py-1 rounded-sm"
              onChange={(e) => {
                filterOrdersByTimeRange(e.target.value);
              }}
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly" selected>
                Bulanan
              </option>
              <option value="yearly">Yealy</option>
            </select>
          </div>
          <LineChart categori={cartData?.categori} series={cartData?.data} />
        </div>
        <div className="flex flex-col gap-3 sm:w-full lg:w-[30%]">
          <div className="bg-neutral w-[100%] min-h-fit h-[65px] flex flex-col justify-Start border-secondary border-2 rounded-md">
            <p className="bg-secondary text-white px-3 py-1 rounded-t-sm">
              Server Berjalan ({formatTime(time)})
            </p>
            <p className="text-center text-xl font-bold">13 Hari 12 Jam</p>
          </div>
          <div className="bg-neutral w-[100%] min-h-fit h-[135px] flex flex-col justify-between border-primary border-2 rounded-md">
            <p className="bg-primary text-white px-3 py-1 rounded-t-sm">
              Total Penjualan
            </p>
            <p className="text-center text-6xl font-bold">{totalSales}</p>
            <p className="text-center ">Terjual</p>
          </div>
          <div className="bg-neutral w-[100%] min-h-fit h-[135px] flex flex-col justify-between border-primary-subtle border-2 rounded-md">
            <p className="bg-primary-subtle text-white px-3 py-1 rounded-t-sm">
              Pelanggan Aktif
            </p>
            <p className="text-center text-6xl font-bold">
              {dataUsersAuthenticated.length}
            </p>
            <p className="text-center ">Pelanggan</p>
          </div>
        </div>
      </div>
      <div className="flex sm:flex-col lg:flex-row gap-3 mt-3 justify-between">
        <div className=" bg-white rounded-lg sm:w-full lg:w-[50%] shadow-lg sm:px-1 lg:px-6 py-4 ">
          <h1 className="text-2xl font-bold text-primary text-center mb-4">
            Produk Terlaris
          </h1>
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-2 border">Peringkat</th>
                <th className="px-4 py-2 border">Nama Produk</th>
                <th className="px-4 py-2 border">Jumlah Terjual</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((item, index) => (
                <tr
                  className=" hover:bg-secondary hover:text-white"
                  key={index}
                >
                  <td
                    className={`border px-4 py-2 ${
                      item?.rank < 3 ? "font-bold" : ""
                    }`}
                  >
                    {item?.rank <= 3 ? `#${item?.rank}` : item?.rank}
                  </td>
                  <td className="border px-4 py-2">{item?.name}</td>
                  <td className="border px-4 py-2">{item?.totalSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className=" bg-white rounded-lg  sm:w-full lg:w-[50%] shadow-lg sm:px-1 lg:px-6 py-4">
          <h1 className="text-2xl font-bold text-primary text-center mb-4">
            Pesanan Terbaru
          </h1>
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-2 border">No</th>
                <th className="px-4 py-2 border">Nama Produk</th>
                <th className="px-4 py-2 border">Tanggal Pesanan</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item, index) => (
                <tr className="hover:bg-secondary hover:text-white" key={index}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">
                    {item?.order_items?.[0]?.product_variant?.product_id?.name}
                  </td>
                  <td className="border px-4 py-2">
                    {formattedDate(item?.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
