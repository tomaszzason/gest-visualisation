export default function SuccessPage({ report_date, city }) {
    return (
      <div className="p-4 max-w-md mx-auto bg-green-100 rounded-xl shadow-md space-y-4">
        <h2 className="text-xl font-bold text-green-700">Form Submitted Successfully!</h2>
        <p><strong>Report Date:</strong> {report_date}</p>
        <p><strong>City:</strong> {city}</p>
      </div>
    );
  }
  