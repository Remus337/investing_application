import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './components/user_management/Register';
import Login from './components/user_management/Login';
import Validate from './components/user_management/Validate';
import ChartsPage from './components/charts';
import SocialPage from './components/social';
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
