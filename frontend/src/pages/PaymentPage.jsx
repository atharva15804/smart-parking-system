// frontend/src/pages/PaymentPage.jsx - FINAL RAZORPAY RESTORED (No react-toastify)

import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentPage.css'; 

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookingDetails } = location.state || {};

    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const attemptDone = useRef(false);

    // Safely get user info
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo ? userInfo.token : null;

    useEffect(() => {
        if (!bookingDetails || !token) {
            navigate('/dashboard');
        }
    }, [bookingDetails, token, navigate]);

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
        setIsLoading(true);
        setErrorMsg('');
        
        try {
            // 1. Load the Razorpay SDK
            const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

            if (!res) {
                setErrorMsg('Razorpay SDK failed to load. Please check your internet connection or ad-blocker.');
                setIsLoading(false);
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            // 2. Get the Razorpay Key ID from the backend
            console.log("Fetching Razorpay Key...");
            const { data: { key } } = await axios.get('/api/payment/getkey', config);
            console.log("Razorpay Key Fetched:", key ? "Success" : "Failed");
            
            // 3. Create the Order in the backend
            console.log("Creating Order...");
            const { data: order } = await axios.post('/api/payment/orders', { cost: bookingDetails.cost }, config);
            console.log("Order created:", order);
            
            if (!order || !order.id) {
                setErrorMsg("Error creating payment order from backend.");
                setIsLoading(false);
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
                        console.log("Verifying Payment...");
                        const { data } = await axios.post('/api/payment/verify', verificationData, config);
                        console.log("Payment Verified:", data);

                        alert(data.message || 'Booking Confirmed!'); 
                        navigate('/my-bookings');

                    } catch (error) {
                        console.error("Verification Error:", error);
                        alert(error.response?.data?.message || 'Payment verified, but booking failed.'); 
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
            paymentObject.on('payment.failed', function (response){
                console.error("Payment Failed:", response.error);
                setErrorMsg(response.error.description || 'Payment Failed');
            });
            paymentObject.open();
            setIsLoading(false);

        } catch (error) {
            console.error("Payment Process Error:", error);
            setErrorMsg(error.response?.data?.message || 'Error processing payment request. Make sure backend is running and URL is correct.'); 
            setIsLoading(false);
        }
    };

    // Open Razorpay popup automatically when page loads
    useEffect(() => {
        if (!attemptDone.current && bookingDetails && token) {
            attemptDone.current = true;
            displayRazorpay();
        }
    }, [bookingDetails, token]); 

    if (!bookingDetails || !token) {
        return null;
    }

    return (
        <div className="payment-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
            {isLoading ? (
                <>
                    <h2>Loading Payment Gateway...</h2>
                    <p>If the popup does not appear, please wait or check your console for errors.</p>
                </>
            ) : errorMsg ? (
                <>
                    <h2 style={{ color: 'red' }}>Payment Initialization Failed</h2>
                    <p>{errorMsg}</p>
                    <button onClick={displayRazorpay} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#d9232d', color: '#fff', border: 'none', borderRadius: '5px' }}>
                        Retry Payment
                    </button>
                    <br/><br/>
                    <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                        Go back to Dashboard
                    </button>
                </>
            ) : (
                <>
                    <h2>Payment Gateway Ready</h2>
                    <p>If the popup was blocked by your browser, click below.</p>
                    <button onClick={displayRazorpay} style={{ marginTop: '20px', padding: '10px 30px', cursor: 'pointer', backgroundColor: '#d9232d', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px' }}>
                        Pay Now (₹{bookingDetails.cost})
                    </button>
                </>
            )}
        </div>
    );
};

export default PaymentPage;