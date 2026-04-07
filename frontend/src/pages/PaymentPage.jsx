// frontend/src/pages/PaymentPage.jsx - FINAL RAZORPAY RESTORED (No react-toastify)

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Removed: import { QRCodeSVG } from 'qrcode.react'; 
import './PaymentPage.css'; 

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookingDetails } = location.state || {};

    // Safely get user info
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    if (!bookingDetails || !token) {
        navigate('/dashboard');
        return null;
    }

    // --- Helper function to load the Razorpay script ---
    const loadRazorpayScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const displayRazorpay = async () => {
        // 1. Load the Razorpay SDK
        const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            alert('Razorpay SDK failed to load. Please check your internet connection.');
            return;
        }

        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            // 2. Get the Razorpay Key ID from the backend
            const { data: { key } } = await axios.get('/api/payment/getkey', config);
            
            // 3. Create the Order in the backend
            const { data: order } = await axios.post('/api/payment/orders', { cost: bookingDetails.cost }, config);
            
            if (!order || !order.id) {
                alert("Error creating payment order.");
                return;
            }

            // 4. Configure the Razorpay Options
            const options = {
                key: key, 
                amount: order.amount,
                currency: "INR",
                name: "Parker Smart Parking",
                description: `Booking for slot ${bookingDetails.slotId}`,
                order_id: order.id, 
                handler: async function (response) {
                    // This function runs on SUCCESSFUL PAYMENT
                    try {
                        const verificationData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingDetails: bookingDetails, // Send original booking details
                        };

                        // 5. Verify Payment and Save Booking in Backend
                        const { data } = await axios.post('/api/payment/verify', verificationData, config);

                        alert(data.message || 'Booking Confirmed!'); // Use alert()
                        navigate('/my-bookings');

                    } catch (error) {
                        alert(error.response?.data?.message || 'Payment verified, but booking failed.'); // Use alert()
                    }
                },
                prefill: {
                    name: userInfo.name,
                    email: userInfo.email,
                    contact: userInfo.phone || '', 
                },
                theme: {
                    color: "#d9232d"
                }
            };
            
            // 6. Open the Razorpay Popup
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            alert(error.response?.data?.message || 'Error processing payment request.'); // Use alert()
            navigate('/dashboard');
        }
    };

    // Open Razorpay popup automatically when page loads
    useEffect(() => {
        displayRazorpay();
    }, []); 

    // Return a loading screen or placeholder while the script loads
    return (
        <div className="payment-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
            <h2>Loading Payment Gateway...</h2>
            <p>If the popup does not appear, refresh the page.</p>
        </div>
    );
};

export default PaymentPage;