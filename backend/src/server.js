require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const minimoth = require('./minimoth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper: Format phone to E.164 (defaults to Indian +91 if 10-digit number is provided)
function formatPhone(phone) {
  if (!phone) return null;
  const cleaned = phone.trim().replace(/[\s-]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
}

// ==========================================
// ENDPOINT 1: Send OTP via Minimoth API
// POST /api/auth/send-otp
// ==========================================
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.trim().length < 8) {
      return res.status(400).json({ error: 'Valid phone number is required.' });
    }

    const formatted = formatPhone(phone);
    const result = await minimoth.sendOtp(formatted);

    return res.json({
      success: true,
      phone: formatted,
      message: result.message,
      devOtp: result.devOtp
    });
  } catch (err) {
    console.error('Error sending OTP:', err);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// ==========================================
// ENDPOINT 2: Verify OTP via Minimoth API
// POST /api/auth/verify-otp
// ==========================================
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, code, name } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and 6-digit OTP code are required.' });
    }

    const formatted = formatPhone(phone);
    const verification = await minimoth.verifyOtp(formatted, code.trim());

    if (!verification.verified) {
      return res.status(401).json({ error: verification.error || 'Invalid OTP code.' });
    }

    // Lookup or register user
    let user = db.getUserByPhone(formatted);
    if (!user) {
      const displayName = (name && name.trim()) ? name.trim() : `Traveler ${formatted.slice(-4)}`;
      user = db.createUser(formatted, displayName);
    }

    return res.json({
      success: true,
      message: 'Authentication successful!',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

// ==========================================
// ENDPOINT 3: Get Trips with Expenses for User
// GET /api/trips
// ==========================================
app.get('/api/trips', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required in x-user-id header or query.' });
    }

    const trips = db.getTripsWithExpenses(Number(userId));
    return res.json({ success: true, trips });
  } catch (err) {
    console.error('Error fetching trips:', err);
    return res.status(500).json({ error: 'Failed to load trips.' });
  }
});

// ==========================================
// ENDPOINT 4: Create a New Trip
// POST /api/trips
// ==========================================
app.post('/api/trips', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    const { title, destination, currency } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required.' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Trip title is required.' });
    }
    if (!destination || !destination.trim()) {
      return res.status(400).json({ error: 'Trip destination is required.' });
    }

    const newTrip = db.createTrip(
      Number(userId),
      title.trim(),
      destination.trim(),
      currency ? currency.trim() : 'INR'
    );

    return res.status(201).json({ success: true, trip: newTrip });
  } catch (err) {
    console.error('Error creating trip:', err);
    return res.status(500).json({ error: 'Failed to create trip.' });
  }
});

// ==========================================
// ENDPOINT 5: Add an Expense to a Trip
// POST /api/expenses
// ==========================================
app.post('/api/expenses', (req, res) => {
  try {
    const { tripId, title, amount, category, paidBy } = req.body;

    if (!tripId) {
      return res.status(400).json({ error: 'Trip ID is required.' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Expense title is required.' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Expense amount must be a positive number.' });
    }

    // Verify trip exists
    const trip = db.getTripById(Number(tripId));
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const expense = db.createExpense(
      Number(tripId),
      title.trim(),
      parsedAmount,
      (category && category.trim()) || 'General',
      (paidBy && paidBy.trim()) || 'Self'
    );

    return res.status(201).json({ success: true, expense });
  } catch (err) {
    console.error('Error creating expense:', err);
    return res.status(500).json({ error: 'Failed to add expense.' });
  }
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Trip Expense Tracker API running on http://localhost:${PORT}`);
  console.log(`📡 Minimoth OTP Key: ${process.env.MINIMOTH_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`======================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`💡 Free port ${PORT} or set a different PORT in your .env file.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
