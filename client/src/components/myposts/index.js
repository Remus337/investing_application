import React from 'react';
import Sidebar from '../interface/Sidebar';
import MyPosts from './elements/MyPosts';

function MyPostsPage({ onLogout, isAdmin, Nickname }) {
    return (
        <div className="row g-0">
            {/* Sidebar */}
            <div className="col-md-3 col-xl-2 col-3 bg-dark">
                <Sidebar onLogout={onLogout} isAdmin={isAdmin} Nickname={Nickname} />
            </div>
            {/* Main Content */}
            <div className="col-md-9 col-xl-10 col-9 px-2">
                <MyPosts />
            </div>
        </div>
    );
}

export default MyPostsPage;
