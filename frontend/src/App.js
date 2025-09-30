import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import EmailVerification from './pages/Auth/EmailVerification';
import ResendVerification from './pages/Auth/ResendVerification';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import Explore from './pages/Explore';
import AvailabilityEditor from './pages/Availability/AvailabilityEditor';
import CalendarSettings from './pages/Settings/CalendarSettings';
import Friends from './pages/Friends';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email/:token" element={<EmailVerification />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/:username" element={<Profile />} />
              
              {/* Protected Routes */}
              <Route path="/edit-profile" element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } />
              <Route path="/availability" element={
                <ProtectedRoute>
                  <AvailabilityEditor />
                </ProtectedRoute>
              } />
              <Route path="/settings/calendar" element={
                <ProtectedRoute>
                  <CalendarSettings />
                </ProtectedRoute>
              } />
              <Route path="/friends" element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
