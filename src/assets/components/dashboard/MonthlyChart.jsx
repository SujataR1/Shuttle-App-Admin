import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MonthlyChart = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-4">Monthly Revenue</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;