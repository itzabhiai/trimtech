import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { textdb, auth } from '../../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './Services.css';

const Services = () => {
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const [formData, setFormData] = useState({
    services: [],
    serviceTime: {},
    userId: null,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState(1);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(textdb, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'barber') {
          setUser(currentUser);
          const servicesDoc = await getDoc(doc(textdb, 'services', currentUser.uid));
          if (servicesDoc.exists()) {
            const { services, serviceTime, userId } = servicesDoc.data();
            setFormData({ services, serviceTime, userId });
            setCurrentTab(3);
          }
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

  const handleHourChange = (e) => {
    setSelectedHour(parseInt(e.target.value, 10));
  };

  const handleMinuteChange = (e) => {
    setSelectedMinute(parseInt(e.target.value, 10));
  };

  const handleNext = () => setCurrentTab((prevTab) => prevTab + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { services, serviceTime } = formData;
    try {
      if (!user || !user.uid) {
        throw new Error('User not authenticated or user ID missing.');
      }

      const servicesRef = doc(textdb, 'services', user.uid);
      console.log('Submitting Form Data:', { services, serviceTime, userId: user.uid });
      await setDoc(servicesRef, { services, serviceTime, userId: user.uid });
      alert('Services uploaded successfully!');
      setCurrentTab(3);
      setIsEditing(false);
    } catch (error) {
      console.error('Error uploading services:', error);
      alert('Failed to upload services');
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => {
      const updatedServices = checked ? [...prevData.services, name] : prevData.services.filter((service) => service !== name);
      const updatedServiceTime = { ...prevData.serviceTime };
      if (checked && !updatedServiceTime[name]) {
        updatedServiceTime[name] = { hour: 0, minute: 0 }; // Ensure the service time is initialized with default values
      }
      return {
        ...prevData,
        services: updatedServices,
        serviceTime: updatedServiceTime,
      };
    });
    setIsEditing(true);
  };

  const handleServiceTimeChange = (e, serviceName, timeType) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      serviceTime: {
        ...prevData.serviceTime,
        [serviceName]: {
          ...prevData.serviceTime[serviceName],
          [timeType]: parseInt(value, 10),
        },
      },
    }));
    setIsEditing(true);
  };

  const renderServicesTab = () => (
    <div className="services-tab">
      <h2>Choose Services</h2>
      <form onSubmit={handleNext}>
        <label>
          <input type="checkbox" name="Haircuts" checked={formData.services.includes('Haircuts')} onChange={handleCheckboxChange} />
          Haircuts
        </label>
        <label>
          <input type="checkbox" name="Beard trims and shaves" checked={formData.services.includes('Beard trims and shaves')} onChange={handleCheckboxChange} />
          Beard trims and shaves
        </label>
        <label>
          <input type="checkbox" name="Shampoo and conditioning" checked={formData.services.includes('Shampoo and conditioning')} onChange={handleCheckboxChange} />
          Shampoo and conditioning
        </label>
        <label>
          <input type="checkbox" name="Hot towel shaves" checked={formData.services.includes('Hot towel shaves')} onChange={handleCheckboxChange} />
          Hot towel shaves
        </label>
        <label>
          <input type="checkbox" name="Facial and scalp treatments" checked={formData.services.includes('Facial and scalp treatments')} onChange={handleCheckboxChange} />
          Facial and scalp treatments
        </label>
        <label>
          <input type="checkbox" name="Hair coloring" checked={formData.services.includes('Hair coloring')} onChange={handleCheckboxChange} />
          Hair coloring
        </label>
        <label>
          <input type="checkbox" name="Styling" checked={formData.services.includes('Styling')} onChange={handleCheckboxChange} />
          Styling
        </label>
        <label>
          <input type="checkbox" name="Eyebrow trimming and shaping" checked={formData.services.includes('Eyebrow trimming and shaping')} onChange={handleCheckboxChange} />
          Eyebrow trimming and shaping
        </label>
        <label>
          <input type="checkbox" name="Hair and beard product sales" checked={formData.services.includes('Hair and beard product sales')} onChange={handleCheckboxChange} />
          Hair and beard product sales
        </label>
        <label>
          <input type="checkbox" name="Specialty cuts and designs" checked={formData.services.includes('Specialty cuts and designs')} onChange={handleCheckboxChange} />
          Specialty cuts and designs
        </label>
        <label>
          <input type="checkbox" name="Consultations" checked={formData.services.includes('Consultations')} onChange={handleCheckboxChange} />
          Consultations
        </label>

        {currentTab === 1 && isEditing && (
          <button type="button" className="cancel-btn" onClick={() => setCurrentTab(3)}>
            Cancel
          </button>
        )}
        <button type="submit" className="next-btn">Next</button>
      </form>
    </div>
  );

  const renderServiceTimeTab = () => (
    <div className="service-time-tab">
      <h2>Set Service Times</h2>
      <form onSubmit={handleSubmit}>
        {formData.services.map((service) => (
          <div key={service}>
            <label>{service}</label>
            <div className="time-picker">
              <label>
                Hours:
                <select
                  value={formData.serviceTime[service]?.hour || 0}
                  onChange={(e) => handleServiceTimeChange(e, service, 'hour')}
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Minutes:
                <select
                  value={formData.serviceTime[service]?.minute || 0}
                  onChange={(e) => handleServiceTimeChange(e, service, 'minute')}
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" className="delete-btn" onClick={() => handleDeleteService(service)}>
              Delete
            </button>
          </div>
        ))}
        {currentTab === 2 && isEditing && (
          <button type="button" className="cancel-btn" onClick={() => setCurrentTab(3)}>
            Cancel
          </button>
        )}
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );

  const handleDeleteService = async (serviceName) => {
    try {
      setFormData((prevData) => {
        const updatedServices = prevData.services.filter((service) => service !== serviceName);
        const updatedServiceTime = { ...prevData.serviceTime };
        delete updatedServiceTime[serviceName];
        return { ...prevData, services: updatedServices, serviceTime: updatedServiceTime };
      });

      const servicesRef = doc(textdb, 'services', user.uid);
      await setDoc(servicesRef, {
        services: formData.services.filter((service) => service !== serviceName),
        serviceTime: formData.serviceTime,
        userId: user.uid,
      });
      alert('Service deleted successfully from Firebase!');
    } catch (error) {
      console.error('Error deleting service from Firebase:', error);
      alert('Failed to delete service from Firebase');
    }
  };

  const renderDisplayServicesTab = () => (
    <div className="display-services-tab">
      <h2>Selected Services</h2>
      <ul>
        {formData.services.map((service) => (
          <li className='service-tab-li' key={service}>
            {service} - Time: {formData.serviceTime[service]?.hour || 0} hours {formData.serviceTime[service]?.minute || 0} minutes
            <button className='delete-btn' onClick={() => handleDeleteService(service)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <button className='edit-btn' onClick={() => setCurrentTab(1)}>Edit Services</button>
      </div>
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    user && (
      <div className="services-container">
        {currentTab === 1 && renderServicesTab()}
        {currentTab === 2 && renderServiceTimeTab()}
        {currentTab === 3 && renderDisplayServicesTab()}
      </div>
    )
  );
};

export default Services;
