import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DateCityForm from "./components/DateCityForm";
import ChartPage from "./components/CharPage";
import ComparisonChart from "./components/ComparisonChart";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DateCityForm />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/compare" element={<ComparisonChart />} />
      </Routes>
    </Router>
  );

}

export default App;
