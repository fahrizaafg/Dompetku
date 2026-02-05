# Dompetku - Personal Finance Manager

## Overview
Dompetku is a modern, responsive personal finance application designed to help users manage their income, expenses, debts, and profile settings. The application features a glassmorphism UI design and runs on a lightweight local server.

## Features Implemented

### 1. Dashboard (`dashboard.html`)
- **Real-time Balance**: Displays total balance and daily spending limits.
- **Expense Trend**: Visual graph of expenses over the last 7 days.
- **Recent Activity**: List of recent transactions with quick "See all" access.
- **Navigation**: Central hub connecting all modules.

### 2. Add Transaction (`add_transaction.html`)
- **Interactive Modal**: Full-screen modal for adding expenses/incomes.
- **Real-time Validation**: Input formatting for currency (IDR) and zero-value prevention.
- **Mock API Integration**: Simulates backend submission with loading states and success feedback.
- **Category Selection**: Visual icons for categories (Food, Transport, etc.).

### 3. History Log (`history.html`)
- **Multi-criteria Filtering**: Filter by Income, Expense, or All.
- **Date Grouping**: Transactions are automatically grouped by date (Today, Yesterday, etc.).
- **Dynamic Rendering**: efficient list rendering based on filter state.
- **Audit View**: Detailed list of all past transactions.

### 4. Debt Tracker (`debt.html`)
- **Dashboard**: Summary of Total Debt, Total Receivables, and Net Balance.
- **Debt Ratio**: Visual progress bar indicating financial health.
- **Tab Filtering**: Switch between Debts, Receivables, or All.
- **Urgency Indicators**: Highlights debts that are due soon.

### 5. Profile Management (`profile.html`)
- **User Dashboard**: Manage personal info and app settings.
- **Image Upload**: Preview functionality for profile picture updates.
- **Settings**: Toggle switches for Two-Factor Auth, Haptic Feedback, etc.
- **Navigation**: Consistent bottom bar for easy access to other modules.

## Technical Details

- **Frontend**: Vanilla JavaScript, HTML5, Tailwind CSS (via CDN).
- **Styling**: Glassmorphism design system with custom utility classes.
- **State Management**: Local component state (vanilla JS variables).
- **Server**: Python `http.server` running on port 3000.

## API Documentation (Mock)

The application uses a mock API structure for data interactions.

### Transaction Object
```json
{
  "id": "string (uuid)",
  "type": "EXPENSE | INCOME",
  "category": "string",
  "amount": "number",
  "note": "string",
  "timestamp": "ISO Date String"
}
```

### Debt Object
```json
{
  "id": "string (uuid)",
  "person": "string",
  "type": "DEBT | RECEIVABLE",
  "amount": "number",
  "due_date": "ISO Date String",
  "urgent": "boolean"
}
```

## Running the Project

1. Ensure Python 3 is installed.
2. Navigate to the project directory.
3. Run the server:
   ```bash
   python -m http.server 3000 --directory references
   ```
4. Open `http://localhost:3000/dashboard.html` in your browser.

## Testing

Unit tests are located in `tests/`. Run them using:
```bash
node tests/run_tests.js
```
