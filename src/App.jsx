// // src/App.jsx
// import { Routes, Route, Navigate } from "react-router-dom";
// import AdminLogin from "./pages/auth/AdminLogin";
// import Dashboard from "./pages/admin/Dashboard";
// import UsersList from "./pages/admin/UsersList";
// import DriverList from "./pages/admin/drivers/DriverList";
// import Providers from "./pages/admin/providers/Providers";
// import VerifyDrivers from "./pages/admin/drivers/VerifyDrivers";
// import DispatcherPanel from "./pages/admin/dispatcher/DispatcherPanel";
// import HeatMap from "./pages/admin/heatmap/HeatMap";
// import FleetOwner from "./pages/admin/fleet/FleetOwner";
// import AccountManager from "./pages/admin/accountManager/AccountManager";
// import RouteSettings from "./pages/admin/route/RouteSettings";
// import TripDetailsPage from "./pages/admin/tripdetails/TripDetailsPage";
// import AdminRatingsPage from "./pages/admin/RatingsPage/AdminRatingsPage";
// import TransactionsPage from "./pages/admin/statements/TransactionsPage";
// import ScheduledRides from "./pages/admin/ScheduledRides/ScheduledRides";
// import PayoutService from "./pages/admin/PayoutService/PayoutService";
// import PassengerRatingsReviews from "./pages/admin/PassengerRatingsReviews/PassengerRatingsReviews";
// import DriverInspectionPage from "./pages/admin/DriverInspectionPage/DriverInspectionPage";
// import DriverRatingsReviewPage from "./pages/admin/DriverRatingsReviewPage";
// import CancellationFine from "./pages/admin/CancellationFine";
// import DriverPayments from "./pages/admin/DriverPayments";
// import PassengerAllTrips from "./pages/admin/PassengerAllTrips";
// import DevicesList from "./pages/admin/devices/DevicesList";
// import RegisterDevice from "./pages/admin/devices/RegisterDevice";
// import CardsList from "./pages/admin/cards/CardsList";
// import RegisterCard from "./pages/admin/cards/RegisterCard";
// import BulkRegisterCard from "./pages/admin/cards/BulkRegisterCard";
// import CardDetails from "./pages/admin/cards/CardDetails";
// import TransactionLedger from "./pages/admin/reports/TransactionLedger";
// import RechargeHistory from "./pages/admin/reports/RechargeHistory";
// import CardActivityLog from "./pages/admin/reports/CardActivityLog";
// import SeatPolicy from "./pages/admin/devices/SeatPolicy";
// import ScanEvents from "./pages/admin/rfid/ScanEvents";
// import RideHistory from "./pages/admin/rfid/RideHistory";

// function App() {
//   return (
//     <Routes>
//       <Route path="/admin/login" element={<AdminLogin />} />
//       <Route path="/admin/dashboard" element={<Dashboard />} />
//       <Route path="/admin/users/list" element={<UsersList />} />
//       <Route path="*" element={<Navigate to="/admin/login" />} />
//       <Route path="/admin/drivers/list" element={<DriverList />} />
//       <Route path="/admin/providers" element={<Providers />} />
//       <Route path="/admin/verify-drivers" element={<VerifyDrivers />} />
//       <Route path="/admin/dispatcher" element={<DispatcherPanel />} />
//       <Route path="/admin/heatmap" element={<HeatMap />} />
//       <Route path="/admin/fleet" element={<FleetOwner />} />
//       <Route path="/admin/accountManager" element={<AccountManager />} />
//       <Route path="/admin/providers/:userId" element={<Providers />} />
//       <Route path="/admin/verify-drivers/:userId" element={<VerifyDrivers />} />
//       <Route path="/admin/route-settings" element={<RouteSettings />} />
//       <Route path="/admin/trip-details" element={<TripDetailsPage />} />
//       <Route path="/admin/ratings" element={<AdminRatingsPage />} />
//       <Route path="/admin/transactions" element={<TransactionsPage />} />
//       <Route path="/admin/scheduled" element={<ScheduledRides />} />
//       <Route path="/admin/payouts" element={<PayoutService />} />
//       <Route path="/admin/review" element={<PassengerRatingsReviews />} />
//       <Route path="/admin/inspection" element={<DriverInspectionPage />} />
//       <Route path="/admin/driver-review" element={<DriverRatingsReviewPage />} />
//       <Route path="/admin/cancellation-fine" element={<CancellationFine />} />
//       <Route path="/admin/payments" element={<DriverPayments />} />
//       <Route path="/admin/Passenger-all-trips" element={<PassengerAllTrips />} />
//       <Route path="/admin/rfid/devices" element={<DevicesList />} />
//       <Route path="/admin/rfid/devices/register" element={<RegisterDevice />} />
//       <Route path="/admin/rfid/cards" element={<CardsList />} />
//       <Route path="/admin/rfid/cards/register" element={<RegisterCard />} />
//       <Route path="/admin/rfid/cards/bulk-register" element={<BulkRegisterCard />} />
//       <Route path="/admin/rfid/cards/:cardId" element={<CardDetails />} />
//       <Route path="/admin/rfid/transaction-ledger" element={<TransactionLedger />} />
//       <Route path="/admin/rfid/recharge-history" element={<RechargeHistory />} />
//       <Route path="/admin/rfid/card-activity-log" element={<CardActivityLog />} />
//       <Route path="/admin/rfid/seat-policy" element={<SeatPolicy />} />
//       <Route path="/admin/rfid/scan-events" element={<ScanEvents />} />
//       <Route path="/admin/rfid/ride-history" element={<RideHistory />} />
//     </Routes>
//   );
// }

// export default App; 
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
import CancellationFine from "./pages/admin/CancellationFine";
import DriverPayments from "./pages/admin/DriverPayments";
import PassengerAllTrips from "./pages/admin/PassengerAllTrips";
import DevicesList from "./pages/admin/devices/DevicesList";
import RegisterDevice from "./pages/admin/devices/RegisterDevice";
import CardsList from "./pages/admin/cards/CardsList";
import RegisterCard from "./pages/admin/cards/RegisterCard";
import BulkRegisterCard from "./pages/admin/cards/BulkRegisterCard";
import CardDetails from "./pages/admin/cards/CardDetails";
import TransactionLedger from "./pages/admin/reports/TransactionLedger";
import RechargeHistory from "./pages/admin/reports/RechargeHistory";
import CardActivityLog from "./pages/admin/reports/CardActivityLog";
import SeatPolicy from "./pages/admin/devices/SeatPolicy";
import ScanEvents from "./pages/admin/rfid/ScanEvents";
import RideHistory from "./pages/admin/rfid/RideHistory";
import PayoutDashboard from "./pages/admin/rfid/PayoutDashboard";
import PayoutTransfers from "./pages/admin/rfid/PayoutTransfers";
import PayoutTransferDetail from "./pages/admin/rfid/PayoutTransferDetail";
import PayoutReversals from "./pages/admin/rfid/PayoutReversals";
import AllDevice from "./pages/admin/devices/AllDevice";
import DeviceSettings from "./pages/admin/devices/DeviceSettings";

function App() {
  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Dashboard */}
      <Route path="/admin/dashboard" element={<Dashboard />} />
      
      {/* User Management */}
      <Route path="/admin/users/list" element={<UsersList />} />
      <Route path="/admin/drivers/list" element={<DriverList />} />
      
      {/* Verification Routes */}
      <Route path="/admin/providers" element={<Providers />} />
      <Route path="/admin/providers/:userId" element={<Providers />} />
      <Route path="/admin/verify-drivers" element={<VerifyDrivers />} />
      <Route path="/admin/verify-drivers/:userId" element={<VerifyDrivers />} />
      
      {/* Operations */}
      <Route path="/admin/dispatcher" element={<DispatcherPanel />} />
      <Route path="/admin/heatmap" element={<HeatMap />} />
      <Route path="/admin/fleet" element={<FleetOwner />} />
      <Route path="/admin/accountManager" element={<AccountManager />} />
      <Route path="/admin/inspection" element={<DriverInspectionPage />} />
      
      {/* Routes & Trips */}
      <Route path="/admin/route-settings" element={<RouteSettings />} />
      <Route path="/admin/trip-details" element={<TripDetailsPage />} />
      <Route path="/admin/scheduled" element={<ScheduledRides />} />
      <Route path="/admin/Passenger-all-trips" element={<PassengerAllTrips />} />
      
      {/* Ratings & Reviews */}
      <Route path="/admin/ratings" element={<AdminRatingsPage />} />
      <Route path="/admin/review" element={<PassengerRatingsReviews />} />
      <Route path="/admin/driver-review" element={<DriverRatingsReviewPage />} />
      
      {/* Finance */}
      <Route path="/admin/transactions" element={<TransactionsPage />} />
      <Route path="/admin/payouts" element={<PayoutService />} />
      <Route path="/admin/cancellation-fine" element={<CancellationFine />} />
      <Route path="/admin/payments" element={<DriverPayments />} />
      
      {/* RFID Management - Devices */}
      <Route path="/admin/rfid/devices" element={<DevicesList />} />
      <Route path="/admin/rfid/devices/register" element={<RegisterDevice />} />
      
      {/* RFID Management - Cards */}
      <Route path="/admin/rfid/cards" element={<CardsList />} />
      <Route path="/admin/rfid/cards/register" element={<RegisterCard />} />
      <Route path="/admin/rfid/cards/bulk-register" element={<BulkRegisterCard />} />
      <Route path="/admin/rfid/cards/:cardId" element={<CardDetails />} />
      
      {/* RFID Management - Reports */}
      <Route path="/admin/rfid/transaction-ledger" element={<TransactionLedger />} />
      <Route path="/admin/rfid/recharge-history" element={<RechargeHistory />} />
      <Route path="/admin/rfid/card-activity-log" element={<CardActivityLog />} />
      
      {/* RFID Management - Scan & Ride (Updated paths to match sidebar) */}
      <Route path="/admin/rfid/scan-events" element={<ScanEvents />} />
      <Route path="/admin/rfid/ride-history" element={<RideHistory />} />
      
      {/* RFID Management - Settings */}
      <Route path="/admin/rfid/seat-policy" element={<SeatPolicy />} />
      
      {/* Catch-all redirect - MUST BE LAST */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />

      {/* RFID Management - Settings */}
      <Route path="/admin/rfid/payout-dashboard" element={<PayoutDashboard />} /> 
      <Route path="/admin/rfid/payout-transfers" element={<PayoutTransfers />} />
      <Route path="/admin/rfid/payout-transfers/:transferId" element={<PayoutTransferDetail />} />
      <Route path="/admin/rfid/payout-reversals" element={<PayoutReversals />} />
      <Route path="/admin/rfid/payout-ready" element={<PayoutTransfers />} />
      <Route path="/admin/all-devices" element={<AllDevice />} />
      <Route path="/admin/device-settings" element={<DeviceSettings />} />
    </Routes>
  );
}

export default App;