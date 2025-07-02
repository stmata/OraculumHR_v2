import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem("authToken"); // double bang = cast en booléen
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default PrivateRoute;
