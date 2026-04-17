const KpiCard = ({ title, value }) => {
  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-bold mt-2">{value}</h2>
    </div>
  );
};

export default KpiCard;