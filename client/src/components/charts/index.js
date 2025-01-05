import React from 'react';
import Sidebar from '../interface/Sidebar';
import Charts from './elements/Charts';

function ChartsPage({ onLogout, isAdmin, Nickname }) {
    return (
        <div className="row row-no-gutters">
            {/* Sidebar */}
            <div className="col-md-3 col-xl-2 col-3 bg-dark">
                <Sidebar onLogout={onLogout} isAdmin={isAdmin} Nickname={Nickname} />
            </div>
            {/* Main Content */}
            <div className="col-md-9 col-xl-10 col-9 px-2">
                <Charts />
            </div>
        </div>
    );
}

export default ChartsPage;
