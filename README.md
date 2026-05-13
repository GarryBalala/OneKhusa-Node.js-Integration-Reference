# OneKhusa Node.js Integration Reference

A professional, full-stack reference implementation for the **OneKhusa Payment Gateway** using the **Object Factory Pattern**. This project serves as a complete blueprint for developers building Node.js backends that require secure, maintainable payment processing and disbursement operations.

---

## 🏗️ Object Factory Pattern Architecture

This project leverages the **Object Factory Pattern** to create and manage complex payment processing objects. The factory pattern provides a clean, reusable way to instantiate different types of payment operations.

### Factory Pattern Overview

```javascript
/**
 * PaymentFactory - Creates payment operation instances
 * Demonstrates the Object Factory Pattern for flexible object creation
 */
const PaymentFactory = {
  createHostedCheckout: (config) => {
    return {
      type: 'HOSTED_CHECKOUT',
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      baseUrl: config.baseUrl,
      execute: function(paymentData) {
        // Implementation for hosted checkout
        return {
          status: 'pending',
          redirectUrl: `${this.baseUrl}/checkout`,
          transactionId: generateId()
        };
      }
    };
  },

  createSingleDisbursement: (config) => {
    return {
      type: 'SINGLE_DISBURSEMENT',
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      execute: function(recipientData) {
        // Implementation for single payout
        return {
          status: 'processing',
          referenceId: generateId(),
          amount: recipientData.amount
        };
      }
    };
  },

  createBatchDisbursement: (config) => {
    return {
      type: 'BATCH_DISBURSEMENT',
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      execute: function(batchFile) {
        // Implementation for batch processing
        return {
          status: 'queued',
          batchId: generateId(),
          recordsCount: batchFile.records.length
        };
      }
    };
  }
};
```

---

## 🚀 Key Features

- **Hosted Checkout**: Seamless redirection flow to OneKhusa's managed payment page.
- **Single Disbursements**: Instant payouts to bank accounts or mobile wallets with 12-char reference validation.
- **Batch Disbursements**: Bulk processing of Excel/CSV settlement files using Base64 encoding.
- **Universal Webhook Handler**: A robust listener that catches notifications across multiple paths.
- **Real-Time Automation**: Live UI updates via **Socket.io** as payment confirmations arrive.
- **Object Factory Pattern**: Clean, maintainable architecture for creating payment operations.
- **Idempotency**: Automatic generation of `X-Idempotency-Key` for all financial operations.

---

## 📂 Project Structure

```text
onekhusa-nodejs-integration/
├── public/
│   └── index.html                    # OneTicket Fintech Dashboard (Frontend)
├── src/
│   ├── factories/
│   │   └── paymentFactory.js        # Object Factory for payment operations
│   ├── services/
│   │   ├── onekhusa.service.js      # Hosted Checkout Logic
│   │   ├── disbursement.service.js  # Disbursement Operations
│   │   └── webhook.service.js       # Webhook Handling
│   ├── app.js                        # Express Server, Routes & Middleware
│   ├── config.js                     # Configuration Factory
│   └── utils.js                      # Utility Functions & Idempotency
├── .env                              # Configuration & Secrets
├── .gitignore                        # Security: Excludes node_modules and .env
└── package.json                      # Project Dependencies & Scripts
```

---

## 🛠️ Setup & Installation

### 1. Prerequisites

- Node.js (v14+)
- NGrok (Required for local webhook testing)
- OneKhusa Merchant Account (Sandbox credentials)
- npm or yarn

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/GarryBalala/OneKhusa-Node.js-Integration-Reference.git

# Enter the directory
cd OneKhusa-Node.js-Integration-Reference

# Install dependencies
npm install
```

### 3. Configuration (.env)

Create a `.env` file in the root directory with the following variables:

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

# Public Redirect (Update this every time you restart NGrok)
PUBLIC_CALLBACK_URL=https://your-id.ngrok-free.dev

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

## 🏭 Using the Object Factory Pattern

### Creating Payment Objects

```javascript
const config = {
  apiKey: process.env.ONEKHUSA_API_KEY,
  apiSecret: process.env.ONEKHUSA_API_SECRET,
  baseUrl: process.env.ONEKHUSA_BASE_URL
};

// Create a hosted checkout instance
const hostedCheckout = PaymentFactory.createHostedCheckout(config);

// Create a single disbursement instance
const singlePayout = PaymentFactory.createSingleDisbursement(config);

// Create a batch disbursement instance
const batchPayout = PaymentFactory.createBatchDisbursement(config);
```

### Executing Payment Operations

```javascript
// Execute hosted checkout
const checkoutResult = hostedCheckout.execute({
  amount: 10000,
  currency: 'KES',
  orderId: 'ORD-001'
});

// Execute single disbursement
const payoutResult = singlePayout.execute({
  accountNumber: '3333888800',
  amount: 5000,
  narration: 'Settlement Payment'
});

// Execute batch disbursement
const batchResult = batchPayout.execute({
  records: [
    { account: '3333888800', amount: 1000 },
    { account: '3333888801', amount: 2000 }
  ]
});
```

---

## 📡 Webhook Setup (Local Development)

To receive real-time notifications from OneKhusa to your local machine:

### Step 1: Start NGrok

```bash
ngrok http 3000
```

### Step 2: Update .env

Copy the HTTPS URL from NGrok and add it to your `.env`:

```env
PUBLIC_CALLBACK_URL=https://your-id.ngrok-free.dev
```

### Step 3: Register Webhook URL

In the OneKhusa Portal, navigate to **Developers > Webhooks** and register:

```
https://your-id.ngrok-free.dev/webhooks/payments
```

### Webhook Handler Example

```javascript
const WebhookFactory = {
  createPaymentWebhook: () => {
    return {
      type: 'PAYMENT_WEBHOOK',
      handle: function(payload) {
        return {
          processed: true,
          transactionId: payload.transactionId,
          status: payload.status
        };
      }
    };
  },

  createDisbursementWebhook: () => {
    return {
      type: 'DISBURSEMENT_WEBHOOK',
      handle: function(payload) {
        return {
          processed: true,
          referenceId: payload.referenceId,
          status: payload.status
        };
      }
    };
  }
};
```

---

## 💻 Usage

### Starting the Server

```bash
node src/app.js
```

The server will start on `http://localhost:3000`

### Functional Flow

#### Collections (Payments)

1. Click **"Purchase Ticket"** on the dashboard
2. Get redirected to OneKhusa payment portal
3. Complete payment in sandbox simulator
4. OneKhusa redirects you back to the dashboard
5. Real-time update via Socket.io notification

#### Disbursements

##### Single Payout

```javascript
// Enter a test account to trigger instant payout
const disbursement = PaymentFactory.createSingleDisbursement(config);
const result = disbursement.execute({
  accountNumber: '3333888800',
  amount: 5000,
  narration: 'Instant Settlement'
});
```

##### Batch Payout

```javascript
// Upload .xlsx or .csv file
// Backend automatically converts buffer to Base64
const batchDisbursement = PaymentFactory.createBatchDisbursement(config);
const result = batchDisbursement.execute(excelFileBuffer);
```

---

## 🔐 Security Best Practices

### Idempotency Key Generation

```javascript
const IdempotencyFactory = {
  generateKey: () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `IDK-${timestamp}-${random}`;
  },

  createIdempotentRequest: (requestData) => {
    return {
      ...requestData,
      'X-Idempotency-Key': IdempotencyFactory.generateKey(),
      timestamp: new Date().toISOString()
    };
  }
};
```

### Environment Variables

- **Never** commit `.env` files to version control
- Use `.env.example` to document required variables
- Rotate API keys regularly
- Use different credentials for sandbox and production

---

## 📊 API Response Examples

### Hosted Checkout Response

```json
{
  "status": "success",
  "redirectUrl": "https://api.onekhusa.com/sandbox/checkout?token=abc123",
  "transactionId": "TXN-001-2026",
  "expiresIn": 3600
}
```

### Single Disbursement Response

```json
{
  "status": "success",
  "referenceId": "DSB-001-2026",
  "transactionId": "TXN-002-2026",
  "amount": 5000,
  "currency": "KES",
  "recipient": "3333888800",
  "processedAt": "2026-05-13T10:30:00Z"
}
```

### Batch Disbursement Response

```json
{
  "status": "queued",
  "batchId": "BATCH-001-2026",
  "totalRecords": 50,
  "totalAmount": 250000,
  "currency": "KES",
  "createdAt": "2026-05-13T10:30:00Z"
}
```

---

## 🧪 Testing

### Local Testing Checklist

- [ ] Hosted checkout redirect flow
- [ ] Single disbursement payout
- [ ] Batch disbursement processing
- [ ] Webhook notifications (via NGrok)
- [ ] Idempotency key generation
- [ ] Error handling and validation

### Test Accounts (Sandbox)

- **Mobile Money**: `3333888800`
- **Bank Account**: `3333888801`
- **Test Amount**: `1000` (KES)

---

## 🐛 Troubleshooting

### Webhook Not Receiving Notifications

1. Verify NGrok is running: `ngrok http 3000`
2. Check `.env` has correct `PUBLIC_CALLBACK_URL`
3. Verify webhook URL is registered in OneKhusa Portal
4. Check server logs for errors: `node src/app.js`

### Invalid Idempotency Key

- Ensure key is **exactly 12 characters**
- Key must be **alphanumeric**
- Use the provided factory utility

### CORS Issues

Add the following to your Express middleware:

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://your-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

---

## 📚 Resources

- [OneKhusa API Documentation](https://docs.onekhusa.com)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Design Patterns in JavaScript](https://refactoring.guru/design-patterns/javascript)
- [Object Factory Pattern Guide](https://refactoring.guru/design-patterns/factory-method)

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📧 Support & Questions

For questions or support:

- Open an [Issue](https://github.com/GarryBalala/OneKhusa-Node.js-Integration-Reference/issues)
- Contact: [your-email@example.com](mailto:your-email@example.com)
- OneKhusa Support: [support@onekhusa.com](mailto:support@onekhusa.com)

---

**Last Updated**: May 13, 2026  
**Version**: 1.0.0  
**Maintainer**: GarryBalala
