// BarberProfileForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, textdb, auth } from '../../../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './BarberProfileForm.css';

const BarberProfileForm = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    shopLocation: '',
    mapLink: '',
    mobileNumber: '',
    profilePhoto: null,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(textdb, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'barber') {
          setUser(currentUser);
        } else {
          navigate('/'); 
        }
      } else {
        navigate('/'); 
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({ ...prevData, profilePhoto: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { shopName, shopLocation, mapLink, mobileNumber, profilePhoto } = formData;
    try {
      let profilePhotoURL = '';
      if (profilePhoto) {
        const storageRef = ref(storage, `profilePhotos/${profilePhoto.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, profilePhoto);
        profilePhotoURL = await getDownloadURL(uploadTask.ref);
      }

      const barberProfile = {
        shopName,
        shopLocation,
        mapLink,
        mobileNumber,
        profilePhotoURL,
        userId: user.uid,
      };

      await setDoc(doc(textdb, 'barberProfiles', user.uid), barberProfile);
      alert('Profile created successfully!');
    } catch (error) {
      console.error('Error uploading profile:', error);
      alert('Failed to create profile');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    user && (
      <div className="barber-profile-form">
        <h2>Create Barber Profile</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Shop Name:
            <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} required />
          </label>
          <label>
            Shop Location:
            <input type="text" name="shopLocation" value={formData.shopLocation} onChange={handleChange} required />
          </label>
          <label>
            Google Map Link:
            <input type="text" name="mapLink" value={formData.mapLink} onChange={handleChange} required />
          </label>
          <label>
            Mobile Number:
            <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
          </label>
          <label>
            Profile Photo:
            <input type="file" onChange={handleFileChange} />
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  );
};

export default BarberProfileForm;
