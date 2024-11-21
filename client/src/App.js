import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Validate from './components/Validate';
import Charts from './components/Charts';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  // Logout function to clear authentication and redirect to login
  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axios.post('http://localhost:3001/logout');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="App">
      <nav>
        <ul>
          {!isAuthenticated ? (
            <>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
            </>
          ) : (
            <>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          )}
        </ul>
      </nav>
      <Routes>
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/validate" />
            ) : (
              <Register onSuccess={() => navigate('/login')} />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/validate" />
            ) : (
              <Login
                setIsAuthenticated={setIsAuthenticated}
                onSuccess={() => navigate('/charts')}
                onValidationRequired={() => navigate('/validate')}
              />
            )
          }
        />
        <Route
          path="/validate"
          element={
            isAuthenticated ? (
              <Validate onSuccess={() => navigate('/charts')} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/charts"
          element={
            isAuthenticated ? (
              <Charts onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/validate' : '/login'} />} />
      </Routes>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
