import React, { useState } from 'react';

export default function TripsView({ trips, loading, error, onCreateTrip, onSelectTrip }) {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !destination.trim()) {
      setFormError('Please enter both a title and destination for your trip.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateTrip({ title: title.trim(), destination: destination.trim(), currency });
      setTitle('');
      setDestination('');
      setShowCreate(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create trip.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '₹';
    }
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h2>Your Journeys</h2>
          <p>Track group spending, split bills, and keep your travels organized.</p>
        </div>
        <button
          id="toggle-create-trip-btn"
          className="btn-primary"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? '✕ Cancel' : '+ Plan New Trip'}
        </button>
      </div>

      {/* Create Trip Form Section */}
      {showCreate && (
        <div className="create-trip-card">
          <h3>✈️ Plan a New Adventure</h3>
          {formError && <div className="alert-box alert-error" style={{ marginBottom: 12 }}>⚠️ {formError}</div>}
          <form onSubmit={handleCreateSubmit} className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="trip-title-input">Trip Name</label>
              <input
                id="trip-title-input"
                type="text"
                placeholder="e.g. Goa Weekend Getaway"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="trip-dest-input">Destination</label>
              <input
                id="trip-dest-input"
                type="text"
                placeholder="e.g. Goa, India"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="trip-curr-select">Currency</label>
              <select
                id="trip-curr-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <button
              id="submit-trip-btn"
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ height: '42px' }}
            >
              {submitting ? 'Creating...' : 'Create Trip'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="alert-box alert-error">⚠️ {error}</div>}

      {/* Trips Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading your trips...
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <h3 style={{ marginBottom: 6 }}>No trips recorded yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            Start by planning your first journey above to log shared expenses!
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + Create First Trip
          </button>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => {
            const sym = getCurrencySymbol(trip.currency);
            const expenseCount = trip.expenses ? trip.expenses.length : 0;
            return (
              <div
                key={trip.id}
                id={`trip-card-${trip.id}`}
                className="trip-card"
                onClick={() => onSelectTrip(trip)}
              >
                <div>
                  <div className="trip-card-top">
                    <span className="trip-dest-badge">📍 {trip.destination}</span>
                    <span className="trip-date">
                      {new Date(trip.created_at || Date.now()).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="trip-title">{trip.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'} logged
                  </div>
                </div>

                <div className="trip-card-bottom">
                  <span className="trip-total-label">Total Spent</span>
                  <span className="trip-total-amount">
                    {sym}{Number(trip.totalExpense || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
