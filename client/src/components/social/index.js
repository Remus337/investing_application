import React from 'react';
import Sidebar from '../interface/Sidebar';
import Social from './elements/Social';

function SocialPage({ onLogout }) {
    return (
        <div className="row">
            {/* Sidebar */}
            <div className="col-md-3 col-xl-2 col-3">
                <Sidebar onLogout={onLogout} />
            </div>
            {/* Main Content */}
            <div className="col-md-9 col-xl-10 col-9">
                <Social />
            </div>
        </div>
    );
}

export default SocialPage;
