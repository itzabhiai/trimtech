import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { textdb, database, auth } from '../../../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { FaHome, FaCalendarCheck, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './BottomNavBar.css';

const BottomNavBar = () => {
  const [barbers, setBarbers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        setCurrentUser(userId);
        const userDoc = await getDoc(doc(collection(textdb, 'users'), userId));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          console.error('User not found.');
        }
      } else {
        console.error('No authenticated user.');
      }
    };

    fetchUserRole();
  }, []);

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

  const handleBookingClick = () => {
    if (userRole === 'barber') {
      navigate('/profile');
    } else {
      navigate('/allbarber');
    }
  };

  return (
    <div className="bottom-nav-bar">
      <Link to="/" className="nav-item-bottom">
        <FaHome className="icon" />
        <span>Home</span>
      </Link>
      <div className="nav-item-bottom" onClick={handleBookingClick}>
        <FaCalendarCheck className="icon" />
        <span>Booking</span>
      </div>
      <Link to={userRole === 'barber' ? '/profile' : '/userprofile'} className="nav-item-bottom">
        <FaUser className="icon" />
        <span>Profile</span>
      </Link>
    </div>
  );
};

export default BottomNavBar;
