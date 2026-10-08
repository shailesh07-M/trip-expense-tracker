import React, { useState } from 'react';

const CATEGORIES = [
  { label: 'Food & Dining', value: 'Food', icon: '🍽️' },
  { label: 'Transport', value: 'Transport', icon: '🚕' },
  { label: 'Stay & Hotel', value: 'Stay', icon: '🏨' },
  { label: 'Activities', value: 'Activities', icon: '🏄' },
  { label: 'General / Other', value: 'General', icon: '🏷️' }
];

export default function TripDetailsView({ trip, onBack, onAddExpense }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidBy, setPaidBy] = useState('Me');
  const [numPeople, setNumPeople] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '₹';
    }
  };

  const sym = getCurrencySymbol(trip.currency);
  const expenses = trip.expenses || [];
  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const perPersonShare = numPeople > 0 ? (totalAmount / numPeople).toFixed(2) : 0;

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsed = parseFloat(amount);
    if (!title.trim()) {
      setError('Please provide an expense title.');
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setSubmitting(true);
    try {
      await onAddExpense({
        tripId: trip.id,
        title: title.trim(),
        amount: parsed,
        category,
        paidBy: paidBy.trim() || 'Me'
      });
      setTitle('');
      setAmount('');
      setPaidBy('Me');
    } catch (err) {
      setError(err.message || 'Failed to add expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="details-nav">
        <button id="back-to-trips-btn" className="btn-back" onClick={onBack}>
          ← Back to All Trips
        </button>
      </div>

      {/* Hero Banner */}
      <div className="hero-trip-banner">
        <div>
          <div className="hero-trip-dest">📍 {trip.destination}</div>
          <h2 className="hero-trip-title">{trip.title}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Currency: {trip.currency || 'INR'}
          </span>
        </div>

        <div className="hero-stat-card">
          <div className="hero-stat-label">Total Trip Spending</div>
          <div className="hero-stat-val">
            {sym}{totalAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {error && <div className="alert-box alert-error">⚠️ {error}</div>}

      <div className="details-grid">
        {/* Left Column: Add Expense Form & Split Calculator */}
        <div>
          <div className="card-section">
            <h3>💸 Add New Expense</h3>
            <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="expense-title-input">Expense Description</label>
                <input
                  id="expense-title-input"
                  type="text"
                  placeholder="e.g. Seafood Dinner at Fishermans Wharf"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-amount-input">Amount ({sym})</label>
                <input
                  id="expense-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-cat-select">Category</label>
                <select
                  id="expense-cat-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expense-paidby-input">Paid By</label>
                <input
                  id="expense-paidby-input"
                  type="text"
                  placeholder="Who paid? (e.g. Me, Alice, Rohan)"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                />
              </div>

              <button
                id="submit-expense-btn"
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ marginTop: 6 }}
              >
                {submitting ? 'Adding...' : '+ Log Expense'}
              </button>
            </form>
          </div>

          {/* Equal Split Calculator */}
          <div className="split-calculator">
            <h4 style={{ fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              👥 Quick Cost Split
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Evenly divide total trip spending among travelers:
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="split-count-input">Number of Travelers</label>
              <input
                id="split-count-input"
                type="number"
                min="1"
                max="50"
                value={numPeople}
                onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className="split-row">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Each Person Pays:</span>
              <span className="split-result">{sym}{perPersonShare}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Expenses List */}
        <div>
          <div className="card-section">
            <h3>🧾 Logged Expenses ({expenses.length})</h3>

            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📝</div>
                <p>No expenses added for this trip yet.</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                  Use the form on the left to record meals, rides, stays, and more!
                </p>
              </div>
            ) : (
              <div className="expense-list">
                {expenses.map((item) => {
                  const catObj = CATEGORIES.find((c) => c.value === item.category) || CATEGORIES[4];
                  return (
                    <div key={item.id} className="expense-item">
                      <div className="expense-info">
                        <div className={`category-icon cat-${item.category || 'General'}`}>
                          {catObj.icon}
                        </div>
                        <div className="expense-meta">
                          <h4>{item.title}</h4>
                          <div className="expense-sub">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="paid-tag">Paid by <strong>{item.paid_by || 'Me'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="expense-amount-badge">
                        {sym}{Number(item.amount).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
