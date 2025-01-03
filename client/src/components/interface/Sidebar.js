import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';

function Sidebar({ onLogout }) {

  const userId = Number(localStorage.getItem('user_id'));
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/profile/${userId}`);
      setNickname(response.data.nickname);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <div className="container-fluid px-0 sticky-top">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-12 col-xl-12 px-sm-2 px-0">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <a href="/" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
              <span className="fs-5 d-none d-sm-inline">Grzyb</span>
            </a>
            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
              <li className="nav-item">
                <Link to="/charts" className="nav-link align-middle px-0">
                  <i className="fs-4 bi bi-bar-chart-fill"></i> <span className="ms-1 d-none d-sm-inline">Charts</span>
                </Link>
              </li>
              <li>
                <a href="#submenu1" data-bs-toggle="collapse" className="nav-link px-0 align-middle">
                  <i className="fs-4 bi-speedometer2"></i> <span className="ms-1 d-none d-sm-inline">Dashboard</span>
                </a>
                <ul className="collapse show nav flex-column ms-1" id="submenu1" data-bs-parent="#menu">
                  <li className="w-100">
                    <a href="#" className="nav-link px-0"> <span className="d-none d-sm-inline">Item</span> 1 </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link px-0"> <span className="d-none d-sm-inline">Item</span> 2 </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <Link to="/social" className="nav-link align-middle px-0">
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
                <img
                  src="https://github.com/mdo.png"
                  alt="user"
                  width="30"
                  height="30"
                  className="rounded-circle"
                />
                <span className="d-none d-sm-inline mx-1">{nickname}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                <li>
                  <Link className='link-underline link-underline-opacity-0' to="/myprofile">
                    <button className="dropdown-item">
                      My Profile
                    </button>
                  </Link>
                </li>
                <li>
                  <Link className='link-underline link-underline-opacity-0' to="/myposts">
                    <button className="dropdown-item">
                      My Posts
                    </button>
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={onLogout}>
                    Sign out
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
