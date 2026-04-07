// frontend/src/components/Footer.jsx

import React from 'react';
import './Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h4>About Parker</h4>
          {/* Your new "About" text */}
          <p>Parker simplifies urban parking. Find, book, and pay for your spot in seconds, all from one simple app.</p>
        </div>
        <div className="footer-section">
          <h4>Contact Developer</h4>
          {/* Your personal info */}
          <p>Email: atharvaghorpade95@gmail.com</p>
          <p>Phone: 9766018110</p>
        </div>
      </div>
      <div className="footer-bottom">
        {/* Updated 'Built by' and Privacy Policy */}
        <p>&copy; 2025 Parker. Built by Atharva. | <a href="#!">Privacy Policy</a></p>
      </div>
    </footer>
  );
};

export default Footer;