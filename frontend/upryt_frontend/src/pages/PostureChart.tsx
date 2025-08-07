import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Session {
  posture_score: number;
  timestamp: string;
  corrections: number;
  good_posture_percent: number;
}

type TabType = "score" | "correction" | "percent";
const tabs: TabType[] = ["score", "correction", "percent"];
const timeFilters = ["Last 1 Hour", "Today", "This Week", "This Month"];

const formatTimestamp = (iso: string, range: string) => {
  const date = new Date(iso);

  switch (range) {
    case "Last 1 Hour":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

    case "Today":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

    case "This Week":
      return date.toLocaleString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit"
      });

    case "This Month":
      return date.toLocaleString([], {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });

    default:
      return date.toLocaleString();
  }
};

const PostureChart: React.FC = () => {
  const [data, setData] = useState<Session[]>([]);
  const [filteredData, setFilteredData] = useState<Session[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabType>("score");
  const [selectedRange, setSelectedRange] = useState("Today");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/get-posture-details/user123")
      .then((res) => {
        const mapped = res.data.data.map((item: any) => {
          const timestamp = item.timestamp;
          return {
            posture_score: item.posture_score,
            timestamp,
            formatted: formatTimestamp(timestamp, selectedRange),
            corrections: item.session.corrections,
            good_posture_percent: item.session.good_posture_percent
          };
        });

        setData(mapped);
      })
      .catch((err) => console.error("Error fetching posture data:", err));
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const now = new Date();

    const filtered = data.filter((entry) => {
      const entryDate = new Date(entry.timestamp);

      switch (selectedRange) {
        case "Last 1 Hour":
          return now.getTime() - entryDate.getTime() <= 60 * 60 * 1000;

        case "Today":
          return entryDate.toLocaleDateString() === now.toLocaleDateString();

        case "This Week": {
          const startOfWeek = new Date(now);
          startOfWeek.setHours(0, 0, 0, 0);
          const day = startOfWeek.getDay();
          startOfWeek.setDate(startOfWeek.getDate() - day);
          return entryDate >= startOfWeek;
        }

        case "This Month":
          return (
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear()
          );

        default:
          return true;
      }
    });

    setFilteredData(filtered);
  }, [selectedRange, data]);

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const }
    }
  };

  const charts = {
    score: (
      <Bar
        options={{
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            title: { display: true, text: "Posture Score Over Time" }
          }
        }}
        data={{
          labels: filteredData.map((d) =>
            formatTimestamp(d.timestamp, selectedRange)
          ),
          datasets: [
            {
              label: "Posture Score (%)",
              data: filteredData.map((d) => d.posture_score),
              backgroundColor: "rgba(0, 188, 212, 0.6)"
            }
          ]
        }}
      />
    ),
    correction: (
      <Line
        options={{
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            title: { display: true, text: "Corrections Over Time" }
          }
        }}
        data={{
          labels: filteredData.map((d) =>
            formatTimestamp(d.timestamp, selectedRange)
          ),
          datasets: [
            {
              label: "Corrections",
              data: filteredData.map((d) => d.corrections),
              fill: false,
              borderColor: "rgba(255, 99, 132, 0.8)"
            }
          ]
        }}
      />
    ),
    percent: (
      <Bar
        options={{
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            title: { display: true, text: "Good Posture % Over Time" }
          }
        }}
        data={{
          labels: filteredData.map((d) =>
            formatTimestamp(d.timestamp, selectedRange)
          ),
          datasets: [
            {
              label: "Good Posture %",
              data: filteredData.map((d) => d.good_posture_percent),
              backgroundColor: "rgba(76, 175, 80, 0.6)"
            }
          ]
        }}
      />
    )
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-center text-2xl font-bold text-cyan-500 mb-6">
        Posture Analytics Dashboard
      </h2>

      {/* Time Filter */}
      <div className="mb-4 flex justify-end">
        <select
          className="border px-3 py-1 rounded text-sm text-gray-700"
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
        >
          {timeFilters.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-4">
        {tabs.map((tab) => (
          <div
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-5 py-2 cursor-pointer transition-all duration-300 ${selectedTab === tab
                ? "border-b-4 border-cyan-500 font-semibold text-cyan-500"
                : "text-gray-400"
              }`}
          >
            {tab === "score" && "Posture Score"}
            {tab === "correction" && "Corrections"}
            {tab === "percent" && "Good Posture %"}
          </div>
        ))}
      </div>

      {/* Chart Display */}
      <div className="transition-all duration-500 p-4 rounded-lg bg-gray-100 shadow-md">
        {charts[selectedTab]}
      </div>

      {/* Stats */}
      <div className="mt-4 bg-white p-4 rounded shadow text-sm text-gray-600">
        <p>
          Average Posture Score:{" "}
          {Math.round(
            filteredData.reduce((a, b) => a + b.posture_score, 0) /
            filteredData.length || 0
          )}
        </p>
        <p>
          Total Corrections:{" "}
          {filteredData.reduce((a, b) => a + b.corrections, 0)}
        </p>
        <p>
          Average Good Posture %:{" "}
          {Math.round(
            filteredData.reduce((a, b) => a + b.good_posture_percent, 0) /
            filteredData.length || 0
          )}
          %
        </p>
      </div>
    </div>
  );
};

export default PostureChart;
