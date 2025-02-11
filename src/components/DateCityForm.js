import { useState } from "react";

export default function DateCityForm({ onSubmit, onCompare }) {
  const [formData, setFormData] = useState({ report_date: "", city: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    if (onSubmit) onSubmit(formData); // Pass form data to parent component
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Enter Details</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            name="report_date"
            value={formData.report_date}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md"
          />
        </div>
        <div className="flex space-x-4 mt-4">
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">Submit</button>
        <button type="button" onClick={onCompare} className="px-4 py-2 bg-orange-500 text-white rounded-md">Compare</button>
        </div>
       
      </form>
    </div>
  );
}
