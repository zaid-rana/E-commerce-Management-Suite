import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  LineChart,
  Line,
  Area,
  PieChart,
  Pie,
  Cell,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const Box1 = () => {
  return (
    // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div className="p-6 bg-primary dark:bg-primary-dark text-primary-dark dark:text-primary rounded-xl transition">
      <h2 className="font-semibold text-shadow-md ">eCommerce</h2>

      {/* Inner Grid - 4 KPI cards with delta, inspired by Figma */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-3xl">
          <p className="text-sm font-medium text-gray-600">Views</p>
          <h3 className="text-2xl font-semibold text-gray-900">7,265</h3>
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-900">
            <ArrowUpRight className="w-4 h-4 text-gray-900" />
            <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200">
              +11.01%
            </span>
          </div>
        </div>

        <div className="p-4 bg-inner dark:bg-inner-dark rounded-3xl">
          <p className="text-sm font-medium text-gray-600">Visits</p>
          <h3 className="text-2xl font-semibold text-inner-dark dark:text-inner">3,671</h3>
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-inner-dark dark:text-inner">
            <ArrowDownRight className="w-4 h-4" />
            <span className="px-2 py-0.5 rounded-md bg-primary dark:bg-primary-dark border border-gray-200">
              -0.03%
            </span>
          </div>
        </div>

        <div className="p-4 bg-inner dark:bg-inner-dark rounded-3xl">
          <p className="text-sm font-medium text-gray-600">New Users</p>
          <h3 className="text-2xl font-semibold">256</h3>
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-inner-dark dark:text-inner">
            <ArrowUpRight className="w-4 h-4" />
            <span className="px-2 py-0.5 rounded-md bg-primary dark:bg-primary-dark border border-gray-200">
              +15.03%
            </span>
          </div>
        </div>

        <div className="p-4 bg-indigo-50 rounded-3xl">
          <p className="text-sm font-medium text-gray-600">Active Users</p>
          <h3 className="text-2xl font-semibold text-gray-900">2,318</h3>
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-900">
            <ArrowUpRight className="w-4 h-4 text-gray-900" />
            <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200">
              +6.08%
            </span>
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
};

const data = [
  { name: "Jan", actual: 10000, projected: 12000 },
  { name: "Feb", actual: 22000, projected: 25000 },
  { name: "Mar", actual: 17000, projected: 18000 },
  { name: "Apr", actual: 28000, projected: 30000 },
  { name: "May", actual: 9000, projected: 11000 },
  { name: "Jun", actual: 19000, projected: 21000 },
];

export const Box2 = () => {
  return (
    <div className="p-6 bg-inner dark:bg-inner-dark rounded-xl hover:shadow-lg transition">
      <h2 className="text-lg text-primary-dark dark:text-primary font-semibold mb-4 text-bla">
        Projections vs Actuals
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value / 1000}K`} />
            <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
            <Legend />

            {/* Actual */}
            <Bar dataKey="actual" fill="#60a5fa" radius={[6, 6, 0, 0]} />

            {/* Projected */}
            <Bar dataKey="projected" fill="#34d399" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// const lineChartdata = [
//   { name: "Jan", revenue: 12000, benchmark: 8000 },
//   { name: "Feb", revenue: 18000, benchmark: 14000 },
//   { name: "Mar", revenue: 15000, benchmark: 12000 },
//   { name: "Apr", revenue: 22000, benchmark: 16000 },
//   { name: "May", revenue: 17000, benchmark: 15000 },
//   { name: "Jun", revenue: 25000, benchmark: 20000 },
// ];

export const Box3 = ({ data }) => {
  const [range, setRange] = useState(6); // default: 6 months

  // Utility: Generate a list of month labels for the last N months
  const generateMonths = (count) => {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i));
      return d.toLocaleString("default", { month: "short", year: "numeric" });
    });
  };

  // Fill missing months with zeros
  const filledData = useMemo(() => {
    const months = generateMonths(24); // always 24 months total
    return months.map((month) => {
      const found = data.find((d) => d.month === month);
      return (
        found || {
          month,
          revenue: 0,
          benchmark: 0,
        }
      );
    });
  }, [data]);

  // Slice based on active range
  const filteredData = filledData.slice(-range);

  return (
    <div className="p-6 bg-inner dark:bg-inner-dark text-primary-dark dark:text-primary rounded-xl hover:shadow-lg transition flex-1 min-w-[300px]">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Revenue ({range} Months)</h2>
        <div className="flex gap-2">
          {[6, 12, 24].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                range === r
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {r}M
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#A0BCE8"
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 12 }}
              tickMargin={8}
            />
            <YAxis
              domain={[0, "dataMax + 5000"]}
              tickFormatter={(value) =>
                `${value === 0 ? "0" : `${value / 1000}K`}`
              }
              tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => `$${Number(value).toLocaleString()}`}
              contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }}
            />

            {/* Primary revenue area + line */}
            <Area
              type="monotone"
              dataKey="revenue"
              fill="url(#revGrad)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#000000"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#000000" }}
              activeDot={{ r: 6 }}
            />

            {/* Secondary benchmark line */}
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#A0BCE8"
              strokeDasharray="4 6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const Box4 = ({ coins }) => {
  const headers = ["Name", "Price", "Circulating Supply", "Market Cap"];

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // calculate total pages
  const totalPages = Math.ceil(coins.length / pageSize);

  // calculate which coins to show
  const startIndex = (page - 1) * pageSize;
  const paginatedCoins = coins.slice(startIndex, startIndex + pageSize);

  // handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1); // reset to first page when page size changes
  };

  return (
    <div className="p-6 bg-inner dark:bg-inner-dark text-primary-dark dark:text-primary rounded-xl hover:shadow-lg transition flex-1 min-w-[300px]">
      <h2 className="text-lg font-semibold mb-4">
        Crypto Market
      </h2>

      {/* Page Size Selector */}
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm ">
          Show{" "}
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>{" "}
          per page
        </label>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((header, colIndex) => (
                <th
                  key={colIndex}
                  className="text-left py-3 px-4 text-sm font-medium uppercase tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedCoins.map((coin) => (
              <tr
                key={coin.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4 text-sm font-medium flex items-center gap-2">
                  <img src={coin.image} alt={coin.name} className="w-5 h-5" />
                  {coin.name}
                </td>
                <td className="py-4 px-4 text-sm ">
                  ${coin.current_price.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-sm  font-medium">
                  {coin.circulating_supply
                    ? coin.circulating_supply.toLocaleString()
                    : "N/A"}
                </td>
                <td className="py-4 px-4 text-sm font-medium">
                  ${coin.market_cap.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 "
        >
          Prev
        </button>
        <span className="text-sm">Page {page}</span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// World map (Revenue by Location) with bubbles
const WORLD_TOPO_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";

const mapLocations = [
  { name: "New York", coords: [-74, 40.7], value: 72 },
  { name: "San Francisco", coords: [-122.4, 37.7], value: 39 },
  { name: "Sydney", coords: [151.2, -33.8], value: 25 },
  { name: "Singapore", coords: [103.8, 1.3], value: 61 },
];

export const Box5 = () => {
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(WORLD_TOPO_URL)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load world data: ${r.status}`);
        return r.json();
      })
      .then((topology) => {
        if (cancelled) return;
        const obj =
          topology.objects?.countries || topology.objects?.land || null;
        const geojson = obj ? feature(topology, obj) : topology;
        setCountries(Array.isArray(geojson.features) ? geojson.features : []);
      })
      .catch((e) => setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  // Fixed canvas size to mimic Figma block proportions
  const width = 550;
  const height = 280;

  const projection = useMemo(
    () =>
      geoMercator()
        .scale(95)
        .translate([width / 2, height / 1.55]),
    [width, height]
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  return (
    <div className="p-6 bg-inner dark:bg-inner-dark text-primary-dark dark:text-primary rounded-xl hover:shadow-lg transition">
      <h2 className="font-semibold text-sm">Revenue by Location</h2>
      <div className="w-full overflow-hidden rounded-xl bg-white">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[130px]">
          {/* horizontal grid-like stripes (subtle) */}
          {/* {[40, 90, 140, 190, 240].map((y) => (
            <line key={y} x1="0" y1={y} x2={width} y2={y} stroke="#232529" strokeWidth="1" />
          ))} */}

          {/* countries */}
          <g>
            {countries.map((d) => (
              <path
                key={d.id || d.properties?.name}
                d={path(d)}
                fill="#A0BCE8"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="0.5"
              />
            ))}
          </g>

          {/* markers */}
          <g>
            {mapLocations.map((loc) => {
              const projected = projection(loc.coords);
              if (!projected) return null;
              const [x, y] = projected;
              const r = 4 + Math.min(12, Math.max(0, loc.value)) / 10; // radius by value
              return (
                <g key={loc.name} transform={`translate(${x},${y})`}>
                  <circle r={r} fill="#f0f2f5" opacity="1" />
                  <circle r={Math.max(2, r - 2)} fill="#08090a" />
                  <title>{`${loc.name}: ${loc.value}%`}</title>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend (right list like Figma) */}
      <ul className="flex flex-col gap-3 w-full mt-1">
        {[
          { label: "United States", value: "52.1%", dot: "#7DBBFF" },
          { label: "Canada", value: "22.8%", dot: "#6BE6D3" },
          { label: "Mexico", value: "13.9%", dot: "#71DD8C" },
          { label: "Other", value: "11.2%", dot: "#A0BCE8" },
        ].map((item) => (
          <li key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.dot }}
              />
              <span className="text-xs">{item.label}</span>
            </div>
            <span className="text-xs font-medium">{item.value}</span>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </div>
  );
};

const donutData = [
  { name: "4D", value: 52.1 },
  { name: "4C", value: 22.8 },
  { name: "4B", value: 13.9 },
  { name: "4A", value: 11.2 },
];

const DONUT_COLORS = ["#000000", "#7DBBFF", "#71DD8C", "#A0BCE8"];

export const Box6 = () => {
  return (
    <div className="p-6 bg-inner dark:bg-inner-dark text-primary-dark dark:text-primary rounded-xl hover:shadow-lg transition">
      <h2 className="font-semibold text-sm">Total Sales</h2>

      <div className="flex flex-col items-center gap-4 w-full">
        {/* Chart Container */}
        <div className="w-[120px] h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#e5e7eb",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontFamily: "Inter",
                  opacity: 1,
                }}
              />
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={1}
                stroke="none"
              >
                {donutData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={DONUT_COLORS[idx % DONUT_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 w-full mt-1">
          {[
            { label: "Website", value: "52.1%", dot: DONUT_COLORS[0] },
            { label: "Mobile", value: "22.8%", dot: DONUT_COLORS[1] },
            { label: "Desktop", value: "13.9%", dot: DONUT_COLORS[2] },
            { label: "Tablet", value: "11.2%", dot: DONUT_COLORS[3] },
          ].map((item, index) => (
            <div
              key={item.label}
              className="flex justify-between items-center w-full"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: item.dot }}
                />
                <span className="text-xs">{item.label}</span>
              </div>
              <span className="text-xs font-medium">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
