import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChangePasswordModal from './ChangePasswordModal';

function MyProfile() {
    const userId = Number(localStorage.getItem('user_id')); // Get the user ID from local storage
    const [profile, setProfile] = useState({
        name: '',
        surname: '',
        email: '',
        nickname: '',
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch user profile data when the component is loaded
    useEffect(() => {
        fetchProfile();
    }, []);

    // Fetch the profile from the backend
    const fetchProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/profile/${userId}`);
            setProfile(response.data); // Prefill fields with fetched data
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // Handle input field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    // Handle saving the updated profile to the backend
    const handleSaveProfile = async () => {
        try {
            setSuccessMessage('');
            setErrorMessage('');
            await axios.put(`http://localhost:3001/profile/${userId}`, profile);
            setSuccessMessage('Profile updated successfully.');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setErrorMessage('Failed to update profile.');
        }
    };

    return (
        <div className="my-profile-page">
            <h2>My Profile</h2>
            {successMessage && <p className="text-success">{successMessage}</p>}
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            
            {/* Prefilled fields */}
            <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={profile.name} // Prefill the value with data from profile
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Surname</label>
                <input
                    type="text"
                    className="form-control"
                    name="surname"
                    value={profile.surname} // Prefill the value with data from profile
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={profile.email} // Prefill the value with data from profile
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Nickname</label>
                <input
                    type="text"
                    className="form-control"
                    name="nickname"
                    value={profile.nickname} // Prefill the value with data from profile
                    onChange={handleInputChange}
                />
            </div>
            <div className="d-flex justify-content-between">
                <button className="btn btn-primary" onClick={handleSaveProfile}>
                    Save Changes
                </button>
                <button
                    className="btn btn-warning"
                    onClick={() => setShowPasswordModal(true)} // Show password modal
                >
                    Change Password
                </button>
            </div>

            {/* Password change modal */}
            {showPasswordModal && (
                <ChangePasswordModal
                    userId={userId}
                    onClose={() => setShowPasswordModal(false)} // Close modal
                />
            )}
        </div>
    );
}

export default MyProfile;
