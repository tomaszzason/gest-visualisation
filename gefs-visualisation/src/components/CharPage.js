import React, { useEffect, useState } from "react";
import {useNavigate, useLocation } from "react-router-dom";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Button = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    {children}
  </button>
);

export default function ChartComponent() {

  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const report_date = params.get("date");
  const city = params.get("city");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedDate = report_date.replace(/-/g, ""); // "20250110"
        const response = await fetch("http://localhost:50000/getGefs?report_date="+formattedDate +"&city="+city); // Replace with your API URL
        if (!response.ok) throw new Error("Failed to fetch data");
        const jsonData = await response.json();
        
        console.log("API Response:", jsonData); // Debugging output
        
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          console.warn("Empty or invalid data received");
          return;
        }

        const formattedData = jsonData.map(item => ({
          time: item.time, // Use raw timestamps
          oo: parseFloat(item["00"]),
          o6: parseFloat(item["06"]) || 0 ,// Ensure numeric qty, default to 0 if NaN
          12: parseFloat(item["12"]) || 0,
          18: parseFloat(item["18"]) || 0
        }));

        setData([...formattedData]); // Force re-render
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [report_date, city]);

  console.log("Final Rendered Data:", data); // Debugging output

  return (
    <div className="w-full h-96 p-4 bg-white shadow-lg rounded-xl">
      <h2 className="text-xl font-semibold mb-4">GEFS forecast</h2>
      <p><strong>Date:</strong> {report_date}</p>
      <p><strong>City:</strong> {city}</p>
      <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis 
              dataKey="time" tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} 
              domain={['dataMin', 'dataMax']} 
            />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip labelFormatter={(label) => new Date(label).toISOString()}/>
            <Line type="monotone" dataKey="oo" stroke="#A3f3d8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="o6" stroke="#F3f388" strokeWidth={2} dot={true} label="06"/>
            <Line type="monotone" dataKey="12" stroke="#8884d8" strokeWidth={2} dot={true} label="12"/>
            <Line type="monotone" dataKey="18" stroke="#888888" strokeWidth={2} dot={true} label="06"/>
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500">No data available</p>
      )}
    </div>
  );
};