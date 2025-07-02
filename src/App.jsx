import React, { useContext, useEffect } from "react"; 
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeContext } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";
import { DARK_THEME } from "./constants/themeConstants";
import ProtectedRoutes from "./routes/ProtectedRoute";
import "./App.scss";

function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === DARK_THEME);
  }, [theme]);

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
