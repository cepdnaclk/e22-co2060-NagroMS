import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExpertLayout } from "./pages/Expert_dashboard/expertdashboard";
import ExpertDashboard from "./pages/Expert_dashboard/expertdashboard";
import ConsultationRequests from "./pages/Expert_dashboard/consultationrequests";
import QAForum from "./pages/Expert_dashboard/qaforum";
import KnowledgeBase from "./pages/Expert_dashboard/knowledgebase";
import ExpertSettings from "./pages/Expert_dashboard/expertsettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/expert" element={<ExpertLayout />}>
          <Route index element={<ExpertDashboard />} />
          <Route path="consultations" element={<ConsultationRequests />} />
          <Route path="qa-forum" element={<QAForum />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="settings" element={<ExpertSettings />} />
        </Route>

        {/* Redirect everything to expert for now */}
        <Route path="*" element={<Navigate to="/expert" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;