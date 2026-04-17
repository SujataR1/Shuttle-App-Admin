import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const UserGrowthChart = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-4">User Growth</h2>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area dataKey="users" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGrowthChart;