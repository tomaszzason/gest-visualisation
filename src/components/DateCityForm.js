import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Button = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    {children}
  </button>
);


export default function DateCityForm({ onSubmit, onCompare }) {
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (path) => {
    if (!city || !date) {
     alert("Please enter both date and city");
     return;
    }
    navigate(`${path}?date=${encodeURIComponent(date)}&city=${encodeURIComponent(city)}`);
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
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City:</label>
          <input
            type="text"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)} 
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div className="flex space-x-4 mt-4">
        <Button onClick={() => handleSubmit("/chart")}>Submit</Button>
        <Button variant="outline" onClick={() => handleSubmit("/compare")}>Compare</Button>
        </div>
       
    </div>
  );
}
