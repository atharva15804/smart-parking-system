import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentPage.css'; 

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookingDetails } = location.state || {};
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
        const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            console.error("Razorpay SDK failed to load.");
            navigate('/dashboard');
            return;
        }

        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            // 1. Get the Razorpay Key ID from the backend
            const { data: { key } } = await axios.get('/api/payment/getkey', config);
            
            // 2. Create the Order in the backend
            const { data: order } = await axios.post('/api/payment/orders', { cost: bookingDetails.cost }, config);
            
            if (!order || !order.id) {
                console.error("Error creating payment order.");
                navigate('/dashboard');
                return;
            }

            // 3. Configure the Razorpay Options
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

                        // 4. Verify Payment and Save Booking in Backend
                        const verifyResponse = await axios.post('/api/payment/verify', verificationData, config);

                        // 4.5 Trigger the Vercel Serverless Email Function explicitly on the frontend host
                        try {
                            axios.post(window.location.origin + '/api/sendTicket', {
                                user: userInfo,
                                booking: verifyResponse.data.booking
                            }).catch(err => console.error("Silent serverless email error:", err));
                        } catch (e) { }

                        // 5. Navigate straight to bookings on success
                        navigate('/my-bookings', { replace: true });

                    } catch (error) {
                        console.error('Verification failed', error);
                        navigate('/dashboard'); 
                    }
                },
                modal: {
                    ondismiss: function() {
                        // User closed the popup window without paying
                        console.log("Payment popup closed");
                        navigate('/dashboard');
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
                navigate('/dashboard');
            });
            paymentObject.open();

        } catch (error) {
            console.error("Payment initialization error", error);
            navigate('/dashboard');
        }
    };

    // Open Razorpay popup automatically exactly once
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
            <h2>Connecting to secure payment gateway...</h2>
            <p>Please do not refresh the page.</p>
        </div>
    );
};

export default PaymentPage;