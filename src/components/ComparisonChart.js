import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const API_URL = "http://localhost:50000/getGefs"; // Replace with actual API

const Button = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    {children}
  </button>
);

export default function ComparisonChart() {
  const [chartData, setChartData] = useState([]);
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const report_date = params.get("date");
  const city = params.get("city");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await fetch(`${API_URL}?report_date=20250209&city=Gliwice`);
        const response2 = await fetch(`${API_URL}?report_date=20250211&city=Gliwice`);

        const data1 = await response1.json();
        const data2 = await response2.json();

        // console.log("data1:", data1); // Debugging output

        // Convert arrays to objects mapped by "time"
        const dataMap1 = Object.fromEntries(data1.map((item) => [item.time, item]));
        const dataMap2 = Object.fromEntries(data2.map((item) => [item.time, item]));

        // console.log("dataMap1:", dataMap1); // Debugging output

        // Merge data based on time
        const mergedData = Object.keys(dataMap1).map((time) => ({
          time,
          "00 (20250209)": dataMap1[time]?.["00"] || null,
          "12 (20250211)": dataMap2[time]?.["12"] || null,
        }));

        console.log("Prepared Data:", mergedData); // Debugging output
        setChartData(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (

    <div className="w-full h-96 p-4 bg-white shadow-lg rounded-xl">

      <p><strong>Date:</strong> {report_date}</p>
      <p><strong>City:</strong> {city}</p>
      <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={700}>
          <LineChart data={chartData}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="00 (20250209)" fill="#8884d8" />
            <Line dataKey="12 (20250211)" fill="#FF0000" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500">No data available</p>
      )}

    </div>
  );
};
