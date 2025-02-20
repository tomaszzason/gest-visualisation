import React, { useState, useEffect } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar, Label, CartesianGrid } from "recharts";

const API_URL = "http://localhost:50000/getGefs"; 

const Button = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    {children}
  </button>
);

export default function ComparisonChart() {
  const [chartData, setChartData] = useState([]);
  const [avgChartData, setAvgChartData] = useState([]);
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const date1 = params.get("date").replace(/-/g, "");
  const date2 = params.get("date2").replace(/-/g, "");
  const cc1 = params.get("cc1")
  const cc2 = params.get("cc2")

  const city = params.get("city");
  // const time1 = cc1.split(',')[0];
  // const time2 = cc2.split(',')[0];
  const dataKey1 = `${cc1} (${date1})`;
  const dataKey2 = `${cc2} (${date2})`;

  const groupByReportDateAndAvg = (data) => {
    const groupedData = {};
  
    data.forEach((item) => {
      const { report_date, "00": value } = item;
  
      if (!groupedData[report_date]) {
        groupedData[report_date] = { sum: 0, count: 0 };
      }
  
      if (typeof value === "number") {
        groupedData[report_date].sum += value;
        groupedData[report_date].count += 1;
      }
    });
  
    const result = Object.keys(groupedData).map((report_date) => ({
      report_date,
      avg: groupedData[report_date].count
        ? groupedData[report_date].sum / groupedData[report_date].count
        : 0,
    }));
  
    return result;
  };

  const mergeGroupedResults = (resultsArray) => {
    const mergedData = {};
  
    resultsArray.flat().forEach(({ report_date, avg }) => {
      if (!mergedData[report_date]) {
        mergedData[report_date] = { sum: 0, count: 0 };
      }
      mergedData[report_date].sum += avg;
      mergedData[report_date].count += 1;
    });
  
    return Object.keys(mergedData).map((report_date) => ({
      report_date,
      avg: mergedData[report_date].sum / mergedData[report_date].count,
    }));
  };
  
  // Example usage:
  const apiResponse = [
    {
      "12": -9.569999999999993,
      "18": -9.659999999999968,
      "_id": "67b630391755f16ede02edf8",
      "report_date": "20250219",
      "time": "2025-02-19 21:00",
      "city": "Chicago",
      "00": -9.919999999999959,
      "06": -9.799999999999955,
    },
    {
      "12": -8.569999999999993,
      "18": -8.659999999999968,
      "_id": "67b630391755f16ede02edf9",
      "report_date": "20250219",
      "time": "2025-02-19 22:00",
      "city": "Chicago",
      "00": -8.919999999999959,
      "06": -8.799999999999955,
    },
  ];
  
  


  const data = [
    { name: "Geeksforgeeks", students: 400 },
    { name: "Technical scripter", students: 700 },
    { name: "Geek-i-knack", students: 200 },
    { name: "Geek-o-mania", students: 1000 },
];

  const data2 = [
    { name: "00", value: 10 },
    { name: "18", value: 8 },
  ];



//city,dataKey1,dataKey2,date1,date2
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await fetch(`${API_URL}?report_date=${date1}&city=${city}`);
        const response2 = await fetch(`${API_URL}?report_date=${date2}&city=${city}`);

        const data1 = await response1.json();
        const data2 = await response2.json();

        const avg_00 = groupByReportDateAndAvg(data1)
        const avg_00_1 = groupByReportDateAndAvg(data2)
        const mergedAvg = mergeGroupedResults([avg_00, avg_00_1])
        setAvgChartData(mergedAvg)
        console.log("AVG Data:", mergedAvg); // Debugging output

        // Convert arrays to objects mapped by "time"
        const dataMap1 = Object.fromEntries(data1.map((item) => [item.time, item]));
        const dataMap2 = Object.fromEntries(data2.map((item) => [item.time, item]));


        // Merge data based on time
        const mergedData = Object.keys(dataMap1).map((time) => ({
          time,
          [dataKey1]: dataMap1[time]?.[cc1] || null,
          [dataKey2]: dataMap2[time]?.[cc2] || null,
        }));

        //console.log("Prepared Data:", mergedData); // Debugging output
        setChartData(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      
    };

    fetchData();
  }, [cc1, cc2, city, dataKey1, dataKey2, date1, date2]);

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


    <BarChart width={600} height={600} data={avgChartData}>
            <Bar dataKey="avg" fill="green" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="report_date" />
            <YAxis />
        </BarChart>

    </div>



  );
};
