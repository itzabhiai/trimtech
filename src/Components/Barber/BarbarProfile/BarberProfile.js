import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, textdb } from '../../../firebaseConfig';
import { doc, getDoc, } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

import { onAuthStateChanged } from 'firebase/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './BarberProfile.css';
import Services from '../../Services/Services';
import BarberProfileForm from '../BarbarForm/BarberProfileForm';

const BarberProfile = () => {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(textdb, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'barber') {
          setUser(currentUser);
          const profileDoc = await getDoc(doc(textdb, 'barberProfiles', currentUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data());
          }
        } else {
          navigate('/'); 
        }
      } else {
        navigate('/'); 
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="">
    <div className="barber-profile-container">
      <h1>Barber Profile</h1>
      <div className="profile-item1">
        <h3>{profile.shopName}</h3>
        <img src={profile.profilePhotoURL} alt="Profile" className="profile-photo1"/>
        <p>Location: {profile.shopLocation}</p>
        <p>Google Map: <a href={profile.mapLink} target="_blank" rel="noopener noreferrer">View on Map</a></p>
        <p>Mobile: {profile.mobileNumber}</p>
      </div>
      <h2>Change Password</h2>
      <div className="form-group">
        <label>New Password:</label>
        <div className="password-input">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)}>
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
          <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      </div>
      <button onClick={handlePasswordChange}>Change Password</button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}



      </div>
      <div>
        <Services/>
       
      </div>
    </div>
  );
};

export default BarberProfile;
