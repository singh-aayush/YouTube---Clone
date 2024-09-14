import React, { useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./components/authcontext.jsx";
import Navbar from "./components/navbar.jsx";
import MainContainer from "./components/maincontainer.jsx";
import Home from "./components/home.jsx";
import SignUp from "./components/sinup.jsx";
import Login from "./components/login.jsx";
import Channel from "./components/channel.jsx";
import Subscription from "./components/subscription.jsx";
import VideoPlayer from "./components/videoPlayer.jsx";
import SearchResults from "./components/searchResultPage.jsx";
import HelpPage from "./components/help.jsx";
import FeedbackPage from "./components/userFeedback.jsx";
import { AuthProvider } from "./components/authcontext.jsx";
import History from "./components/history.jsx";

function AppContent() {
  const { isAuthenticated, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      if (location.pathname !== "/login" && location.pathname !== "/signup") {
        localStorage.setItem("savedPath", location.pathname);
        navigate("/login");
      }
    } else {
      const savedPath = localStorage.getItem("savedPath");
      if (savedPath) {
        navigate(savedPath);
        localStorage.removeItem("savedPath");
      }
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleLoginSuccess = (token) => {
    login(token);
    const savedPath = localStorage.getItem("savedPath") || "/";
    navigate(savedPath);
    localStorage.removeItem("savedPath");
  };

  const handleLogout = () => {
    logout();
  };

  const handleToggleSignup = () => {
    navigate("/signup");
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={location.state?.from || "/"} />
            ) : (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onToggleSignup={handleToggleSignup}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <SignUp onToggleLogin={() => navigate("/login")} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <>
                <Navbar onLogout={handleLogout} />
                <MainContainer />
              </>
            ) : (
              <Navigate to="/signup" />
            )
          }
        >
          <Route index element={<Home />} />
          <Route path="/video/:videoId" element={<VideoPlayer />} />

          <Route path="/subscription" element={<Subscription />} />
          <Route path="/channel/:channelId" element={<Channel />} />
          <Route path="/history" element={<History />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/send-feedback" element={<FeedbackPage />} />
        </Route>

        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
