import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './components/login_process/Register';
import Login from './components/login_process/Login';
import Validate from './components/login_process/Validate';
import ChartsPage from './components/charts';
import SocialPage from './components/social';
import MyPostsPage from './components/myposts';
import MyProfilePage from './components/user_management';
import Admin from './components/admin';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

  const [isValidated, setIsValidated] = useState(() => {
    return sessionStorage.getItem('isValidated') === 'true';
  });

  const [userId, setUserId] = useState(() => {
    return sessionStorage.getItem('user_id');
  });

  const [nickname, setNickname] = useState('');
  const [is_admin, setIsAdmin] = useState('');
  const [is_superAdmin, setIsSuperAdmin] = useState('');

  useEffect(() => {
    fetchProfile( userId );
  }, [userId]);

  const fetchProfile = async ( userId ) => {
    try {
      const response = await axios.get(`http://localhost:3001/profile/${userId}`);
      setIsAdmin(response.data.is_admin);
      setNickname(response.data.nickname);
      setIsSuperAdmin(response.data.is_superadmin);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    sessionStorage.setItem('isValidated', isValidated);
  }, [isValidated]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/logout');
      setIsAuthenticated(false);
      setIsValidated(false);
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('isValidated');
      sessionStorage.removeItem('user_id');
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
              setIsValidated={setIsValidated}
              setUserId={setUserId}
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
            <ChartsPage onLogout={handleLogout} isAdmin={is_admin} Nickname={nickname} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/social"
        element={
          isAuthenticated ? (
            <SocialPage onLogout={handleLogout} isAdmin={is_admin} Nickname={nickname} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/myposts"
        element={
          isAuthenticated ? (
            <MyPostsPage onLogout={handleLogout} isAdmin={is_admin} Nickname={nickname} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/myprofile"
        element={
          isAuthenticated ? (
            <MyProfilePage onLogout={handleLogout} isAdmin={is_admin} Nickname={nickname} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/admin"
        element={
          isAuthenticated && is_admin === 1 ? (
            <Admin onLogout={handleLogout} isAdmin={is_admin} Nickname={nickname} isSuperAdmin={is_superAdmin} />
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
