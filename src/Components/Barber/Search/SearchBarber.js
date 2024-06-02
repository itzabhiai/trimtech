import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { textdb, database } from '../../../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './SearchBarber.css';
import { HiOutlineMagnifyingGlassCircle } from "react-icons/hi2";
import { FaMapMarkerAlt, FaArrowRight, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const SearchBarber = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [barbers, setBarbers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const barbersSnapshot = await getDocs(collection(textdb, 'barberProfiles'));
        const uniqueLocations = new Set();
        barbersSnapshot.forEach(doc => {
          const data = doc.data();
          uniqueLocations.add(data.shopLocation);
        });
        setLocations([...uniqueLocations]);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
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

  const handleSearch = async (searchValue) => {
    setLoading(true);
    try {
      const barbersSnapshot = await getDocs(collection(textdb, 'barberProfiles'));
      const barbersData = [];
      barbersSnapshot.forEach(doc => {
        barbersData.push({ id: doc.id, ...doc.data() });
      });

      const filteredBarbers = barbersData.filter(barber => 
        barber.shopLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
        barber.shopName.toLowerCase().includes(searchValue.toLowerCase())
      );

      const barbersWithQueue = await Promise.all(filteredBarbers.map(async (barber) => {
        const queueRef = ref(database, `queues/${barber.id}`);
        const queueSnapshot = await new Promise((resolve) => {
          onValue(queueRef, (snapshot) => {
            resolve(snapshot.val());
          }, { onlyOnce: true });
        });
        const queueLength = queueSnapshot ? Object.keys(queueSnapshot).length : 0;
        return { ...barber, queueLength };
      }));

      const sortedBarbers = barbersWithQueue.sort((a, b) => a.queueLength - b.queueLength);
      setBarbers(sortedBarbers);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
    setLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const handleLocationChange = (event) => {
    const selectedLocation = event.target.value;
    setSearchTerm(selectedLocation);
    handleSearch(selectedLocation);
  };

  return (
    <div className="search-barber-container">
      
      <div className="search-inputs">
        <input
        
          type="text"
          placeholder="Enter location or shop name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          onKeyPress={handleKeyPress}
        />
       
        <button onClick={() => handleSearch(searchTerm)} className="search-button">
          <i className="search-icon"><HiOutlineMagnifyingGlassCircle /> Search</i>
        </button>
      </div>
      
      {loading ? <div>Loading...</div> : (
        <div className="barber-results">
             <div className='sellect-location-main'> <select 
          className="location-dropdown"
          value={searchTerm}
          onChange={handleLocationChange}
        >
          <option className='location-sellect' value="">Select a location</option>
          {locations.map((location, index) => (
            <option key={index} value={location}>{location}</option>
          ))}
        </select>  </div>
        <div className="Serach-barber-card">
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
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barber.location)}`} target="_blank" rel="noopener noreferrer" className="button">
                  <FaMapMarkerAlt /> Map
                </a>
                <Link to={`/barber/${barber.id}`} className="button">
                  <FaArrowRight /> View
                </Link>
              </div>
            </div>
          </li>
        ))}
        </div>
        </div>
      )}
    </div>
  );
};

export default SearchBarber;
