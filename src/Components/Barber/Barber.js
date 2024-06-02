import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, set, update, remove, push } from 'firebase/database';
import { collection, getDoc, doc } from 'firebase/firestore';
import Modal from 'react-modal';
import { textdb, auth, database } from '../../firebaseConfig';
import './Barber.css';
import { FaPlay, FaPause, FaTrashAlt, FaCog, FaStar } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
Modal.setAppElement('#root');

const Barber = () => {
  const { barberId } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [barberData, setBarberData] = useState(null);
  const [queue, setQueue] = useState([]);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false); 
  const [pausedTime, setPausedTime] = useState(0);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [userRatingId, setUserRatingId] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userDoc = await getDoc(doc(collection(textdb, 'users'), userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ id: userId, ...userData });
          setUserName(userData.name || 'Anonymous');
        } else {
          console.error('User not found.');
          navigate('/');
        }
      } else {
        console.error('No authenticated user.');
        navigate('/');
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const fetchBarberData = async () => {
      try {
        const barberDoc = await getDoc(doc(collection(textdb, 'barberProfiles'), barberId));
        if (barberDoc.exists()) {
          setBarberData({ id: barberDoc.id, ...barberDoc.data() });
        } else {
          setError('Barber not found.');
        }

        const servicesDoc = await getDoc(doc(collection(textdb, 'services'), barberId));
        if (servicesDoc.exists()) {
          const servicesData = servicesDoc.data();
          setServices(servicesData.services.map(service => ({
            name: service,
            time: {
              hour: servicesData.serviceTime[service]?.hour || 0,
              minute: servicesData.serviceTime[service]?.minute || 0,
            }
          })));
        } else {
          console.error('Services not found.');
        }

        const ratingsRef = ref(database, `ratings/${barberId}`);
        onValue(ratingsRef, (snapshot) => {
          const ratingsData = snapshot.val();
          if (ratingsData) {
            const ratingsArray = Object.values(ratingsData);
            setReviews(ratingsArray);
            const userRating = ratingsArray.find(rating => rating.userId === auth.currentUser.uid);
            if (userRating) {
              setRating(userRating.rating);
              setReview(userRating.review);
              setUserRatingId(userRating.id);
            }
            const avgRating = ratingsArray.reduce((sum, rating) => sum + rating.rating, 0) / ratingsArray.length;
            setAverageRating(avgRating.toFixed(1));
          }
        });
      } catch (error) {
        console.error('Error fetching barber data:', error);
        setError('An error occurred while fetching data.');
      }
    };

    fetchBarberData();
  }, [barberId]);

  useEffect(() => {
    const queueRef = ref(database, `queues/${barberId}`);

    onValue(queueRef, (snapshot) => {
      const queueData = snapshot.val();
      if (queueData) {
        const sortedQueue = Object.values(queueData).sort((a, b) => a.entryTime - b.entryTime);
        setQueue(sortedQueue);
      } else {
        setQueue([]);
      }
    });

    return () => {
      setQueue([]);
    };
  }, [barberId]);

  useEffect(() => {
    let timer;
    if (queue.length > 0 && !timerPaused) {
      timer = setInterval(() => {
        setQueue((prevQueue) => {
          const newQueue = prevQueue.map((qUser, index) => {
            if (index === 0) {
              const timeRemaining = qUser.timeRemaining - 1;
              if (timeRemaining <= 0) {
                removeFirstUserFromQueue();
                return null;
              } else {
                return { ...qUser, timeRemaining };
              }
            } else {
              const timeToReach = prevQueue.slice(0, index).reduce((acc, user) => acc + user.timeRemaining, 0);
              return { ...qUser, timeToReach };
            }
          }).filter(Boolean);

          updateQueue(newQueue);
          return newQueue;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [queue, timerPaused]);

  const updateQueue = async (newQueue) => {
    try {
      const queueRef = ref(database, `queues/${barberId}`);
      const newQueueData = {};
      newQueue.forEach((qUser) => {
        newQueueData[qUser.id] = qUser;
      });
      await update(queueRef, newQueueData);
    } catch (error) {
      console.error('Error updating queue:', error);
    }
  };

  const removeFirstUserFromQueue = async () => {
    try {
      const firstUserId = queue[0]?.id;
      if (firstUserId) {
        const userRef = ref(database, `queues/${barberId}/${firstUserId}`);
        await remove(userRef);

        if (queue.length > 1) {
          const nextUserRef = ref(database, `queues/${barberId}/${queue[1].id}`);
          const nextUser = queue[1];
          const totalTime = calculateUserServiceTime(nextUser.selectedServices);
          await update(nextUserRef, { timeRemaining: totalTime });
        }
      }
    } catch (error) {
      console.error('Error removing first user from queue:', error);
    }
  };

  const removeUserFromQueue = async (userId) => {
    try {
      const userRef = ref(database, `queues/${barberId}/${userId}`);
      await remove(userRef);
      setQueue((prevQueue) => prevQueue.filter((qUser) => qUser.id !== userId));
    } catch (error) {
      console.error('Error removing user from queue:', error);
    }
  };

  const handleServiceChange = (event) => {
    const { name, checked } = event.target;
    setSelectedServices((prevSelectedServices) =>
      checked ? [...prevSelectedServices, name] : prevSelectedServices.filter((service) => service !== name)
    );
  };

  const calculateUserServiceTime = (selectedServices) => {
    return selectedServices.reduce((acc, service) => {
      const selectedService = services.find((s) => s.name === service);
      return acc + (selectedService ? (selectedService.time.hour * 60 + selectedService.time.minute) * 60 : 0);
    }, 0);
  };

  const calculateTimeToReachFirstPosition = (queue) => {
    return queue.map((user, index) => {
      const timeToReach = queue.slice(0, index).reduce((acc, precedingUser) => acc + precedingUser.timeRemaining, 0);
      return { ...user, timeToReach };
    });
  };

  const lineUp = async () => {
    try {
      if (!user) {
        console.error('User not logged in or user data not fetched.');
        return;
      }

      if (queue.find((qUser) => qUser.id === user.id)) {
        console.error('User already in queue.');
        return;
      }

      const entryTime = Date.now();
      const totalTime = calculateUserServiceTime(selectedServices);

      if (isNaN(totalTime)) {
        console.error('Error: totalTime is NaN');
        return;
      }

      const newQueueItem = { ...user, entryTime, timeRemaining: queue.length === 0 ? totalTime : 0, selectedServices };
      await set(ref(database, `queues/${barberId}/${user.id}`), newQueueItem);

      setQueue((prevQueue) => {
        const newQueue = [...prevQueue, newQueueItem];
        const updatedQueue = calculateTimeToReachFirstPosition(newQueue);
        updateQueue(updatedQueue);
        return updatedQueue;
      });

      closeModal();
    } catch (error) {
      console.error('Error adding user to queue:', error);
    }
  };

  useEffect(() => {
    const pausedTimeRef = ref(database, `pausedTime/${barberId}`);
    onValue(pausedTimeRef, (snapshot) => {
      const pausedTimeData = snapshot.val();
      setPausedTime(pausedTimeData || null);
    });
  }, [barberId]);

  useEffect(() => {
    if (pausedTime !== null) {
      setTimerPaused(true);
    }
  }, [pausedTime]);

  const toggleTimer = () => {
    if (timerPaused) {
      setTimerPaused(false);
      setPausedTime(null);
    } else {
      setTimerPaused(true);
      const newPausedTime = Date.now();
      setPausedTime(newPausedTime);
      set(ref(database, `pausedTime/${barberId}`), newPausedTime);
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const submitRating = async () => {
    if (user) {
      try {
        if (userRatingId) {
          const ratingRef = ref(database, `ratings/${barberId}/${userRatingId}`);
          await update(ratingRef, { rating, review, userName: user.name });
          toast.success('Rating and review updated successfully.');
        } else {
          const ratingsRef = ref(database, `ratings/${barberId}`);
          const newRatingRef = push(ratingsRef);
          await set(newRatingRef, { userId: user.id, rating, review, userName: user.name });
          setUserRatingId(newRatingRef.key);
          toast.success('Rating and review submitted successfully.');
        }
      } catch (error) {
        console.error('Error submitting rating and review:', error);
        toast.error('Error submitting rating and review.');
      }
    }
  };

  const handleShowMoreReviews = () => {
    setShowAllReviews(!showAllReviews);
  };

 
  return (
    <div className="barber-container">
      

      <section className='barber-hero'>
        <div className='barber-hero-content'>
      <img src={barberData?.profilePhotoURL || 'default-profile-photo-url'} alt="Barber Profile" className="profile-photo" />
      <h1>{barberData ? barberData.shopName : 'Barber Shop'}</h1>
      <p > Rating - {averageRating} / 5</p>
      {timerPaused && <p>Barber is busy, the timer will resume later.</p>}

      </div>
      </section>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Select Services"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Select Services</h2>
        <ul>
          {services.map((service) => (
            <li key={service.name}>
              <label>
                <input
                  type="checkbox"
                  name={service.name}
                  checked={selectedServices.includes(service.name)}
                  onChange={handleServiceChange}
                />
                {service.name} - Time: {service.time.hour} hours {service.time.minute} minutes
              </label>
            </li>
          ))}
        </ul>
        <button className="lining-up" onClick={lineUp}><FaPlay /> Line Up</button>
      </Modal>
<section className='user-lining-up'> 
      <h2>Queue</h2>
      <ul>
        {queue.map((qUser, index) => (
          <li key={qUser.id} className="queue-item">
            {qUser.name} - {index === 0 ? `Time Remaining: ${qUser.timeRemaining}s` : `Time to Reach: ${qUser.timeToReach}s`}
            {user?.role === 'barber' && (
              <>
                <button className="remove-user-button" onClick={() => removeUserFromQueue(qUser.id)}><FaTrashAlt /></button>
              </>
            )}
          </li>
        ))}
      </ul>
      </section>
      {user?.role === 'barber' && (
        <div className="timer-controls">
          <button className="toggle-timer-button" onClick={toggleTimer}>
            {timerPaused ? <FaPlay /> : <FaPause />} {timerPaused ? 'Resume Timer' : 'Pause Timer'}
          </button>
        </div>
      )}

      <div className='barber-bottom-main'>
        <div className='barber-bottom'>
          <button className="lining-up-button" onClick={openModal}>Lining Up</button>
          <button className="G-map-location">Location</button>
        </div>
      </div>

      <div className="rating-section">
        <h2>Rate this Barber</h2>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`star ${rating >= star ? 'selected' : ''}`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <textarea
          className="review-input"
          placeholder="Write a review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          disabled={!!userRatingId}
        />
        {userRatingId ? (
          <>
            <button className="edit-rating-button" onClick={submitRating}>Edit Rating</button>
            <p>You have already rated this barber.</p>
          </>
        ) : (
          <button className="submit-rating-button" onClick={submitRating}>Submit Rating</button>
        )}
        <div className="average-rating">
          <h3>Average Rating:</h3>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`star ${averageRating >= star ? 'selected' : ''}`}
              />
            ))}
          </div>
          <p>{averageRating} / 5</p>
        </div>
        <h3>Reviews:</h3>
        <ul>
          {(showAllReviews ? reviews : reviews.slice(0, 5)).map((rev, index) => (
            <li key={index}>
              <div className="review-header">
                <strong>{rev.userName}</strong>
              </div>
              <div className="review-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`star ${rev.rating >= star ? 'selected' : ''}`}
                  />
                ))}
              </div>
              <p>{rev.review}</p>
            </li>
          ))}
        </ul>
        {reviews.length > 5 && (
          <button className="show-more-button" onClick={handleShowMoreReviews}>
            {showAllReviews ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Barber;
