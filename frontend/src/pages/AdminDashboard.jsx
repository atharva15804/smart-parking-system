// frontend/src/pages/AdminDashboard.jsx - FRONTEND FIX

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './AdminDashboard.css'; 

// Helper function to format dates
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to format time
const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [parkingCost, setParkingCost] = useState(0);
    const [newCost, setNewCost] = useState('');
    const [bookings, setBookings] = useState([]); 
    const [logs, setLogs] = useState([]); 
    const [userSearch, setUserSearch] = useState('');
    const [logSearch, setLogSearch] = useState('');

    const { token, _id: adminId } = JSON.parse(localStorage.getItem('userInfo')); 
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    // The backend uses '/api/admin' based on your server.js
    const API_URL = '/api/admin'; 

    // Function to fetch all data
    const fetchAdminData = async () => {
        try {
            // These are the Promises we will await
            const usersReq = axios.get(`${API_URL}/users`, { ...config, params: { search: userSearch } });
            const logsReq = axios.get(`${API_URL}/logs`, { ...config, params: { search: logSearch } });
            const statsReq = axios.get(`${API_URL}/stats`, config);
            const settingsReq = axios.get(`${API_URL}/settings`, config);
            const bookingsReq = axios.get(`${API_URL}/bookings`, config); 

            // --- CRITICAL FIX START: ENSURE CORRECT DESTRUCTURING AND ORDER ---
            // The order in the array below MUST match the order of the requests above
            const [statsRes, usersRes, settingsRes, bookingsRes, logsRes] = await Promise.all([
                statsReq,    // 1. statsReq maps to statsRes
                usersReq,    // 2. usersReq maps to usersRes (FIXED: was wrong in original)
                settingsReq, // 3. settingsReq maps to settingsRes
                bookingsReq, // 4. bookingsReq maps to bookingsRes
                logsReq,     // 5. logsReq maps to logsRes
            ]);
            // --- CRITICAL FIX END ---

            setStats(statsRes.data);
            setUsers(usersRes.data);
            setParkingCost(settingsRes.data.perHourRate);
            setNewCost(settingsRes.data.perHourRate);
            setBookings(bookingsRes.data);
            setLogs(logsRes.data);

        } catch (error) {
            console.error('Failed to fetch admin data', error);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [userSearch, logSearch]); 

    // ... (handler functions: handleCostUpdate, handleCancelBooking, handleDeleteUser remain the same)
    const handleCostUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(
                `${API_URL}/settings`,
                { perHourRate: newCost },
                config
            );
            setParkingCost(data.perHourRate);
            alert('Parking Cost Updated');
        } catch (error) {
            alert('Failed to update cost');
        }
    };
    const handleCancelBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await axios.delete(`${API_URL}/bookings/${bookingId}`, config);
                alert('Booking Canceled');
                setBookings(bookings.filter((b) => b._id !== bookingId));
            } catch (error) {
                alert('Failed to cancel booking');
            }
        }
    };
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${API_URL}/users/${userId}`, config);
                alert('User Deleted');
                setUsers(users.filter((u) => u._id !== userId));
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="admin-container">
            <h1>Administrator Home</h1>

            <div className="stats-container">
                <div className="stat-card" style={{backgroundColor: '#17a2b8'}}>
                    <h3>Total Revenue</h3>
                    <p>Rs. {stats ? stats.totalRevenue : 0}</p>
                </div>
                <div className="stat-card" style={{backgroundColor: '#28a745'}}>
                    <h3>Total Users</h3>
                    <p>{stats ? stats.totalUsers : 0}</p>
                </div>
                <div className="stat-card" style={{backgroundColor: '#ffc107'}}>
                    <h3>Bookings Today</h3>
                    <p>{stats ? stats.bookingsToday : 0}</p>
                </div>
                <div className="stat-card" style={{backgroundColor: '#dc3545'}}>
                    <h3>Current Occupancy</h3>
                    <p>{stats ? stats.currentOccupancy : 0}</p>
                </div>
            </div>

            {/* --- ADMIN ANALYTICS GRAPHS (AI & DATAVIZ) --- */}
            <div className="admin-section" id="analytics">
                <h2>// ANALYTICS OVERVIEW //</h2>
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>Weekly Revenue Prediction (AI Adjusted)</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={[
                                        { name: 'Mon', revenue: 4000, projected: 4400 },
                                        { name: 'Tue', revenue: 3000, projected: 3200 },
                                        { name: 'Wed', revenue: 2000, projected: 2500 },
                                        { name: 'Thu', revenue: 2780, projected: 3000 },
                                        { name: 'Fri', revenue: 1890, projected: 2800 },
                                        { name: 'Sat', revenue: 2390, projected: 3800 },
                                        { name: 'Sun', revenue: 3490, projected: 4300 },
                                    ]}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="name" stroke="#ccc" />
                                    <YAxis stroke="#ccc" />
                                    <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#17a2b8" activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="projected" stroke="#d9232d" strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>Space Utilization by Mall</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[
                                        { name: 'City Center', booked: 85, free: 15 },
                                        { name: 'Sula Vine', booked: 40, free: 60 },
                                        { name: 'Nashik Rd', booked: 60, free: 40 },
                                        { name: 'CBS', booked: 90, free: 10 },
                                    ]}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <XAxis dataKey="name" stroke="#ccc" />
                                    <YAxis stroke="#ccc" />
                                    <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }} />
                                    <Legend />
                                    <Bar dataKey="booked" fill="#d9232d" />
                                    <Bar dataKey="free" fill="#28a745" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-section" id="parking-cost">
                <h2>// PARKING COST //</h2>
                <form className="cost-form" onSubmit={handleCostUpdate}>
                    <label>Parking Cost Per Hour:</label>
                    <input
                        type="number"
                        value={newCost}
                        onChange={(e) => setNewCost(e.target.value)}
                    />
                    <button type="submit">Update</button>
                </form>
            </div>

            <div className="admin-section" id="user-details">
                <div className="section-header">
                    <h2>// USER DETAILS //</h2>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="search-bar"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                    />
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone No</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user._id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.role}</td>
                                <td>
                                    {user._id !== adminId && ( 
                                        <button 
                                            className="btn-delete"
                                            onClick={() => handleDeleteUser(user._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-section" id="bookings">
                <h2>// BOOKING DETAILS //</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Parking Date</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Slot Name</th>
                            <th>User</th>
                            <th>Parking Cost</th>
                            <th>Parking Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking._id}>
                                <td>{formatDate(booking.parkingDate)}</td>
                                <td>{formatTime(booking.startTime)}</td>
                                <td>{formatTime(booking.endTime)}</td>
                                <td>{booking.slotId}</td>
                                <td>{booking.user ? booking.user.name : 'N/A'}</td>
                                <td>Rs. {booking.cost}</td>
                                <td>{booking.status}</td>
                                <td>
                                    {booking.status === 'Booked' && (
                                        <button 
                                            className="btn-cancel"
                                            onClick={() => handleCancelBooking(booking._id)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-section" id="parking-logs">
                <div className="section-header">
                    <h2>// PARKING LOGS //</h2>
                    <input
                        type="text"
                        placeholder="Search by vehicle number..."
                        className="search-bar"
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                    />
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ticket ID</th>
                            <th>Vehicle Number</th>
                            <th>Username</th>
                            <th>Slot Name</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log._id}>
                                <td>{log._id}</td>
                                <td>{log.ticketId}</td>
                                <td>{log.vehicleNumber}</td>
                                <td>{log.username}</td>
                                <td>{log.slotName}</td>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;