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

---

## 📂 Project Structure

```text
onekhusa-nodejs-integration/
├── public/
│   └── index.html                    # Frontend Dashboard UI
├── src/
│   ├── factories/
│   │   └── paymentFactory.js        # Factory for payment operations
│   ├── services/
│   │   ├── onekhusa.service.js      # Hosted checkout logic
│   │   ├── disbursement.service.js  # Disbursement operations
│   │   └── webhook.service.js       # Webhook handling
│   ├── app.js                        # Express server & routes
│   ├── config.js                     # Environment configuration
│   └── utils.js                      # Utility functions
├── .env                              # Local configuration (DO NOT commit)
├── .gitignore
└── package.json
```

---

## 🛠️ Phase 1: Preparation & Prerequisites

### What You Need

- **Node.js** (v14+) - `node --version`
- **npm** - `npm --version`
- **Git** - `git --version`
- **NGrok** (for local webhook testing) - Download from https://ngrok.com
- **OneKhusa Merchant Account** - Sandbox credentials

### Verify Your Setup

```bash
node --version
npm --version
git --version
ngrok --version
```

All commands should display version numbers without errors.

---

## 📥 Phase 2: Project Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/GarryBalala/OneKhusa-Node.js-Integration-Reference.git
cd OneKhusa-Node.js-Integration-Reference
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected:** Installation completes in 30-60 seconds with no errors.

### Step 3: Create `.env` Configuration File

```bash
touch .env
```

Add these variables to your `.env`:

```env
# OneKhusa API Credentials
ONEKHUSA_API_KEY=your_sandbox_api_key
ONEKHUSA_API_SECRET=your_sandbox_api_secret
ONEKHUSA_ORG_ID=your_organisation_id
ONEKHUSA_MERCHANT_NUMBER=79619974
ONEKHUSA_CAPTURED_BY=admin@example.com

# API Endpoints
ONEKHUSA_BASE_URL=https://api.onekhusa.com/sandbox/v1
ONEKHUSA_CHECKOUT_URL=https://api.onekhusa.com/sandbox/v1/checkout/rtp/initiate

# Webhook Configuration
PUBLIC_CALLBACK_URL=https://your-ngrok-id.ngrok-free.dev

# Server Configuration
PORT=3000
NODE_ENV=development
```

⚠️ **Security Alert:** Never commit `.env` to Git. The `.gitignore` file prevents this.

---

## 🔑 Phase 3: Get Your OneKhusa Credentials

1. Log in to your **OneKhusa Merchant Dashboard** (Sandbox)
2. Navigate to **Settings > API Keys**
3. Copy your:
   - `API_KEY`
   - `API_SECRET`
   - `ORG_ID`

4. Paste them into your `.env` file

---

## 🌐 Phase 4: Understanding the Factory Pattern

The factory pattern creates payment operation objects. Here's the OneKhusa API connection code:

### Code Snippet: Connecting to OneKhusa API

In `src/factories/paymentFactory.js`, here's how we connect to OneKhusa for each operation:

```javascript
/**
 * HOSTED CHECKOUT - Connect to OneKhusa
 * Initiates payment collection through OneKhusa's hosted page
 */
execute: async function(paymentData) {
  try {
    // Call OneKhusa API to initiate checkout
    const response = await fetch(`${this.baseUrl}/checkout/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-Secret': this.apiSecret
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency,
        orderId: paymentData.orderId,
        callbackUrl: process.env.PUBLIC_CALLBACK_URL
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      status: 'success',
      redirectUrl: data.checkoutUrl,
      transactionId: data.transactionId
    };
  } catch (error) {
    console.error('Checkout error:', error.message);
    return { status: 'error', message: error.message };
  }
}

/**
 * SINGLE DISBURSEMENT - Connect to OneKhusa
 * Sends instant payout to a recipient
 */
execute: async function(recipientData) {
  try {
    // Generate idempotency key (prevents duplicate charges if request retries)
    const idempotencyKey = generateIdempotencyKey();

    // Call OneKhusa API for single payout
    const response = await fetch(`${config.baseUrl}/disburse/single`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-Secret': this.apiSecret,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        accountNumber: recipientData.accountNumber,
        amount: recipientData.amount,
        narration: recipientData.narration,
        reference: `DISBURSE-${Date.now()}`
      })
    });

    const data = await response.json();
    return {
      status: 'success',
      referenceId: data.referenceId,
      transactionId: data.transactionId,
      amount: recipientData.amount
    };
  } catch (error) {
    console.error('Disbursement error:', error.message);
    return { status: 'error', message: error.message };
  }
}

/**
 * BATCH DISBURSEMENT - Connect to OneKhusa
 * Processes bulk payouts from CSV/Excel file
 */
execute: async function(fileBuffer) {
  try {
    // Convert file to Base64 (OneKhusa requirement)
    const base64File = fileBuffer.toString('base64');

    // Call OneKhusa API for batch processing
    const response = await fetch(`${config.baseUrl}/disburse/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-Secret': this.apiSecret
      },
      body: JSON.stringify({
        fileData: base64File,
        fileType: 'csv',
        description: `Batch Payment - ${new Date().toISOString()}`
      })
    });

    const data = await response.json();
    return {
      status: 'queued',
      batchId: data.batchId,
      totalRecords: data.recordCount
    };
  } catch (error) {
    console.error('Batch error:', error.message);
    return { status: 'error', message: error.message };
  }
}
```

**Key Points:**
- ✅ API credentials come from `.env`
- ✅ All requests use Bearer token authentication
- ✅ Idempotency keys prevent duplicate charges
- ✅ Error handling is built-in
- ✅ Responses include transaction IDs for tracking

---

## 💻 Phase 5: Start the Server

### Step 1: Launch the Application

```bash
node src/app.js
```

**Expected output:**
```
✓ Server running on http://localhost:3000
✓ Webhook URL: https://your-ngrok-id.ngrok-free.dev/webhooks/payments
✓ Environment: development
```

### Step 2: Verify the Server is Running

Open a new terminal and test:

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T10:00:00Z",
  "environment": "development"
}
```

**If you see errors:**
- "Port 3000 already in use?" → Run: `PORT=3001 node src/app.js`
- "Cannot find module?" → Run: `npm install` again
- "API key is invalid?" → Check your `.env` credentials

---

## 🌐 Phase 6: Webhook Configuration (Local Testing)

Webhooks allow OneKhusa to send real-time payment notifications to your server.

### Step 1: Start NGrok

In a new terminal (keep Node server running):

```bash
ngrok http 3000
```

**You'll see:**
```
Forwarding    https://abc123xyz.ngrok-free.dev -> http://localhost:3000
```

### Step 2: Update `.env`

Copy the HTTPS URL from NGrok and update:

```env
PUBLIC_CALLBACK_URL=https://abc123xyz.ngrok-free.dev
```

Restart your Node server.

### Step 3: Register Webhook in OneKhusa Portal

1. Log into **OneKhusa Merchant Dashboard**
2. Go to **Developers > Webhooks**
3. Add endpoint: `https://abc123xyz.ngrok-free.dev/webhooks/payments`
4. Select events: `payment.completed`, `payment.failed`, `disbursement.completed`
5. Save and test

---

## 🧪 Phase 7: Testing Each Feature

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

**What this confirms:** Server is running and responding.

---

### Test 2: Initiate Payment (Hosted Checkout)

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "currency": "KES",
    "orderId": "ORD-12345"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "redirectUrl": "https://api.onekhusa.com/sandbox/checkout?token=...",
  "transactionId": "TXN-001-2026"
}
```

**Server logs should show:**
```
[API] Checkout request received
[CHECKOUT] Initiating hosted checkout for order: ORD-12345
```

---

### Test 3: Send Single Payout

```bash
curl -X POST http://localhost:3000/api/disburse/single \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "3333888800",
    "amount": 100000,
    "narration": "Test Payout"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "referenceId": "DSB-001-2026",
  "transactionId": "TXN-002-2026",
  "amount": 100000
}
```

**Server logs should show:**
```
[DISBURSE] Processing payout to: 3333888800
[DISBURSE] Idempotency Key: IDK-1715580000-abc123
```

---

### Test 4: Upload Batch File

Create `payouts.csv`:
```csv
account_number,amount,narration
3333888800,100000,Settlement 1
3333888801,200000,Settlement 2
```

Upload:
```bash
curl -X POST http://localhost:3000/api/disburse/batch \
  -F "file=@payouts.csv"
```

**Expected response:**
```json
{
  "status": "queued",
  "batchId": "BATCH-001-2026",
  "totalRecords": 2
}
```

---

### Test 5: Receive Webhook

1. Complete a test payment (Test 2)
2. Watch your **server console** for:

```
[WEBHOOK] Received event: payment.completed
[WEBHOOK] Payment completed: TXN-001-2026
[SOCKET] Broadcasting payment-completed to clients
```

3. Check **NGrok terminal** for HTTP POST request from OneKhusa

---

## ✅ Validation Checklist

Before going live, verify:

- [ ] Server starts without errors: `node src/app.js`
- [ ] Health check responds: `curl http://localhost:3000/health`
- [ ] Credentials are valid (no API errors)
- [ ] NGrok is running and forwarding to port 3000
- [ ] Webhook URL is registered in OneKhusa Portal
- [ ] Payment checkout redirects correctly
- [ ] Single payout returns success
- [ ] Batch file uploads without errors
- [ ] Webhooks are received on your server
- [ ] `.env` file is NOT committed to Git

---

## 🚀 What Happens Next

After validation:

1. **Move to production** - Switch to live API keys
2. **Customize the UI** - Edit `public/index.html`
3. **Add business logic** - Extend the factories for your use case
4. **Deploy** - Upload to AWS, Heroku, Google Cloud, etc.
5. **Monitor** - Set up logging and error tracking

---

## 🔐 Security Best Practices

### ✅ DO

```javascript
// Store secrets in .env
const apiKey = process.env.ONEKHUSA_API_KEY;

// Use idempotency keys
const idempotencyKey = generateIdempotencyKey();

// Log transactions for compliance
console.log('[TRANSACTION]', transactionId, amount, status);

// Use HTTPS in production
https://your-domain.com/webhooks/payments
```

### ❌ DON'T

```javascript
// Never hardcode secrets
const apiKey = "sk_sandbox_abc123";

// Never retry without idempotency key
// Risk: Customer charged twice

// Never expose API secrets in error messages
res.json({ error: 'API Secret is invalid' });

// Never use HTTP in production
http://your-domain.com  // INSECURE
```

---

## 📊 How Payments Flow

```
Dashboard
   ↓
User clicks "Purchase"
   ↓
Browser calls /api/checkout
   ↓
Server calls PaymentFactory.createHostedCheckout()
   ↓
Factory connects to OneKhusa API
   ↓
OneKhusa returns checkout URL
   ↓
Browser redirects to OneKhusa checkout page
   ↓
User completes payment
   ↓
OneKhusa processes payment
   ↓
OneKhusa sends webhook to /webhooks/payments
   ↓
Server receives webhook
   ↓
Server broadcasts to browser via Socket.io
   ↓
Dashboard updates in real-time
```

---

## 📞 How Webhooks Work

```
OneKhusa Server
   ↓
Payment completes
   ↓
OneKhusa sends HTTP POST
   ↓
Your Server receives webhook
   ↓
Server processes event
   ↓
Server broadcasts to connected clients
   ↓
Dashboard updates instantly
```

---

## 🐛 Troubleshooting

### Server Won't Start

```
Error: listen EADDRINUSE :::3000
```

**Solution:** Port 3000 is in use. Either:
- Use different port: `PORT=3001 node src/app.js`
- Kill the process: `lsof -ti:3000 | xargs kill -9`

---

### API Returns "Invalid Credentials"

**Check your `.env` file:**
```bash
cat .env | grep ONEKHUSA
```

Verify credentials match your OneKhusa dashboard. Restart the server after changes.

---

### NGrok URL Not Working

**Problem:** Webhooks fail with "connection refused"

**Solution:** NGrok URL expires
```bash
# Restart NGrok
ngrok http 3000

# Copy the NEW URL
# Update PUBLIC_CALLBACK_URL in .env
# Restart Node server
```

---

### Payments Not Showing in Dashboard

**Check browser console** (Press F12):
- Look for: `Socket.io connected` or connection errors
- Check: Is JavaScript loading?

**Check server logs:**
- Look for: `[SOCKET] Client connected`
- Look for: `[WEBHOOK]` entries when payment completes

---

## 📚 Resources

- [OneKhusa API Documentation](https://docs.onekhusa.com)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Factory Pattern Explained](https://refactoring.guru/design-patterns/factory-method)
- [Express.js Guide](https://expressjs.com)
- [Socket.io Documentation](https://socket.io/docs/)

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly using the validation checklist
5. Push and open a Pull Request

---

**Last Updated:** May 13, 2026  
**Version:** 2.2.0  
**Maintainer:** GarryBalala
