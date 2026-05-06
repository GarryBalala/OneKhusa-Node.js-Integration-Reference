# OneKhusa Node.js Integration Reference

A professional, full-stack reference implementation for the **OneKhusa Payment Gateway**. This project serves as a complete blueprint for developers building Node.js backends that require secure collections via **Hosted Checkout** and automated **Disbursements** (payouts).

## 🚀 Key Features

- **Hosted Checkout**: Seamless redirection flow to OneKhusa’s managed payment page.
- **Single Disbursements**: Instant payouts to bank accounts or mobile wallets with 12-char reference validation.
- **Batch Disbursements**: Bulk processing of Excel/CSV settlement files using Base64 encoding.
- **Universal Webhook Handler**: A robust listener that catches notifications across multiple paths (`/webhooks/payments`, `/webhooks/onekhusa`, etc.).
- **Real-Time Automation**: Live UI updates via **Socket.io** as soon as a payment is confirmed.
- **Verification Overlay**: A smart frontend strategy to handle asynchronous redirects and background webhook synchronization.
- **Idempotency**: Automatic generation of `X-Idempotency-Key` for all financial operations.

---

## 📂 Project Structure

```text
onekhusa-nodejs-integration/
├── public/
│   └── index.html          # OneTicket Fintech Dashboard (Frontend)
├── src/
│   ├── services/
│   │   └── onekhusa.service.js # Hosted Checkout Logic
│   ├── app.js              # Express Server, Webhooks & Routes
│   ├── disbursement.js     # Single & Batch Payout Engine
│   └── utils.js            # Idempotency Key Utility
├── .env                    # The Brain: Configuration & Secrets
├── .gitignore              # Security: Excludes node_modules and .env
└── package.json            # Project Dependencies & Scripts
🛠️ Setup & Installation
1. Prerequisites
Node.js (v14+)
NGrok (Required for local webhook testing)
OneKhusa Merchant Account (Sandbox credentials)
2. Installation
code
Bash
# Clone the repository
git clone https://github.com/GarryBalala/OneKhusa-Node.js-Integration-Reference.git

# Enter the directory
cd OneKhusa-Node.js-Integration-Reference

# Install dependencies
npm install
3. Configuration (.env)
The .env file is the central "brain" of the application. Create it in the root directory:
code
Env
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

PORT=3000
📡 Webhook Setup (Local Development)
To receive real-time notifications from the cloud to your local machine:
Start NGrok: Run ngrok http 3000.
Update .env: Copy the https URL from NGrok into the PUBLIC_CALLBACK_URL in your .env.
Register URL: In the OneKhusa Portal, navigate to Developers > Webhooks and register:
https://your-id.ngrok-free.dev/webhooks/payments
💻 Usage
Starting the Server
code
Bash
node src/app.js
Functional Flow
Collections: Click "Purchase Ticket" to be redirected to OneKhusa. Once paid in the portal simulator, OneKhusa redirects you back to your dashboard. The Verification Overlay will appear and automatically turn green once the webhook hits your backend.
Disbursements:
Single: Enter a test account (e.g., 3333888800) to trigger an instant payout.
Batch: Upload an .xlsx or .csv file. The backend automatically converts the buffer to a Base64 string for the OneKhusa API.
