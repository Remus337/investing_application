import React from 'react';
import Sidebar from '../interface/Sidebar';
import Charts from './elements/Charts';

function ChartsPage({ onLogout }) {
    return (
        <div className="row">
            {/* Sidebar */}
            <div className="col-md-3 col-xl-2 col-3 bg-dark">
                <Sidebar onLogout={onLogout} />
            </div>
            {/* Main Content */}
            <div className="col-md-9 col-xl-10 col-9">
                <Charts />
            </div>
        </div>
    );
}

export default ChartsPage;
