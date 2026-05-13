# OneKhusa Node.js Integration Reference

A professional, full-stack reference implementation for the **OneKhusa Payment Gateway** using the **Object Factory Pattern**. This project demonstrates best practices for building secure, maintainable payment processing applications.

---

## 📖 What This Project Does

This repository provides a complete blueprint for integrating with OneKhusa's payment platform. It covers three core use cases:

1. **Collections (Payments)** - Accept payments from customers through a hosted checkout interface
2. **Single Disbursements** - Send instant payouts to individuals or merchants
3. **Batch Disbursements** - Process bulk payments efficiently using file uploads

The architecture uses the **Object Factory Pattern**, which promotes clean code, testability, and extensibility.

---

## 🏗️ Architecture Overview

### Why the Object Factory Pattern?

The factory pattern solves a critical challenge in payment processing: different payment operations have different requirements, but they share common characteristics (API credentials, error handling, validation). By using factories, we:

- **Reduce code duplication** - Common logic exists in one place
- **Improve maintainability** - Changes to payment logic only need to happen once
- **Enable easy testing** - Each operation type can be tested independently
- **Support future extensions** - Adding new payment types requires minimal code changes

### Core Factories

```javascript
/**
 * PaymentFactory - Creates payment operation instances
 * Each factory method returns a self-contained operation with its own execute() method
 */
const PaymentFactory = {
  createHostedCheckout: (config) => { /* ... */ },
  createSingleDisbursement: (config) => { /* ... */ },
  createBatchDisbursement: (config) => { /* ... */ }
};
```

---

## 📂 Project Structure

Understanding the folder layout helps you navigate the codebase:

```text
onekhusa-nodejs-integration/
├── public/
│   └── index.html                    # Frontend Dashboard UI
│                                     # What users see in their browser
│
├── src/
│   ├── factories/
│   │   └── paymentFactory.js        # Factory definitions
│   │                                 # Creates payment operation instances
│   │
│   ├── services/
│   │   ├── onekhusa.service.js      # Handles hosted checkout logic
│   │   ├── disbursement.service.js  # Handles payout operations
│   │   └── webhook.service.js       # Listens for payment confirmations
│   │
│   ├── app.js                        # Express server setup
│   │                                 # Defines routes and middleware
│   │
│   ├── config.js                     # Environment configuration
│   │                                 # Manages API credentials
│   │
│   └── utils.js                      # Helper functions
│                                     # Idempotency keys, validation, etc.
│
├── .env                              # Local configuration (DO NOT commit)
├── .gitignore                        # Prevents sensitive files from uploading
└── package.json                      # Project dependencies
```

---

## 🛠️ Phase 1: Preparation & Prerequisites

Before writing any code, ensure your development environment is properly set up.

### What You Need

- **Node.js** (v14+) - Runtime environment
  - Check version: `node --version`
  - Download from: https://nodejs.org

- **npm** (comes with Node.js) - Package manager
  - Check version: `npm --version`

- **Git** - Version control
  - Check version: `git --version`
  - Download from: https://git-scm.com

- **NGrok** (for local webhook testing) - Exposes local server to the internet
  - Download from: https://ngrok.com
  - **Why?** Payment platforms can't reach `localhost:3000`. NGrok creates a public URL.

- **OneKhusa Merchant Account** - Sandbox credentials for testing
  - Contact: support@onekhusa.com
  - You'll receive: API Key, API Secret, Organization ID

### Verification Checklist

Run these commands in your terminal to verify your setup:

```bash
# Check Node.js version (should be v14+)
node --version

# Check npm version
npm --version

# Check Git version
git --version

# Check NGrok installation (optional, can install after cloning)
ngrok --version
```

**Expected output:** All commands should display version numbers without errors.

---

## 📥 Phase 2: Project Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/GarryBalala/OneKhusa-Node.js-Integration-Reference.git
cd OneKhusa-Node.js-Integration-Reference
```

**What this does:**
- Downloads the project files to your computer
- Creates a folder with all the code and configuration templates

**Expected outcome:** A new folder appears with all project files.

---

### Step 2: Install Dependencies

```bash
npm install
```

**What this does:**
- Reads `package.json` to see what libraries the project needs
- Downloads all dependencies into a `node_modules` folder
- Creates a `package-lock.json` file to lock exact versions

**Expected outcome:** 
- A `node_modules/` folder appears (this is large, ~200MB)
- No error messages in the terminal
- Installation completes in 30-60 seconds

**Troubleshooting:**
- If you see "permission denied" errors, run: `sudo npm install`
- If you see "network error", check your internet connection

---

### Step 3: Create Environment Configuration

Create a `.env` file in the root directory:

```bash
touch .env
```

Then open it in your text editor and add these variables:

```env
# ============================================
# OneKhusa API Credentials
# Get these from your OneKhusa Merchant Dashboard
# ============================================
ONEKHUSA_API_KEY=your_sandbox_api_key
ONEKHUSA_API_SECRET=your_sandbox_api_secret
ONEKHUSA_ORG_ID=your_organisation_id
ONEKHUSA_MERCHANT_NUMBER=79619974
ONEKHUSA_CAPTURED_BY=admin@example.com

# ============================================
# OneKhusa API Endpoints
# These are fixed for sandbox environment
# ============================================
ONEKHUSA_BASE_URL=https://api.onekhusa.com/sandbox/v1
ONEKHUSA_CHECKOUT_URL=https://api.onekhusa.com/sandbox/v1/checkout/rtp/initiate

# ============================================
# Webhook Configuration
# PUBLIC_CALLBACK_URL will be provided by NGrok
# Update this every time you restart NGrok
# ============================================
PUBLIC_CALLBACK_URL=https://your-ngrok-id.ngrok-free.dev

# ============================================
# Server Configuration
# ============================================
PORT=3000
NODE_ENV=development
```

**Important Security Notes:**

⚠️ **Never commit `.env` to Git!** It contains secret API keys.
- The `.gitignore` file already prevents this
- If you accidentally commit it, regenerate your API keys immediately

✅ **Use `.env.example`** as a template for collaborators

---

## 🔑 Phase 3: Obtaining OneKhusa Credentials

### Where to Get Your Credentials

1. **Log in** to your OneKhusa Merchant Dashboard (Sandbox)
2. Navigate to **Settings > API Keys**
3. You'll see:
   - `API_KEY` - Your public API key
   - `API_SECRET` - Your private secret (keep this safe!)
   - `ORG_ID` - Your organization identifier

### Paste Them Into `.env`

Replace the placeholder values with your actual credentials.

**Example:**
```env
ONEKHUSA_API_KEY=sk_sandbox_1a2b3c4d5e6f7g8h
ONEKHUSA_API_SECRET=sk_secret_9i8j7k6l5m4n3o2p
ONEKHUSA_ORG_ID=ORG_12345
```

---

## ✅ Phase 4: Initial Validation

Before moving forward, let's verify everything is working.

### Step 1: Start the Server

```bash
node src/app.js
```

**What this does:**
- Loads all your code
- Connects to the .env configuration
- Starts an Express server on port 3000

**Expected output:**
```
Server running on http://localhost:3000
Connected to OneKhusa API
Ready to receive requests
```

**What to check:**
- ✅ No error messages appear
- ✅ The server says it's listening on port 3000
- ✅ No "connection refused" or "credential" errors

**If you see errors:**
- "Port 3000 already in use?" → Change `PORT` in `.env` or stop other processes
- "API key is invalid?" → Double-check credentials in `.env`
- "Cannot find module?" → Run `npm install` again

### Step 2: Test the API Connection

Open a new terminal tab (keep the server running) and test:

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T10:00:00Z",
  "environment": "sandbox"
}
```

**What this tells you:**
- ✅ The server is responding to requests
- ✅ It's running in sandbox mode (safe for testing)
- ✅ The timestamp confirms it's live

---

## 🌐 Phase 5: Webhook Configuration (Local Testing)

For real-time payment notifications, we need to expose our local server to the internet using NGrok.

### Step 1: Install NGrok

Download from: https://ngrok.com/download

Or install via package manager:
```bash
# macOS (using Homebrew)
brew install ngrok

# Linux (using apt)
sudo apt-get install ngrok

# Windows (using Chocolatey)
choco install ngrok
```

Verify installation:
```bash
ngrok --version
```

### Step 2: Start NGrok

In a new terminal tab (separate from your Node server):

```bash
ngrok http 3000
```

**What this does:**
- Creates a public tunnel to your local `localhost:3000`
- Displays a forwarding URL like: `https://abc123xyz.ngrok-free.dev`

**What you should see:**
```
Session Status                online
Account                       (email)
Version                       3.x.x
Region                        us (United States)
Forwarding                    https://abc123xyz.ngrok-free.dev -> http://localhost:3000
```

### Step 3: Update `.env` with NGrok URL

Copy the HTTPS forwarding URL and update your `.env`:

```env
PUBLIC_CALLBACK_URL=https://abc123xyz.ngrok-free.dev
```

Restart your Node server for changes to take effect.

### Step 4: Register Webhook URL

1. Log into OneKhusa Merchant Dashboard
2. Navigate to **Developers > Webhooks**
3. Add endpoint: `https://abc123xyz.ngrok-free.dev/webhooks/payments`
4. Select events: "payment.completed", "payment.failed"
5. Save and verify

**Expected outcome:**
- OneKhusa sends a test event to confirm the URL works
- Your server logs show the webhook was received

---

## 💻 Phase 6: Testing the Integration

Now that everything is configured, let's test each feature.

### Test 1: Health Check

**What we're testing:** Is the server running and healthy?

```bash
curl http://localhost:3000/health
```

**Expected result:**
- Status: 200 OK
- Response includes timestamp and environment

**What this confirms:**
- ✅ Server is responding
- ✅ Configuration is loaded
- ✅ Basic connectivity works

---

### Test 2: Hosted Checkout (Payments)

**What we're testing:** Can customers start a payment?

1. Open your browser: `http://localhost:3000`
2. Click **"Purchase Ticket"** button
3. You should be redirected to OneKhusa's payment page

**Expected flow:**
```
Dashboard → Click Button → OneKhusa Checkout → Payment Simulator → Dashboard
```

**What to watch for:**
- ✅ Dashboard loads without errors
- ✅ Button click redirects you (check browser address bar)
- ✅ OneKhusa payment page loads
- ✅ After payment, you're redirected back

**If redirection fails:**
- Check that `PUBLIC_CALLBACK_URL` is set in `.env`
- Verify NGrok is still running: `ngrok http 3000`
- Check server logs for errors

---

### Test 3: Single Disbursement (Instant Payout)

**What we're testing:** Can we send money to a single account?

Using the dashboard or API:

```bash
curl -X POST http://localhost:3000/api/disburse/single \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "3333888800",
    "amount": 1000,
    "narration": "Test Payout"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "referenceId": "DSB-001-2026",
  "transactionId": "TXN-002-2026",
  "amount": 1000,
  "currency": "KES",
  "recipient": "3333888800",
  "processedAt": "2026-05-13T10:30:00Z"
}
```

**What this confirms:**
- ✅ API connection to OneKhusa is working
- ✅ Credentials are valid
- ✅ Single payouts can be processed

**What to watch for in logs:**
- Look for: `Disbursement request processed`
- Look for: Reference ID and transaction ID
- Avoid: "Invalid credentials" or "API error" messages

---

### Test 4: Batch Disbursement (Bulk Payouts)

**What we're testing:** Can we process multiple payouts at once?

Prepare a CSV file (`payouts.csv`):
```csv
account_number,amount,narration
3333888800,1000,Settlement 1
3333888801,2000,Settlement 2
3333888802,1500,Settlement 3
```

Upload via dashboard or API:

```bash
curl -X POST http://localhost:3000/api/disburse/batch \
  -F "file=@payouts.csv"
```

**Expected response:**
```json
{
  "status": "queued",
  "batchId": "BATCH-001-2026",
  "totalRecords": 3,
  "totalAmount": 4500,
  "currency": "KES",
  "createdAt": "2026-05-13T10:30:00Z"
}
```

**What this confirms:**
- ✅ File upload is working
- ✅ CSV parsing is correct
- ✅ Batch processing can be initiated

**Common issues:**
- "File format error" → Ensure CSV has correct headers
- "Invalid amount" → Check all amounts are numeric
- "Request timeout" → Batch files with 1000+ records may take longer

---

### Test 5: Webhook Notifications

**What we're testing:** Do we receive real-time payment confirmations?

**Manual test using the dashboard:**

1. Complete a test payment (Test 2)
2. Watch your server logs
3. Look for webhook event log entries:
   ```
   [WEBHOOK] Received payment.completed event
   [WEBHOOK] Transaction: TXN-001-2026
   [WEBHOOK] Status: COMPLETED
   ```

**Expected behavior:**
- Payment is processed in OneKhusa
- Webhook is triggered automatically
- Your server receives and logs the event
- Dashboard updates in real-time (Socket.io)

**Debugging webhooks:**
- NGrok terminal should show HTTP POST request
- Your Node terminal should show webhook processing
- Check NGrok web interface: `http://localhost:4040` for request details

---

## 📊 Phase 7: Validation Checklist

Before considering the integration complete, verify all tests passed:

```markdown
### Pre-Launch Validation

- [ ] **Environment Setup**
  - [ ] Node.js installed (v14+)
  - [ ] npm dependencies installed without errors
  - [ ] .env file created with valid credentials

- [ ] **Server Connectivity**
  - [ ] Server starts: `node src/app.js`
  - [ ] Health check responds: `curl http://localhost:3000/health`
  - [ ] No credential errors in logs

- [ ] **Webhook Configuration**
  - [ ] NGrok running and forwarding to port 3000
  - [ ] PUBLIC_CALLBACK_URL updated with NGrok URL
  - [ ] Webhook registered in OneKhusa Portal
  - [ ] Test event received successfully

- [ ] **Payment Processing**
  - [ ] Dashboard loads at http://localhost:3000
  - [ ] "Purchase Ticket" redirects to OneKhusa checkout
  - [ ] Test payment completes in sandbox
  - [ ] Redirected back to dashboard successfully

- [ ] **Disbursements**
  - [ ] Single payout API responds with success
  - [ ] Batch CSV file uploads without errors
  - [ ] Batch processing returns valid batch ID

- [ ] **Real-Time Updates**
  - [ ] Payment completion triggers webhook
  - [ ] Webhook received in server logs
  - [ ] Dashboard updates via Socket.io (if implemented)

- [ ] **Security**
  - [ ] .env file is gitignored
  - [ ] API secrets not in console logs
  - [ ] Idempotency keys generated for each request
  - [ ] HTTPS used for all production traffic
```

---

## 🚀 What Happens Next

Once validation is complete, you can:

1. **Move to production** - Switch credentials to live environment
2. **Customize UI** - Modify `public/index.html` for your brand
3. **Add features** - Extend factories for additional payment types
4. **Scale up** - Deploy to cloud (AWS, GCP, Azure, Heroku)
5. **Monitor** - Set up logging and error tracking

---

## 🔐 Security Best Practices

### Before Going Live

1. **Rotate API Keys** - Generate new production keys
2. **Environment Separation** - Use different credentials for sandbox vs. production
3. **HTTPS Only** - Never use HTTP in production
4. **Secrets Management** - Use services like AWS Secrets Manager or HashiCorp Vault
5. **Audit Logging** - Log all financial transactions for compliance
6. **Error Handling** - Never expose API secrets in error messages

### Code-Level Security

```javascript
// ✅ GOOD - Secrets from environment
const apiKey = process.env.ONEKHUSA_API_KEY;

// ❌ BAD - Hardcoded secrets
const apiKey = "sk_sandbox_abc123"; // NEVER DO THIS

// ✅ GOOD - Idempotency key prevents duplicate charges
const idempotencyKey = generateIdempotencyKey();

// ❌ BAD - Retry without idempotency can charge twice
api.charge(amount); // risky if connection fails
```

---

## 📚 Understanding the Code

### How a Payment Request Flows

```
1. User clicks "Purchase" button
   ↓
2. Browser sends request to /api/checkout
   ↓
3. Server uses PaymentFactory.createHostedCheckout()
   ↓
4. Factory returns a checkout object
   ↓
5. execute() method calls OneKhusa API
   ↓
6. OneKhusa returns redirect URL
   ↓
7. Browser redirects user to OneKhusa checkout page
   ↓
8. User completes payment
   ↓
9. OneKhusa redirects to success page
   ↓
10. Server sends update to browser via Socket.io
   ↓
11. Dashboard reflects new transaction
```

### How Webhooks Work

```
1. Payment completes on OneKhusa servers
   ↓
2. OneKhusa sends HTTP POST to your webhook URL
   ↓
3. Webhook middleware validates the request
   ↓
4. WebhookFactory creates appropriate handler
   ↓
5. Handler processes transaction data
   ↓
6. Server broadcasts update to connected clients
   ↓
7. Users' dashboards update in real-time
```

---

## 🐛 Troubleshooting Guide

### Server Won't Start

**Problem:** `Error: listen EADDRINUSE :::3000`

**Solution:** Port 3000 is already in use
```bash
# Option 1: Use different port
PORT=3001 node src/app.js

# Option 2: Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

### API Returns "Invalid Credentials"

**Problem:** Webhook or payment fails with credential error

**Solution:** Check your `.env` file
```bash
# Verify credentials are correct
cat .env | grep ONEKHUSA

# Restart server to reload environment
# (kill with Ctrl+C, then start again)
```

---

### NGrok URL Not Working

**Problem:** Webhook gives "connection refused" error

**Solution:** NGrok expired or wasn't restarted
```bash
# Restart NGrok
ngrok http 3000

# Copy NEW URL from terminal
# Update PUBLIC_CALLBACK_URL in .env
# Restart Node server
```

---

### Payments Not Showing in Dashboard

**Problem:** Payment completes but dashboard doesn't update

**Solution:** Check Socket.io connection
- Open browser console: Press F12 → Console tab
- Look for: `Socket.io connected` message
- Check server logs for: `[SOCKET] Client connected`

---

## 📞 Getting Help

### Resources

- **OneKhusa Documentation:** https://docs.onekhusa.com
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices
- **Factory Pattern Explained:** https://refactoring.guru/design-patterns/factory-method
- **Express.js Guide:** https://expressjs.com

### Support Channels

- **Issues:** https://github.com/GarryBalala/OneKhusa-Node.js-Integration-Reference/issues
- **Email:** support@onekhusa.com
- **Discord:** [OneKhusa Developer Community]

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🤝 Contributing

We welcome contributions! Before submitting a pull request:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with clear commit messages
4. Test thoroughly using the validation checklist
5. Push and open a Pull Request

---

**Last Updated:** May 13, 2026  
**Version:** 2.0.0 (Restructured for clarity)  
**Maintainer:** GarryBalala
