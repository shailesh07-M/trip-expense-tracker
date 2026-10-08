import React, { useState, useEffect } from 'react';
import AuthView from './components/AuthView.jsx';
import TripsView from './components/TripsView.jsx';
import TripDetailsView from './components/TripDetailsView.jsx';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('trip_tracker_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [error, setError] = useState('');

  // Save/remove user from localStorage
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('trip_tracker_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedTripId(null);
    setTrips([]);
    localStorage.removeItem('trip_tracker_user');
  };

  // Fetch Trips for User
  const fetchTrips = async () => {
    if (!user) return;
    setLoadingTrips(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/trips`, {
        headers: { 'x-user-id': String(user.id) }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch trips');
      }
      setTrips(data.trips || []);
    } catch (err) {
      setError(err.message || 'Error communicating with server');
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  // Create Trip
  const handleCreateTrip = async ({ title, destination, currency }) => {
    const res = await fetch(`${API_BASE_URL}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(user.id)
      },
      body: JSON.stringify({ title, destination, currency })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Could not create trip');
    }
    // Update local list
    setTrips((prev) => [data.trip, ...prev]);
  };

  // Add Expense to Trip
  const handleAddExpense = async ({ tripId, title, amount, category, paidBy }) => {
    const res = await fetch(`${API_BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(user.id)
      },
      body: JSON.stringify({ tripId, title, amount, category, paidBy })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Could not add expense');
    }

    // Refresh trips data to update totals and expenses list
    await fetchTrips();
  };

  // Find currently selected trip object
  const activeTrip = trips.find((t) => t.id === selectedTripId) || null;

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">🧭</div>
          <div>
            <h1 className="brand-title">Trip Expense Tracker</h1>
            <span className="brand-tag">Minimal Workshop Edition</span>
          </div>
        </div>

        {user && (
          <div className="user-nav">
            <div className="user-badge">
              <span className="user-name">{user.name}</span>
              <span className="user-phone">{user.phone}</span>
            </div>
            <button
              id="logout-btn"
              className="btn-ghost"
              onClick={handleLogout}
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Content: Max 3 Views */}
      <main>
        {!user ? (
          // PAGE 1: Auth View (Minimoth OTP Login/Register)
          <AuthView
            apiBaseUrl={API_BASE_URL}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : activeTrip ? (
          // PAGE 3: Trip Details & Expenses View
          <TripDetailsView
            trip={activeTrip}
            onBack={() => setSelectedTripId(null)}
            onAddExpense={handleAddExpense}
          />
        ) : (
          // PAGE 2: Trips List View
          <TripsView
            trips={trips}
            loading={loadingTrips}
            error={error}
            onCreateTrip={handleCreateTrip}
            onSelectTrip={(trip) => setSelectedTripId(trip.id)}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="app-footer">
        Trip Expense Tracker • Built for 45-Minute Workshop • Powered by Minimoth WhatsApp OTP
      </footer>
    </div>
  );
}
