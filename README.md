# OneKhusa Node.js Integration Reference

A professional, full-stack reference implementation for the **OneKhusa Payment Gateway** using the **Object Factory Pattern**. This project demonstrates best practices for building secure, maintainable payment processing applications.

---

## 📖 Overview

This repository provides a complete blueprint for integrating OneKhusa payment services into your Node.js application. It covers:

- **Payment Collections** - Accept payments through hosted checkout
- **Single Disbursements** - Send instant payouts to recipients
- **Batch Disbursements** - Process bulk payments from files
- **Real-time Webhooks** - Receive payment notifications instantly
- **Local Testing** - Full webhook testing using NGrok

The architecture uses the **Object Factory Pattern** for clean, maintainable code that's easy to extend and test.

---

## 🏗️ Architecture Overview

### Why Object Factory Pattern?

```
Traditional Approach:
new Payment(config) → Payment object with fixed behavior

Factory Pattern:
PaymentFactory.create() → Customized payment object with specific behavior
```

**Benefits:**
- ✅ Centralized creation logic - Easy to maintain
- ✅ Consistent error handling - Same approach everywhere
- ✅ Easy to test - Each operation independent
- ✅ Simple to extend - Add new payment types without refactoring

---

## 📂 Project Structure

```
src/
├── factories/
│   └── paymentFactory.js           # Creates payment operations
├── services/
│   ├── onekhusa.service.js         # Hosted checkout logic
│   ├── disbursement.service.js     # Payout operations
│   └── webhook.service.js          # Webhook handlers
├── app.js                           # Express server
├── config.js                        # Environment setup
└── utils.js                         # Helper functions

public/
└── index.html                       # Dashboard UI

.env                                 # Your secrets (never commit!)
package.json                         # Dependencies
```

---

## 🛠️ Step 1: Prerequisites

### Requirements

- **Node.js** v14+ ([Download](https://nodejs.org))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com))
- **NGrok** ([Download](https://ngrok.com)) - for webhook testing
- **OneKhusa Sandbox Credentials** - from your merchant dashboard

### Verify Installation

```bash
node --version      # Should be v14+
npm --version
git --version
ngrok --version
```

---

## 📥 Step 2: Setup Your Project

### Clone and Install

```bash
git clone https://github.com/GarryBalala/OneKhusa-Node.js-Integration-Reference.git
cd OneKhusa-Node.js-Integration-Reference
npm install
```

### Configure Environment Variables

Create `.env` file in the root:

```bash
touch .env
```

Add these variables:

```env
# OneKhusa Sandbox Credentials
ONEKHUSA_API_KEY=your_api_key_here
ONEKHUSA_API_SECRET=your_api_secret_here
ONEKHUSA_ORG_ID=your_org_id
ONEKHUSA_MERCHANT_NUMBER=79619974
ONEKHUSA_CAPTURED_BY=admin@example.com

# API Endpoints
ONEKHUSA_BASE_URL=https://api.onekhusa.com/sandbox/v1
ONEKHUSA_CHECKOUT_URL=https://api.onekhusa.com/sandbox/v1/checkout/rtp/initiate

# Webhook URL (will update with NGrok)
PUBLIC_CALLBACK_URL=https://your-ngrok-url.ngrok-free.dev

# Server Configuration
PORT=3000
NODE_ENV=development
```

**⚠️ Security:** Never commit `.env` to Git. Add it to `.gitignore`.

---

## 🔑 Step 3: Get Your OneKhusa Credentials

1. **Log in** to OneKhusa Merchant Dashboard (Sandbox mode)
2. Navigate to **Settings > API Keys**
3. Copy:
   - `API_KEY`
   - `API_SECRET`
   - `ORG_ID`
4. Paste into your `.env` file

---

## 💡 Step 4: Understanding the Integration Pattern

### How OneKhusa Integration Works

```
Your Application
    ↓
Creates payment operation using Factory
    ↓
Calls OneKhusa API (with credentials from .env)
    ↓
OneKhusa processes payment
    ↓
Sends webhook notification back to your server
    ↓
Your app receives webhook and updates database
```

### The Factory Pattern in Action

```javascript
// 1. Load credentials from environment
const config = {
  apiKey: process.env.ONEKHUSA_API_KEY,
  apiSecret: process.env.ONEKHUSA_API_SECRET,
  baseUrl: process.env.ONEKHUSA_BASE_URL
};

// 2. Create operation using factory
const checkout = PaymentFactory.createHostedCheckout(config);

// 3. Execute operation
const result = await checkout.execute({
  amount: 10000,
  currency: 'KES',
  orderId: 'ORD-12345'
});

// 4. Get redirect URL and send to frontend
console.log(result.redirectUrl);
```

---

## 🔌 Step 5: Integrating Payments in Node.js

### Code Snippet: Import and Setup Factory

In your main application file (`src/app.js`):

```javascript
const express = require('express');
const PaymentFactory = require('./factories/paymentFactory');

const app = express();
app.use(express.json());

// Load configuration from .env
require('dotenv').config();

const config = {
  apiKey: process.env.ONEKHUSA_API_KEY,
  apiSecret: process.env.ONEKHUSA_API_SECRET,
  baseUrl: process.env.ONEKHUSA_BASE_URL
};

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
```

---

### Initiating a Payment (Hosted Checkout)

```javascript
// In your Express route handler
app.post('/initiate-payment', async (req, res) => {
  try {
    // 1. Create a checkout operation using factory
    const checkout = PaymentFactory.createHostedCheckout(config);

    // 2. Execute with payment details
    const result = await checkout.execute({
      amount: req.body.amount,        // Amount in cents (e.g., 10000 = 100 KES)
      currency: 'KES',                // Currency code
      orderId: req.body.orderId       // Your order ID
    });

    // 3. Check if successful
    if (result.status === 'success') {
      // Send redirect URL to frontend
      res.json({
        redirectUrl: result.redirectUrl,
        transactionId: result.transactionId
      });
    } else {
      res.status(400).json({ error: result.message });
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});
```

**Frontend receives:**
```json
{
  "redirectUrl": "https://api.onekhusa.com/sandbox/checkout?token=...",
  "transactionId": "TXN-001-2026"
}
```

**User Flow:**
1. Frontend redirects browser to `redirectUrl`
2. User completes payment on OneKhusa's page
3. OneKhusa redirects back to your app
4. Your webhook receives confirmation

---

### Sending Payouts (Single Disbursement)

```javascript
// Send money to one recipient
app.post('/send-payout', async (req, res) => {
  try {
    // 1. Create disbursement operation
    const disbursement = PaymentFactory.createSingleDisbursement(config);

    // 2. Execute the payout
    const result = await disbursement.execute({
      accountNumber: req.body.accountNumber,  // Mobile money or bank account
      amount: req.body.amount,                // Amount in cents
      narration: req.body.description         // Payment description
    });

    if (result.status === 'success') {
      res.json({
        referenceId: result.referenceId,
        transactionId: result.transactionId,
        amount: result.amount,
        status: 'processing'
      });
    } else {
      res.status(400).json({ error: result.message });
    }

  } catch (error) {
    console.error('Payout error:', error);
    res.status(500).json({ error: 'Payout failed' });
  }
});
```

**What Happens:**
1. Server receives payout request
2. Calls OneKhusa API with credentials
3. OneKhusa processes the transaction
4. Returns reference ID and transaction ID
5. Later, webhook confirms completion

---

### Processing Batch Payouts

```javascript
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Upload CSV file with multiple payouts
app.post('/batch-payouts', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // 1. Create batch operation
    const batch = PaymentFactory.createBatchDisbursement(config);

    // 2. Execute with file buffer
    const result = await batch.execute(req.file.buffer);

    if (result.status === 'queued') {
      res.json({
        batchId: result.batchId,
        recordCount: result.totalRecords,
        status: 'processing'
      });
    } else {
      res.status(400).json({ error: result.message });
    }

  } catch (error) {
    console.error('Batch error:', error);
    res.status(500).json({ error: 'Batch processing failed' });
  }
});
```

**CSV File Format:**
```csv
account_number,amount,narration
3333888800,100000,Salary Payment
3333888801,200000,Commission
3333888802,150000,Bonus
```

---

## 🌐 Step 6: Receiving Webhooks Locally with NGrok

### What Are Webhooks?

OneKhusa sends webhooks (HTTP POST requests) to notify you when payments complete. To test locally, you need to expose your local machine to the internet using NGrok.

### Setup Webhooks Locally

#### 1. Start Your Node Server

```bash
node src/app.js
```

**You should see:**
```
✓ Server running on port 3000
```

#### 2. Start NGrok in Another Terminal

```bash
ngrok http 3000
```

**NGrok shows you:**
```
Forwarding    https://abc123xyz.ngrok-free.dev -> http://localhost:3000
```

**What this means:**
- Requests to `https://abc123xyz.ngrok-free.dev` are forwarded to your `localhost:3000`
- OneKhusa can now reach your local server

#### 3. Update Your .env with NGrok URL

```env
PUBLIC_CALLBACK_URL=https://abc123xyz.ngrok-free.dev
```

**Restart your Node server** to load the new URL.

#### 4. Register Webhook in OneKhusa Portal

1. Log into OneKhusa Dashboard
2. Go to **Developers > Webhooks**
3. Add new endpoint:
   ```
   https://abc123xyz.ngrok-free.dev/webhooks/payments
   ```
4. Select events: `payment.completed`, `payment.failed`, `disbursement.completed`
5. Save and test

---

### Handling Webhooks in Your Code

```javascript
// Webhook endpoint
app.post('/webhooks/payments', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    // Parse webhook payload
    const webhook = JSON.parse(req.body);

    console.log('[WEBHOOK] Event received:', webhook.event);
    console.log('[WEBHOOK] Transaction ID:', webhook.transactionId);
    console.log('[WEBHOOK] Status:', webhook.status);

    // Handle different event types
    if (webhook.event === 'payment.completed') {
      console.log('[WEBHOOK] Payment completed for order:', webhook.orderId);
      // Update your database - mark order as paid
      // Notify frontend via Socket.io
      // Send confirmation email
    } 
    else if (webhook.event === 'payment.failed') {
      console.log('[WEBHOOK] Payment failed - reason:', webhook.failureReason);
      // Update your database - mark order as failed
      // Notify user
    }
    else if (webhook.event === 'disbursement.completed') {
      console.log('[WEBHOOK] Payout sent to:', webhook.recipient);
      // Update payout status
    }

    // Always respond with 200 OK so OneKhusa knows we received it
    res.json({ success: true });

  } catch (error) {
    console.error('[WEBHOOK] Error:', error.message);
    // Still respond with 200 to prevent OneKhusa from retrying
    res.status(200).json({ success: false });
  }
});
```

---

## 🧪 Step 7: Testing Everything Locally

### Test 1: Verify Server is Running

```bash
# Terminal 1: Start your server
node src/app.js

# Terminal 2: Test server is alive
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T10:00:00Z"
}
```

---

### Test 2: Initiate a Payment

```bash
curl -X POST http://localhost:3000/initiate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "orderId": "ORD-TEST-001"
  }'
```

**What happens:**
1. Your server receives request
2. Creates checkout using factory
3. Calls OneKhusa API with your credentials
4. OneKhusa returns checkout URL
5. You get back redirect URL

**Expected response:**
```json
{
  "redirectUrl": "https://api.onekhusa.com/sandbox/checkout?token=...",
  "transactionId": "TXN-001-2026"
}
```

**Check server logs:**
```
[API] Processing payment
[FACTORY] Creating hosted checkout
[ONEKHUSA] Calling /checkout/initiate
[RESPONSE] Success - redirecting user
```

---

### Test 3: Send a Payout

```bash
curl -X POST http://localhost:3000/send-payout \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "3333888800",
    "amount": 50000,
    "description": "Test payout"
  }'
```

**What happens:**
1. Server receives payout request
2. Creates disbursement using factory
3. Calls OneKhusa API
4. OneKhusa validates account and amount
5. Initiates payout

**Expected response:**
```json
{
  "referenceId": "DSB-001-2026",
  "transactionId": "TXN-002-2026",
  "amount": 50000,
  "status": "processing"
}
```

**Check server logs:**
```
[API] Processing disbursement
[FACTORY] Creating single disbursement
[ONEKHUSA] Calling /disburse/single
[IDEMPOTENCY] Generated key: IDK-1715580000-abc123
[RESPONSE] Payout initiated
```

---

### Test 4: Watch for Webhooks

#### Terminal Setup

**Terminal 1 - Your Server:**
```bash
node src/app.js
```

**Terminal 2 - NGrok:**
```bash
ngrok http 3000
```

**Terminal 3 - Monitor Logs:**
```bash
# Keep watching the output from Terminal 1
# You'll see webhook events appearing in real-time
```

#### Simulate a Webhook Test

1. In OneKhusa Portal, find your registered webhook
2. Click **Test** or **Send Test Event**
3. Watch your server logs:

```
[WEBHOOK] Event received: payment.completed
[WEBHOOK] Transaction ID: TXN-001-2026
[WEBHOOK] Status: COMPLETED
[DATABASE] Updated order status to paid
[EMAIL] Sent confirmation to customer
```

#### Real Webhook Flow

1. Complete a payment through the checkout flow
2. Immediately after payment, OneKhusa sends webhook
3. NGrok terminal shows: `POST /webhooks/payments`
4. Your server logs show: `[WEBHOOK] Event received`
5. Database gets updated
6. Frontend gets notified (if using Socket.io)

---

## 🔍 Understanding What's Happening at Each Step

### Payment Initiation Flow (Detailed)

```
1. User clicks "Buy Now" on your website
   ↓
2. Frontend calls: POST /initiate-payment
   ↓
3. Your Node.js server receives request
   └─ Logs: [API] Processing payment
   ↓
4. Server creates checkout object from factory
   └─ Logs: [FACTORY] Creating hosted checkout
   ↓
5. Factory calls OneKhusa API with credentials from .env
   └─ Logs: [ONEKHUSA] Calling /checkout/initiate
   ↓
6. OneKhusa validates credentials and payment details
   ↓
7. OneKhusa returns checkout URL
   └─ Logs: [RESPONSE] Success
   ↓
8. Your server sends checkout URL to frontend
   ↓
9. Frontend redirects user to OneKhusa payment page
   ↓
10. User enters payment details and pays
    ↓
11. OneKhusa processes payment
    ↓
12. OneKhusa immediately sends webhook to your server
    └─ NGrok forwards it to: http://localhost:3000/webhooks/payments
    ↓
13. Your server receives webhook
    └─ Logs: [WEBHOOK] Event received: payment.completed
    ↓
14. Your server updates database
    └─ Sets order.status = 'paid'
    ↓
15. Your server notifies frontend (optional: Socket.io)
    ↓
16. Frontend shows success message to user
```

---

### What Each Log Entry Means

```bash
# ✅ Server is properly configured and running
✓ Server running on port 3000

# ✅ Your Node app received a request from frontend
[API] Processing payment

# ✅ Factory successfully created a payment object
[FACTORY] Creating hosted checkout

# ✅ About to call OneKhusa API
[ONEKHUSA] Calling /checkout/initiate

# ✅ API call succeeded and returned data
[RESPONSE] Success

# ✅ NGrok received request from OneKhusa
[NGrok Terminal] POST /webhooks/payments

# ✅ Your server received the webhook
[WEBHOOK] Event received: payment.completed

# ✅ Database was updated
[DATABASE] Updated order status to paid

# ⚠️ Something went wrong
[ERROR] Invalid credentials
[ERROR] API connection failed
```

---

## 🔐 Security Checklist

### Before Going Live

- [ ] `.env` is added to `.gitignore`
- [ ] Never commit `.env` file to Git
- [ ] Use different credentials for sandbox vs. production
- [ ] All API keys are in `.env`, not hardcoded
- [ ] Webhook signature validation is enabled
- [ ] HTTPS is used for all URLs (in production)
- [ ] Error messages don't expose API secrets

### Best Practices in Code

```javascript
// ✅ GOOD - Credentials from environment
const apiKey = process.env.ONEKHUSA_API_KEY;

// ❌ BAD - Hardcoded credentials
const apiKey = "sk_sandbox_abc123";

// ✅ GOOD - Validate webhook before processing
if (!validateWebhookSignature(webhook)) return res.status(401);

// ❌ BAD - Trust webhook without validation
// Someone could fake a payment completion!

// ✅ GOOD - Log transaction for audit trail
console.log('[TRANSACTION]', {
  transactionId: '...',
  amount: '...',
  timestamp: '...',
  status: '...'
});

// ✅ GOOD - Never expose secrets in error messages
res.json({ error: 'Payment processing failed' });

// ❌ BAD - Exposes secret
res.json({ error: 'API Secret is invalid' });
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
npm install dotenv
```

---

### Issue: "Invalid credentials" errors

**Check:**
```bash
# View your .env file (don't push to Git!)
cat .env

# Verify credentials match OneKhusa dashboard
# Restart server after changing .env
```

---

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Use different port
PORT=3001 node src/app.js

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

---

### Issue: "NGrok URL not working"

**What happened:** NGrok URL expires (new one each time you restart)

**Solution:**
```bash
# 1. Restart NGrok
ngrok http 3000

# 2. Copy the NEW URL shown
# 3. Update PUBLIC_CALLBACK_URL in .env
# 4. Restart Node server

# Before: https://old-url-123.ngrok-free.dev
# After:  https://new-url-456.ngrok-free.dev
```

---

### Issue: "Webhook not receiving events"

**Debug:**
```bash
# 1. Check NGrok is forwarding
ngrok http 3000
# Should show: "Forwarding https://... -> http://localhost:3000"

# 2. Check webhook URL is registered in OneKhusa
# Login > Developers > Webhooks

# 3. Check server is receiving webhook
# Look in Terminal 1 for: [WEBHOOK] Event received

# 4. Check NGrok web UI
# Go to http://localhost:4040
# Shows all requests received by NGrok
```

---

## 📚 Project Files to Review

After understanding this guide, review these files in the project:

| File | Purpose |
|------|---------|
| `src/factories/paymentFactory.js` | Complete factory implementation |
| `src/services/onekhusa.service.js` | OneKhusa API integration |
| `src/services/webhook.service.js` | Webhook handling |
| `src/app.js` | Express routes and middleware |
| `public/index.html` | Frontend example |
| `.env.example` | Template for environment variables |

---

## 📞 Getting Help

- **OneKhusa API Docs:** https://docs.onekhusa.com
- **Node.js Docs:** https://nodejs.org/docs
- **NGrok Docs:** https://ngrok.com/docs
- **Factory Pattern:** https://refactoring.guru/design-patterns/factory-method

---

## 📝 License

MIT License - See LICENSE file for details.

---

## 🤝 Contributing

Contributions welcome! Submit pull requests with:
1. Clear description of changes
2. Testing completed
3. Code follows project style

---

**Last Updated:** May 13, 2026  
**Version:** 3.0.0  
**Maintainer:** GarryBalala
