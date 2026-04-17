import { useEffect, useState } from "react";
import { getDashboardData } from "../services/dashboardService";

const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      console.error("Dashboard API error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { data, loading };
};

export default useDashboard;