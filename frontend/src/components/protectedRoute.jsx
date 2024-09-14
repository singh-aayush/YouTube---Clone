import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ element }) {
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  return isLoggedIn ? element : <Navigate to="/login" />;
}

export default ProtectedRoute;
