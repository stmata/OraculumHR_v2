import React from "react";
import { Routes, Route } from "react-router-dom";
import PageNotFound from "../pages/PageNotFound/PageNotFound";
import OraculumHR from "../pages/OraculumHR/OraculumHR";
import Login from "../components/Authentifiction/Login/Login";
import PrivateRoute from "./PrivateRoute";

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/hr" element={<PrivateRoute element={<OraculumHR />} />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default ProtectedRoutes;
