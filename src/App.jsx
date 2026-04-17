// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/auth/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import UsersList from "./pages/admin/UsersList";
import DriverList from "./pages/admin/drivers/DriverList";
import Providers from "./pages/admin/providers/Providers";
import VerifyDrivers from "./pages/admin/drivers/VerifyDrivers";
import DispatcherPanel from "./pages/admin/dispatcher/DispatcherPanel";
import HeatMap from "./pages/admin/heatmap/HeatMap";
import FleetOwner from "./pages/admin/fleet/FleetOwner";
import AccountManager from "./pages/admin/accountManager/AccountManager";
import RouteSettings from "./pages/admin/route/RouteSettings";
import TripDetailsPage from "./pages/admin/tripdetails/TripDetailsPage";
import AdminRatingsPage from "./pages/admin/RatingsPage/AdminRatingsPage";
import TransactionsPage from "./pages/admin/statements/TransactionsPage";
import ScheduledRides from "./pages/admin/ScheduledRides/ScheduledRides";
import PayoutService from "./pages/admin/PayoutService/PayoutService";
import PassengerRatingsReviews from "./pages/admin/PassengerRatingsReviews/PassengerRatingsReviews";
import DriverInspectionPage from "./pages/admin/DriverInspectionPage/DriverInspectionPage";
import DriverRatingsReviewPage from "./pages/admin/DriverRatingsReviewPage";
function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/users/list" element={<UsersList />} />
      <Route path="*" element={<Navigate to="/admin/login" />} />
      <Route path="/admin/drivers/list" element={<DriverList />} />
      <Route path="/admin/providers" element={<Providers />} />
      <Route path="/admin/verify-drivers" element={<VerifyDrivers />} />
      <Route path="/admin/dispatcher" element={<DispatcherPanel />} />
      <Route path="/admin/heatmap" element={<HeatMap />} />
      <Route path="/admin/fleet" element={<FleetOwner />} />
      <Route path="/admin/accountManager" element={<AccountManager />} />
      <Route path="/admin/providers/:userId" element={<Providers />} />
      <Route path="/admin/verify-drivers/:userId" element={<VerifyDrivers />} />
      <Route path="/admin/route-settings" element={<RouteSettings />} />
      <Route path="/admin/trip-details" element={<TripDetailsPage />} />
      <Route path="/admin/ratings" element={<AdminRatingsPage />} />
      <Route path="/admin/transactions" element={<TransactionsPage />} />
      <Route path="/admin/scheduled" element={<ScheduledRides />} />
      <Route path="/admin/payouts" element={<PayoutService />} />
      <Route path="/admin/review" element={<PassengerRatingsReviews />} />
      <Route path="/admin/inspection" element={<DriverInspectionPage />} />
      <Route path="/admin/driver-review" element={<DriverRatingsReviewPage />} />
    </Routes>
  );
}

export default App; // ✅ must be default export