// frontend/src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Page Imports
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin'; 
import CheckerLogin from './pages/CheckerLogin'; 
import AdminDashboard from './pages/AdminDashboard'; 
import UserDashboard from './pages/UserDashboard'; 
import MyBookings from './pages/MyBookings'; 
import CheckerDashboard from './pages/CheckerDashboard';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage'; 
import ForgotPassword from './pages/ForgotPassword'; 
import ResetPassword from './pages/ResetPassword'; 
import MyHistory from './pages/MyHistory'; 

// Component Imports
import PrivateRoute from './components/PrivateRoute'; 
import Footer from './components/Footer'; 

// Asset Imports
import './App.css'; 

// Local images for reliable rendering (Previously Unsplash URLs)
import REAL_BG_1 from './assets/images/bg1.jpg';
import REAL_BG_2 from './assets/images/bg2.jpg';

import FEATURE_SECURE_IMG from './assets/feature-secure.png';
import FEATURE_QR_IMG from './assets/feature-qr.png';
import FEATURE_REALTIME_IMG from './assets/feature-realtime.png';


const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const userInfoString = localStorage.getItem('userInfo');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
    window.location.reload(); 
  };

  const handleAdminLink = (hash) => {
    navigate('/admin');
    setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  };
  
  const renderNavLinks = () => {
    if (!userInfo) {
      return (
        <>
          <Link to="/admin-login">ADMINISTRATOR</Link>
          <Link to="/checker-login">TICKET CHECKER</Link>
          <Link to="/login" className="cta-nav-btn">LOGIN / REGISTER</Link>
        </>
      );
    }
    if (userInfo.role === 'admin') {
      return (
        <>
          <a href="#!" onClick={() => handleAdminLink('user-details')}>USER DETAILS</a>
          <a href="#!" onClick={() => handleAdminLink('parking-cost')}>PARKING COST</a>
          <a href="#!" onClick={() => handleAdminLink('bookings')}>BOOKINGS</a>
          <a href="#!" onClick={() => handleAdminLink('parking-logs')}>PARKING LOGS</a>
          <Link to="/profile">MY PROFILE</Link>
          <a href="#!" onClick={handleLogout} className="logout-link">LOGOUT</a>
        </>
      );
    }
    if (userInfo.role === 'user') {
      return (
        <>
          <Link to="/dashboard">BOOK SLOT</Link>
          <Link to="/my-bookings">MY BOOKINGS</Link> 
          <Link to="/my-history">HISTORY</Link>
          <Link to="/profile">PROFILE</Link>
          <a href="#!" onClick={handleLogout} className="logout-link">LOGOUT</a>
        </>
      );
    }
    if (userInfo.role === 'checker') {
      return (
        <>
          <Link to="/checker">CHECKER HOME</Link>
          <Link to="/profile">MY PROFILE</Link>
          <a href="#!" onClick={handleLogout} className="logout-link">LOGOUT</a>
        </>
      );
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">&#9889;</span> PARKER
        </Link>
        <div className="nav-links">
          {renderNavLinks()}
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

const PageWrapper = ({ children }) => (
  <div className="page-wrapper" >
    <MainLayout>
      {children}
    </MainLayout>
  </div>
);

// Modernized scrolling homepage
const HomePageWrapper = () => {
  const userInfoString = localStorage.getItem('userInfo');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

  const renderNavLinks = () => {
    if (!userInfo) {
      return (
        <>
          <Link to="/admin-login">ADMINISTRATOR</Link>
          <Link to="/checker-login">TICKET CHECKER</Link>
          <Link to="/login" className="cta-nav-btn">LOGIN / REGISTER</Link>
        </>
      );
    }
    
    let dashboardLink = "/";
    if (userInfo.role === 'admin') dashboardLink = "/admin";
    if (userInfo.role === 'user') dashboardLink = "/dashboard";
    if (userInfo.role === 'checker') dashboardLink = "/checker";

    return (
      <>
        <Link to={dashboardLink}>MY DASHBOARD</Link>
        <Link to="/profile">MY PROFILE</Link>
      </>
    );
  };

  return (
    <div className="home-container">
      <nav className="navbar home-navbar">
        <Link to="/" className="nav-logo">
           <span className="logo-icon">&#9889;</span> PARKER
        </Link>
        <div className="nav-links">
          {renderNavLinks()}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" style={{ '--bg-image': `url(${REAL_BG_1})` }}>
        <div className="hero-overlay">
          <div className="hero-content animate-fade-in-up">
            <div className="badge">Next Generation Parking Platform</div>
            <h1>Reserve Your Spot.<br/><span className="text-highlight">In Seconds.</span></h1>
            <p className="hero-subtitle">
              Parker is the premium smart parking management software, combining real-time infrastructure data with lightning-fast contactless entry.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn-primary">Book Your Slot</Link>
              <a href="#features" className="btn-secondary">Explore Features &darr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header animate-fade-in">
          <h2>Why Choose Parker?</h2>
          <p>Enterprise-grade infrastructure meets intuitive consumer design.</p>
        </div>
        
        <div className="features-grid stagger-animate">
          <div className="modern-feature-card">
            <div className="feature-img-wrapper">
               <img src={FEATURE_SECURE_IMG} alt="Secure Booking" />
            </div>
            <div className="feature-card-content">
              <h3>Secure Facilities</h3>
              <p>State-of-the-art monitored garages ensure complete peace of mind while your vehicle is parked.</p>
            </div>
          </div>

          <div className="modern-feature-card">
            <div className="feature-img-wrapper">
               <img src={FEATURE_QR_IMG} alt="QR Code" />
            </div>
            <div className="feature-card-content">
              <h3>Contactless Entry</h3>
              <p>Experience zero wait times using our instant QR-based validation system right from your phone.</p>
            </div>
          </div>

          <div className="modern-feature-card">
            <div className="feature-img-wrapper">
               <img src={FEATURE_REALTIME_IMG} alt="Real-time Analytics" />
            </div>
            <div className="feature-card-content">
              <h3>Live Availability</h3>
              <p>Never circle the block again. See real-time availability across the city before you ever leave home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section" style={{ '--bg-image-2': `url(${REAL_BG_2})` }}>
        <div className="cta-overlay">
            <h2>Stop driving in circles.</h2>
            <Link to="/register" className="btn-primary large-btn">Create Free Account</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<HomePageWrapper />} /> 
          
          <Route path="/login" element={<PageWrapper> <Login /> </PageWrapper>} />
          <Route path="/register" element={<PageWrapper> <Register /> </PageWrapper>} />
          <Route path="/admin-login" element={<PageWrapper> <AdminLogin /> </PageWrapper>} />
          <Route path="/checker-login" element={<PageWrapper> <CheckerLogin /> </PageWrapper>} />
          
          <Route path="/forgot-password" element={<PageWrapper> <ForgotPassword /> </PageWrapper>} />
          <Route path="/reset-password/:token" element={<PageWrapper> <ResetPassword /> </PageWrapper>} />
    
          <Route element={<PrivateRoute allowedRole="admin" />}>
            <Route path="/admin" element={<PageWrapper> <AdminDashboard /> </PageWrapper>} />
          </Route>
    
          <Route element={<PrivateRoute allowedRole="user" />}>
            <Route path="/dashboard" element={<PageWrapper> <UserDashboard /> </PageWrapper>} />
            <Route path="/my-bookings" element={<PageWrapper> <MyBookings /> </PageWrapper>} />
            <Route path="/my-history" element={<PageWrapper> <MyHistory /> </PageWrapper>} />
            <Route path="/payment" element={<PageWrapper> <PaymentPage /> </PageWrapper>} />
          </Route>

          <Route element={<PrivateRoute allowedRole="checker" />}> 
            <Route path="/checker" element={<PageWrapper> <CheckerDashboard /> </PageWrapper>} />
          </Route> 
          
          <Route element={<PrivateRoute allowedRole={["admin", "user", "checker"]} />}> 
            <Route path="/profile" element={<PageWrapper> <ProfilePage /> </PageWrapper>} />
          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;