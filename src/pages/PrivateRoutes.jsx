// pages/PrivateRoutes.js (modified)
import { Outlet, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";

const PrivateRoutes = () => {
  const user = sessionStorage.getItem("authToken");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(user);
    if (decoded.exp < Date.now() / 1000) {
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default PrivateRoutes;
