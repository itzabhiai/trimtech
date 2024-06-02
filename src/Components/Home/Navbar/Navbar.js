import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';
import { HiOutlineMagnifyingGlassCircle } from "react-icons/hi2";
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [showImage, setShowImage] = useState(false);
  const location = useLocation(); // React Router's useLocation hook

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const closeMenu = () => {
    setMenuOpen(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 10) {
        setShowImage(true);
      } else {
        setShowImage(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Reset menu state on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);
  return (
    <>
    <nav  className={showImage? "navbar active" : "navbar "}>
      <div className="navbar-container">
      <Link to="/" className='navbar-logo'>
          <img id='navbar-img-logo' src='img/trimtech-logo.png' alt='logo' />
        </Link>

        <Link to="/search">
        <div className={`menu-icon ${menuOpen ? 'open' : ''}`} >
        <HiOutlineMagnifyingGlassCircle />
        </div></Link>
        <ul ref={menuRef} className={`nav-menu ${menuOpen ? 'active' : ''}`}>
         
          <li className="nav-item">
            <Link to="/search" className="nav-link" onClick={() => setMenuOpen(false)}>
            <HiOutlineMagnifyingGlassCircle />
            </Link> </li>

           
        </ul>
      </div>
    </nav>
</>
  );
};

export default Navbar