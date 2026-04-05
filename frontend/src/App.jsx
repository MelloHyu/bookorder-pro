import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RepView from "./pages/RepView";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

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