import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return user?.accessToken ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;