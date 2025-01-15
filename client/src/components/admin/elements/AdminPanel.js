import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserPostsModal from './UserPostsModal';
import UserCommentsModal from './UserCommentsModal';

function AdminPanel({ isSuperAdmin }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserNickname, setSelectedUserNickname] = useState('');
    const [showPostsModal, setShowPostsModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/users/search?nickname=${search}`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const handleEditUser = async (id, updatedData) => {
        try {
            await axios.put(`http://localhost:3001/users/${id}`, updatedData);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user data:', error);
            if (error.response.status === 400) {
                alert('Cannot change personal data for a superadmin.');
            }
        }
    };

    const handleToggleAdmin = async (id, isAdmin) => {
        const user = users.find((user) => user.id === id);

        if (!user) {
            console.error('User not found for toggling admin status');
            return;
        }
        try {
            await axios.put(`http://localhost:3001/users/${id}`, {
                ...user,
                is_admin: isAdmin ? 0 : 1,
            });
            fetchUsers();
        } catch (error) {
            console.error('Error toggling admin status:', error);
            if (error.response.status === 400) {
                alert(error.response.data);
            }
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/users/${id}`);
            alert('User deleted successfully.');
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user.');
        }
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by nickname"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
                    Search
                </button>
            </div>
            <div className='table-responsive'>
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Surname</th>
                            <th>Email</th>
                            <th>Nickname</th>
                            {isSuperAdmin === 1 && <th>Is Admin</th>}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <input
                                        type="text"
                                        className='form-control ml-1'
                                        value={user.name}
                                        onChange={(e) =>
                                            handleEditUser(user.id, { ...user, name: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className='form-control mx-1'
                                        value={user.surname}
                                        onChange={(e) =>
                                            handleEditUser(user.id, { ...user, surname: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className='form-control mx-1'
                                        value={user.email}
                                        onChange={(e) =>
                                            handleEditUser(user.id, { ...user, email: e.target.value })
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className='form-control mx-1'
                                        value={user.nickname}
                                        onChange={(e) =>
                                            handleEditUser(user.id, { ...user, nickname: e.target.value })
                                        }
                                    />
                                </td>
                                {isSuperAdmin === 1 && (
                                    <td>
                                        <input
                                            type="checkbox"
                                            className='form-check-input mx-1'
                                            checked={user.is_admin === 1}
                                            onChange={() => handleToggleAdmin(user.id, user.is_admin)}
                                        />
                                    </td>
                                )}
                                <td>
                                    <button
                                        className="btn btn-info me-2"
                                        onClick={() => {
                                            setSelectedUser(user.id);
                                            setShowPostsModal(true);
                                            setSelectedUserNickname(user.nickname);
                                        }}
                                    >
                                        Posts
                                    </button>
                                    <button
                                        className="btn btn-secondary me-2"
                                        onClick={() => {
                                            setSelectedUser(user.id);
                                            setShowCommentsModal(true);
                                            setSelectedUserNickname(user.nickname);
                                        }}
                                    >
                                        Comments
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* User Posts Modal */}
            {showPostsModal && (
                <UserPostsModal
                    userId={selectedUser}
                    onClose={() => setShowPostsModal(false)}
                    Nickname={selectedUserNickname}
                />
            )}

            {/* User Comments Modal */}
            {showCommentsModal && (
                <UserCommentsModal
                    userId={selectedUser}
                    onClose={() => setShowCommentsModal(false)}
                    Nickname={selectedUserNickname}
                />
            )}
        </div>
    );
}

export default AdminPanel;
