import React from 'react';
import Sidebar from '../interface/Sidebar';
import MyProfile from './elements/MyProfile';

function MyProfilePage({ onLogout }) {
    return (
        <div className="row row-no-gutters">
            {/* Sidebar */}
            <div className="col-md-3 col-xl-2 col-3 bg-dark">
                <Sidebar onLogout={onLogout} />
            </div>
            {/* Main Content */}
            <div className="col-md-9 col-xl-10 col-9 px-2">
                <MyProfile />
            </div>
        </div>
    );
}

export default MyProfilePage;
