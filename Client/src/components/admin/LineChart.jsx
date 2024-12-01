import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const LineChart = ({ categori, series }) => {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      id: "line",
    },
    xaxis: {
      categories: categori,
    },
  });
  const [chartSeries, setChartSeries] = useState([
    {
      name: "Data Penjualan",
      data: [],
    },
  ]);

  // Memperbarui chartOptions dan chartSeries jika categori atau series berubah
  useEffect(() => {
    setChartOptions((prevOptions) => ({
      ...prevOptions,
      xaxis: {
        ...prevOptions.xaxis,
        categories: [], // update categories dengan categori baru
      },
    }));

    setChartSeries([
      {
        name: "Terjual",
        data: series,
      },
    ]);
  }, [categori, series]);

  return (
    <div>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height="300"
      />
    </div>
  );
};

export default LineChart;
