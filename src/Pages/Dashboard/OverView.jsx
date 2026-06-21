import { useState, useEffect } from "react";
import { Box1, Box2, Box3, Box4, Box6, Box5 } from "../../components/admin/DBContent";


function Overview() {
  const [coins, setCoins] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"
        );
        const data = await response.json();
        setCoins(data);
      } catch (err) {
        console.error("Error fetching market data:", err);
      }
    };

    fetchMarketData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=180"
      );
      const data = await res.json();

      // Group prices by month
      const monthlyData = {};
      data.prices.forEach(([timestamp, price]) => {
        const month = new Date(timestamp).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        if (!monthlyData[month]) {
          monthlyData[month] = { total: 0, count: 0 };
        }
        monthlyData[month].total += price;
        monthlyData[month].count += 1;
      });

      // Convert into chart-friendly array (last 6 months)
      const formatted = Object.entries(monthlyData)
        .map(([month, { total, count }]) => ({
          month,
          revenue: Math.round(total / count), // average price = revenue
          benchmark: 20000, // keep static for now
        }))
        .slice(-6);

      setChartData(formatted);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 bg-primary dark:bg-primary-dark">
        <Box1 />
        <Box2 />
      </div>
      <div className="p-6 gap-6 flex bg-primary dark:bg-primary-dark">
        <Box3 data={chartData} />
        <Box5 />
      </div>
      <div className="p-6 gap-6 flex flex-wrap bg-primary dark:bg-primary-dark">
        <Box4 coins={coins} />
        <Box6 />
      </div>
    </>
  );
}

export default Overview;
