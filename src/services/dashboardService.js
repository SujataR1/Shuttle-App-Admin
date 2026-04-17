export const getDashboardData = async () => {
  // MOCK DATA for testing without backend
  return {
    totalUsers: 1200,
    totalBusOwners: 150,
    totalDrivers: 300,
    activeTrips: 45,
    totalRevenue: 25000,
    dailyRevenue: [
      { date: "Mon", revenue: 400 },
      { date: "Tue", revenue: 700 },
      { date: "Wed", revenue: 300 },
    ],
    monthlyRevenue: [
      { month: "Jan", revenue: 5000 },
      { month: "Feb", revenue: 8000 },
    ],
    userGrowth: [
      { month: "Jan", users: 200 },
      { month: "Feb", users: 400 },
    ],
  };
};