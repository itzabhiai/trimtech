import React, { useState, useEffect } from 'react';
import { getAuth, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { textdb } from '../../../firebaseConfig';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './UserProfile.css';

const UserProfile = () => {
  const [userData, setUserData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userDoc = await getDoc(doc(textdb, 'users', userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.error('User data not found.');
        }
      }
    };

    fetchUserData();
  }, [auth.currentUser]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccess('');
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      setSuccess('Password updated successfully.');
      setError('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('Error updating password.');
      setSuccess('');
      console.error('Error updating password:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (auth.currentUser) {
      try {
        await updateDoc(doc(textdb, 'users', auth.currentUser.uid), userData);
        setSuccess('Profile updated successfully.');
        setError('');
      } catch (error) {
        setError('Error updating profile.');
        console.error('Error updating profile:', error);
      }
    }
  };

  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={userData.name || ''} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={userData.email || ''} readOnly />
        </div>
        {/* Add other fields as needed */}
        <button type="submit">Update Profile</button>
      </form>
      <h2>Change Password</h2>
      <div className="form-group">
        <label>New Password:</label>
        <div className="password-input">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <span style={{color:"black"}} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>
      <div className="form-group">
        <label>Confirm Password:</label>
        <div className="password-input">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span style={{color:"black"}} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>
      <button  onClick={handlePasswordChange}>Change Password</button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default UserProfile;
