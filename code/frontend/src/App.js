import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landingpage/Landingpage";
import { FarmerDashboard } from "./pages/farmer/farmerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page at root URL */}
        <Route path="/" element={<LandingPage />} />

        {/* Farmer Dashboard at /farmer */}
        <Route path="/farmer" element={<FarmerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;