import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../firebaseConfig';
import './BookingPage.css';

const BookingPage = ({ user }) => {
  const { barberId } = useParams();
  const navigate = useNavigate();
  const [joinedBarber, setJoinedBarber] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const userQueueRef = ref(database, `queues/${barberId}/${user.id}`);
      onValue(userQueueRef, (snapshot) => {
        if (snapshot.exists()) {
          setJoinedBarber(barberId);
        }
      });
    }
  }, [user, barberId, navigate]);

  const handleBarberClick = () => {
    navigate(`/barber/${barberId}`);
  };

  return (
    <div className="booking-container">
      {joinedBarber ? (
        <div className="joined-message">
          <p>You have already joined the queue for this barber.</p>
          <p>Redirecting to the barber's page...</p>
          {setTimeout(() => navigate(`/barber/${joinedBarber}`), 3000)}
        </div>
      ) : (
        <div className="no-joining-message">
          <p>No joining yet.</p>
          <Link to="/">Back to Home</Link>
        </div>
      )}

      {user?.role === 'barber' && (
        <button className="barber-page-button" onClick={handleBarberClick}>Go to Barber Page</button>
      )}
    </div>
  );
};

export default BookingPage;
