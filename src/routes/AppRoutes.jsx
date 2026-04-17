import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "../pages/auth/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import UsersList from "../pages/admin/UsersList"; // <-- import your page

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/users/list" element={<UsersList />} />  {/* <- Add this */}
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
// // src/routes/AppRoutes.jsx
// import { Routes, Route, Navigate } from "react-router-dom";
// import AdminLogin from "../pages/auth/AdminLogin";
// import Dashboard from "../pages/admin/Dashboard";
// import UsersList from "../pages/admin/UsersList";
// import ProtectedRoute from "./PrivateRoute";

// const AppRoutes = () => {
//   return (
//     <Routes>
//       {/* Public Route */}
//       <Route path="/admin/login" element={<AdminLogin />} />

//       {/* Protected Routes */}
//       <Route
//         path="/admin/dashboard"
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/admin/users/list"
//         element={
//           <ProtectedRoute>
//             <UsersList />
//           </ProtectedRoute>
//         }
//       />

//       {/* Redirect unknown paths */}
//       <Route path="*" element={<Navigate to="/admin/login" replace />} />
//     </Routes>
//   );
// };

// export default AppRoutes;