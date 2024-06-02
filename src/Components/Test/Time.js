import React, { useState, useEffect } from 'react';
import { textdb, auth } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
// import './Time.css'; // Create and import a CSS file if needed

const Time = () => {
    const [servicesData, setServicesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    const servicesDoc = await getDoc(doc(textdb, 'services', currentUser.uid));
                    if (servicesDoc.exists()) {
                        setServicesData(servicesDoc.data());
                    } else {
                        console.log('No services data found for the current user.');
                    }
                } else {
                    console.log('User not authenticated.');
                }
                setLoading(false);
            });
        };
        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="time-container">
            <h2>Services and Their Times</h2>
            <ul>
                {servicesData.services && servicesData.services.map((service) => (
                    <li key={service}>
                        {service} - Time: {servicesData.serviceTime[service]?.hour || 0} hours {servicesData.serviceTime[service]?.minute || 0} minutes
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Time;
