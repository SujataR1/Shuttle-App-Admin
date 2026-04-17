import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RevenueChart = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-4">Daily Revenue</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line dataKey="revenue" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;