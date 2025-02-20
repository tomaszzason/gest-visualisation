import React, { useState, useEffect } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const API_URL = "http://localhost:50000/getGefs"; 

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
  const date1 = params.get("date").replace(/-/g, "");
  const date2 = params.get("date2").replace(/-/g, "");
  const cc1 = params.get("cc1")
  const cc2 = params.get("cc2")

  const city = params.get("city");
  const time1 = cc1.split(',')[0];
  const time2 = cc2.split(',')[0];
  const dataKey1 = `${time1} (${date1})`;
  const dataKey2 = `${time2} (${date2})`;

  useEffect((city,dataKey1,dataKey2,time1,time2,date1,date2) => {
    const fetchData = async () => {
      try {
        const response1 = await fetch(`${API_URL}?report_date=${date1}&city=${city}`);
        const response2 = await fetch(`${API_URL}?report_date=${date2}&city=${city}`);

        const data1 = await response1.json();
        const data2 = await response2.json();

        // Convert arrays to objects mapped by "time"
        const dataMap1 = Object.fromEntries(data1.map((item) => [item.time, item]));
        const dataMap2 = Object.fromEntries(data2.map((item) => [item.time, item]));


        // Merge data based on time
        const mergedData = Object.keys(dataMap1).map((time) => ({
          time,
          [dataKey1]: dataMap1[time]?.[time1] || null,
          [dataKey2]: dataMap2[time]?.[time2] || null,
        }));

        //console.log("Prepared Data:", mergedData); // Debugging output
        setChartData(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (

    <div className="w-full h-96 p-4 bg-white shadow-lg rounded-xl">

      <p><strong>Date:</strong> {date1}</p>
      <p><strong>Date to compare:</strong> {date2}</p>
      <p><strong>City:</strong> {city}</p>
      <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={700}>
          <LineChart data={chartData}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey={dataKey1} dot={false} />
            <Line dataKey={dataKey2} stroke="green" dot={false} strokeWidth={3}/>
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500">No data available</p>
      )}

    </div>
  );
};
