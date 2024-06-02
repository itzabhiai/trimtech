import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { textdb, database } from '../../firebaseConfig';
import { FaMapMarkerAlt, FaArrowRight, FaStar } from 'react-icons/fa';
import './AllBarber.css';

const AllBarber = () => {
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const barberCollection = collection(textdb, 'barberProfiles');
        const snapshot = await getDocs(barberCollection);
        const barberList = await Promise.all(
          snapshot.docs.map(async doc => {
            const barberData = { id: doc.id, ...doc.data() };
            const ratingsRef = ref(database, `ratings/${barberData.id}`);
            const ratingsSnapshot = await new Promise(resolve => onValue(ratingsRef, resolve, { onlyOnce: true }));
            const ratingsData = ratingsSnapshot.val();
            if (ratingsData) {
              const ratingsArray = Object.values(ratingsData);
              const avgRating = ratingsArray.reduce((sum, rating) => sum + rating.rating, 0) / ratingsArray.length;
              barberData.rating = avgRating.toFixed(1);
            } else {
              barberData.rating = '0';
            }
            return barberData;
          })
        );
        setBarbers(barberList);
        localStorage.setItem('barberData', JSON.stringify(barberList));
      } catch (error) {
        console.error('Error fetching barbers:', error);
      }
    };

    fetchBarbers();
  }, []);

  const renderStars = (rating) => {
    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar key={star} className={`star ${rating >= star ? 'selected' : ''}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="all-barber-container">
      <h1>Featured shop</h1>
      <ul className="barber-list">
        {barbers.map(barber => (
          <li key={barber.id} className="barber-all-card">
            <img src={barber.profilePhotoURL} alt="Profile" className="profile-photo" />
            <div className="barber-info">
              <h2>{barber.shopName}</h2>
              <p>Location: {barber.shopLocation}</p>
              <div className="average-rating-all">
                
                {renderStars(barber.rating)}
                <p>{barber.rating} / 5</p>
              </div>
              <div className="barber-buttons">
                <Link style={{textDecoration:"none"}} to={barber.mapLink} target="_blank"><a   rel="noopener noreferrer" className="button">
                  <FaMapMarkerAlt /> Map
                </a></Link> 
                <Link to={`/barber/${barber.id}`} className="button">
                  <FaArrowRight /> View
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllBarber;
