import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Sidebar({ onLogout, isAdmin, Nickname }) {
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch(`http://localhost:3001/users/avatar/${Nickname}`);
        const data = await response.json();
        setAvatarUrl(data.avatarUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };

    if (Nickname) {
      fetchAvatar();
    }
  }, [Nickname]);

  return (
    <div className="container-fluid px-0 sticky-top">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-12 col-xl-12 px-sm-2 px-0">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <a href="/" className="d-flex flex-column pb-3 mb-3 me-md-auto text-white text-decoration-none">
              <span className="fs-5 fw-light d-sm-inline">NAI</span>
              <span className="fs-6 fw-light">Build your future</span>
            </a>
            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
              <li className="nav-item">
                <Link to="/charts" className="nav-link align-middle px-0 text-light">
                  <i className="fs-4 bi bi-bar-chart-fill"></i> <span className="ms-1 d-none d-sm-inline">Charts</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/myshares" className="nav-link align-middle px-0 text-light">
                  <i className="fs-4 bi bi-bank"></i> <span className="ms-1 d-none d-sm-inline">Wallet</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/investbot" className="nav-link align-middle px-0 text-light">
                  <i className="fs-4 bi bi bi-robot"></i> <span className="ms-1 d-none d-sm-inline">InvestBot</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/social" className="nav-link align-middle px-0 text-light">
                  <i className="fs-4 bi bi bi-signal"></i> <span className="ms-1 d-none d-sm-inline">Social</span>
                </Link>
              </li>
            </ul>
            <hr />
            <div className="dropdown pb-4">
              <a
                href="#"
                className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                id="dropdownUser1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" width="32" height="32" className="rounded-circle me-2" />
                ) : (
                  <i className="bi bi-person-circle fs-4"></i>
                )}
                <span className="d-none d-sm-inline mx-1">{Nickname}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                {isAdmin === 1 && (
                  <li>
                    <Link className='link-underline link-underline-opacity-0' to="/admin">
                      <button className="dropdown-item">
                        <i className="bi bi-shield-shaded"></i> Admin Panel
                      </button>
                    </Link>
                  </li>
                )}
                <li>
                  <Link className='link-underline link-underline-opacity-0' to="/myprofile">
                    <button className="dropdown-item">
                      <i className="bi bi-person-lines-fill"></i> My Profile
                    </button>
                  </Link>
                </li>
                <li>
                  <Link className='link-underline link-underline-opacity-0' to="/myposts">
                    <button className="dropdown-item">
                      <i className="bi bi-person-rolodex"></i> My Posts
                    </button>
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={onLogout}>
                    <i className="bi bi-box-arrow-in-left"></i> Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
