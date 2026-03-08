import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExpertLayout } from "./pages/Expert_dashboard/expertdashboard";
import ExpertDashboard from "./pages/Expert_dashboard/expertdashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/expert" element={<ExpertLayout />}>
          <Route index element={<ExpertDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/expert" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;  // ← this was missing!