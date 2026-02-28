import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Admin/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Mainfol from "./Admin/Mainfol";
import { AuthProvider } from "./context/AuthContext";
import Unauthorized from "./routes/Unauthorized";
import Users from "./Admin/Users";
import CheckIns from "./Admin/CheckIns";
import Shifts from "./Admin/Shifts";
import Attendance from "./Admin/Attendance";
import Leaves from "./Admin/Leaves";
import Dashboard from "./Admin/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Mainfol />}>
    <Route index element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="checkins" element={<CheckIns />} />
    <Route path="shifts" element={<Shifts />} />
    <Route path="attendance" element={<Attendance />} />
    <Route path="leaves" element={<Leaves />} />
  </Route>
</Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
