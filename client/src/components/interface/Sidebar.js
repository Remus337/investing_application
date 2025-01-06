import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Sidebar({ onLogout, isAdmin, Nickname }) {

  return (
    <div className="container-fluid px-0 sticky-top">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-12 col-xl-12 px-sm-2 px-0">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <a href="/" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
              <span className="fs-5 d-none d-sm-inline">NAI</span>
            </a>
            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
              <li className="nav-item">
                <Link to="/charts" className="nav-link align-middle px-0">
                  <i className="fs-4 bi bi-bar-chart-fill"></i> <span className="ms-1 d-none d-sm-inline">Charts</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/investbot" className="nav-link align-middle px-0">
                  <i className="fs-4 bi bi bi-robot"></i> <span className="ms-1 d-none d-sm-inline">InvestBot</span>
                </Link>
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
                <i className="bi bi-person-circle fs-4"></i>
                <span className="d-none d-sm-inline mx-1">{Nickname}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                {isAdmin === 1 && (
                  <li>
                    <Link className='link-underline link-underline-opacity-0' to="/admin">
                      <button className="dropdown-item">
                        Admin Panel
                      </button>
                    </Link>
                  </li>
                )}
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
