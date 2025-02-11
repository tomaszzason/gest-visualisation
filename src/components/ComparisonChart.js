import React, { useState, useEffect } from "react";
import {XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const API_URL = "http://localhost:50000/getGefs"; // Replace with actual API

export default function ComparisonChart() {
  const [chartData, setChartData] = useState([]);

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
    <ResponsiveContainer width="100%" height={700}>
      <LineChart data={chartData}>
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line dataKey="00 (20250209)" fill="#8884d8" />
        <Line dataKey="12 (20250211)" fill="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};
