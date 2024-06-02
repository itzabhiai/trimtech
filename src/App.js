// App.js
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Users/Login';
import Register from './Users/Register';
import AllBarber from './Components/Barber/AllBarber';
import Barber from './Components/Barber/Barber';
import BarberProfileForm from './Components/Barber/BarbarForm/BarberProfileForm';
import BarberProfile from './Components/Barber/BarbarProfile/BarberProfile';
import Home from './Components/Home/Home';
import { auth, textdb } from './firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Services from './Components/Services/Services';
import Time from './Components/Test/Time';
import Navbar from './Components/Home/Navbar/Navbar';
import SearchBarber from './Components/Barber/Search/SearchBarber';
import BottomNavBar from './Components/Home/BottomBar/BottomNavBar';
import BookingPage from './Components/Barber/Booking/BookingPage';
import UserProfile from './Components/Home/UserProfile/UserProfile';
import AllUser from './Users/AllUsers/AllUser';

function App() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(textdb, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
        <Navbar/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home/>} />
        <Route path="/search" element={<SearchBarber />} />

        <Route path="/register" element={<Register />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/alluser" element={<AllUser />} />



        <Route path="/allbarber" element={<AllBarber />} />
        <Route path="/barber/:barberId" element={<Barber />} />
        <Route path="/booking/:barberId" element={<BookingPage />} />

        <Route
          path="/create-profile"
          element={<BarberProfileForm /> }
        />
        <Route
          path="/profile"
          element={<BarberProfile /> }
        />
        <Route path="/services" element={<Services />} />

      </Routes>
      <BottomNavBar/>

    </div>
  );
}

export default App;
