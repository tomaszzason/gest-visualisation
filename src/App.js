import { useState } from "react";
import DateCityForm from "./components/DateCityForm";
import ChartPage from "./components/CharPage";
import ComparisonChart from "./components/ComparisonChart";

function App() {
  const [currentPage, setCurrentPage] = useState("form");
  const [formData, setFormData] = useState(null);

  const handleFormSubmit = (data) => {
    setFormData(data);
    setCurrentPage("chart");
  };

  return (
    <div className="p-4">
      {currentPage === "form" && <DateCityForm onSubmit={handleFormSubmit} onCompare={() => setCurrentPage("compare")} />}
      {currentPage === "chart" && <ChartPage report_date={formData.report_date} city={formData.city}  />}
      {currentPage === "compare" && <ComparisonChart />}
    </div>
  );
}

export default App;
