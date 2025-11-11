import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { initializeAuth } from "./store/slices/authSlice";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useSocket } from "./hooks/useSocket";
import Toast from "./components/Toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import MLM from "./pages/MLM";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";
import CrmSync from "./pages/CrmSync";
import CustomersPage from "./modules/customers/CustomersPage";
import KanbanBoard from "./modules/orders/KanbanBoard";
import MastersPage from "./modules/masters/MastersPage";
import FinanceDashboard from "./modules/finance/FinanceDashboard";
import Layout from "./components/Layout";

function AppContent() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  useSocket(); // Подключаем Socket.io

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <>
      <Toast />
      <Routes>
      <Route
        path="/login"
        element={auth.isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={auth.isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/users"
        element={auth.isAuthenticated ? <Layout><Users /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/orders"
        element={auth.isAuthenticated ? <Layout><Orders /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/payments"
        element={auth.isAuthenticated ? <Layout><Payments /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/mlm"
        element={auth.isAuthenticated ? <Layout><MLM /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/reports"
        element={auth.isAuthenticated ? <Layout><Reports /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={auth.isAuthenticated ? <Layout><Profile /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/schedule"
        element={auth.isAuthenticated ? <Layout><Schedule /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/crm/sync"
        element={auth.isAuthenticated ? <Layout><CrmSync /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/crm/customers"
        element={auth.isAuthenticated ? <Layout><CustomersPage /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/crm/orders/kanban"
        element={auth.isAuthenticated ? <Layout><KanbanBoard /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/crm/masters"
        element={auth.isAuthenticated ? <Layout><MastersPage /></Layout> : <Navigate to="/login" />}
      />
      <Route
        path="/crm/finance"
        element={auth.isAuthenticated ? <Layout><FinanceDashboard /></Layout> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
