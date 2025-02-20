import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:50000/cities";


const Button = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    {children}
  </button>
);


export default function DateCityForm({ onSubmit, onCompare }) {
  const [date, setDate] = useState("");
  const [date2, setDate2] = useState("");
  const [selectedCity, setCity] = useState("");
  const navigate = useNavigate();
  const forcastCycles = ["00", "06", "12", "18"];
  const [cities, setCities] = useState([]);
  const [selectedCycles, setSelectedCycles] = useState([]);
  const [selectedCycles2, setSelectedCycles2] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setCities(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleSubmit = (path) => {
    if (!selectedCity || !date) {
      alert("Please enter both date and city");
      return;
    }
    navigate(`${path}?date=${encodeURIComponent(date)}&date2=${encodeURIComponent(date2)}&cc1=${encodeURIComponent(selectedCycles.join(", "))}&cc2=${encodeURIComponent(selectedCycles2.join(", "))}&city=${encodeURIComponent(selectedCity)}`);
  };

  const handleCheckboxChange = (event) => {
    const value = event.target.value;
    setSelectedCycles((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleCheckboxChange2 = (event) => {
    const value = event.target.value;
    setSelectedCycles2((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleCityChange = (event) => {
    const selectedValues = Array.from(event.target.selectedOptions, (option) => option.value);
    console.log("City has changed:", selectedValues); // Debugging output

    setCity(selectedValues);
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Enter Details</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date:</label>
        <input
          type="date"
          name="report_date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
        />
        {forcastCycles.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              value={option}
              checked={selectedCycles.includes(option)}
              onChange={handleCheckboxChange} />
            {option}
          </label>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date to compare:</label>
        <input
          type="date"
          name="report_date"
          value={date2}
          onChange={(e) => setDate2(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md"
        />

        {forcastCycles.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              value={option}
              checked={selectedCycles2.includes(option)}
              onChange={handleCheckboxChange2} />
            {option}
          </label>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">City:</label>
        <select value={selectedCity} onChange={handleCityChange} style={{ width: "200px" }}>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div className="flex space-x-4 mt-4">
        <Button onClick={() => handleSubmit("/chart")}>Submit</Button>
        <Button variant="outline" onClick={() => handleSubmit("/compare")}>Compare</Button>
      </div>

    </div>
  );
}
