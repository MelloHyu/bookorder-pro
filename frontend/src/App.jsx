import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RepView from "./pages/RepView";
import ProtectedRoute from "./components/ProtectedRoute";
import Reports from "./pages/Reports";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reports" element={<Reports />} />
        {/* 🔒 PROTECTED ROUTES */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute role="publisher">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/rep"
          element={
            <ProtectedRoute role="rep">
              <RepView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
