const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

// Initialize SQLite database file in the backend directory
const dbPath = path.resolve(__dirname, '..', 'tracker.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Define exactly 3 models / tables: users, trips, expenses
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    currency TEXT DEFAULT 'INR',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    paid_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
  );
`);

// User Helpers
function getUserByPhone(phone) {
  const stmt = db.prepare('SELECT * FROM users WHERE phone = ?');
  return stmt.get(phone);
}

function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

function createUser(phone, name) {
  const stmt = db.prepare('INSERT INTO users (phone, name) VALUES (?, ?)');
  const info = stmt.run(phone, name);
  return getUserById(Number(info.lastInsertRowid));
}

// Trip Helpers
function getTripsWithExpenses(userId) {
  const tripsStmt = db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY id DESC');
  const trips = tripsStmt.all(userId);

  const expensesStmt = db.prepare('SELECT * FROM expenses WHERE trip_id = ? ORDER BY id DESC');

  return trips.map((trip) => {
    const expenses = expensesStmt.all(trip.id);
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      ...trip,
      totalExpense,
      expenses
    };
  });
}

function getTripById(tripId) {
  const stmt = db.prepare('SELECT * FROM trips WHERE id = ?');
  return stmt.get(tripId);
}

function createTrip(userId, title, destination, currency = 'INR') {
  const stmt = db.prepare(
    'INSERT INTO trips (user_id, title, destination, currency) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(userId, title, destination, currency);
  const trip = getTripById(Number(info.lastInsertRowid));
  return {
    ...trip,
    totalExpense: 0,
    expenses: []
  };
}

// Expense Helpers
function createExpense(tripId, title, amount, category, paidBy) {
  const stmt = db.prepare(
    'INSERT INTO expenses (trip_id, title, amount, category, paid_by) VALUES (?, ?, ?, ?, ?)'
  );
  const info = stmt.run(tripId, title, Number(amount), category, paidBy);
  const getStmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
  return getStmt.get(Number(info.lastInsertRowid));
}

module.exports = {
  db,
  getUserByPhone,
  getUserById,
  createUser,
  getTripsWithExpenses,
  getTripById,
  createTrip,
  createExpense
};
