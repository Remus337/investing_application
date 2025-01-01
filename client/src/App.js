import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './components/login_process/Register';
import Login from './components/login_process/Login';
import Validate from './components/login_process/Validate';
import ChartsPage from './components/charts';
import SocialPage from './components/social';
import MyPostsPage from './components/myposts';
import MyProfilePage from './components/user_management';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [isValidated, setIsValidated] = useState(() => {
    return localStorage.getItem('isValidated') === 'true';
  });

  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('isValidated', isValidated);
  }, [isValidated]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/logout');
      setIsAuthenticated(false);
      setIsValidated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isValidated');
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Routes>
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/charts" />
          ) : (
            <Register onSuccess={() => setIsAuthenticated(true)} />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/charts" />
          ) : (
            <Login
              setIsAuthenticated={setIsAuthenticated}
              onSuccess={() => setIsAuthenticated(true)}
              onValidationRequired={() => {
                setIsValidated(false);
              }}
            />
          )
        }
      />
      <Route
        path="/validate"
        element={
          isValidated ? (
            <Navigate to="/login" />
          ) : (
            <Validate
              onSuccess={() => {
                setIsValidated(true);
                navigate('/login');
              }}
            />
          )
        }
      />
      <Route
        path="/charts"
        element={
          isAuthenticated ? (
            <ChartsPage onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/social"
        element={
          isAuthenticated ? (
            <SocialPage onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/myposts"
        element={
          isAuthenticated ? (
            <MyPostsPage onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/myprofile"
        element={
          isAuthenticated ? (
            <MyProfilePage onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/charts' : '/login'} />} />
    </Routes>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
