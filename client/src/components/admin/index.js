import React from 'react';
import Sidebar from '../interface/Sidebar';
import AdminPanel from './elements/AdminPanel';

function Admin({ onLogout, isAdmin, Nickname, isSuperAdmin }) {
    return (
        <div className="row g-0">
            {/* Sidebar */}
            <div className="col-md-3 col-xl-2 col-3 bg-dark">
                <Sidebar onLogout={onLogout} isAdmin={isAdmin} Nickname={Nickname} />
            </div>
            {/* Main Content */}
            <div className="col-md-9 col-xl-10 col-9 px-2">
                <AdminPanel isSuperAdmin={isSuperAdmin}/>
            </div>
        </div>
    );
}

export default Admin;
