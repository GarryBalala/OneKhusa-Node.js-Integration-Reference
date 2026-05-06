const express = require('express');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Required for Socket.io
const path = require('path');
const oneKhusa = require('./services/onekhusa.service');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Wrap Express
const io = new Server(server); // Initialize Socket.io

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Make io accessible to our webhook route
global.io = io;

// In-memory tracker (Same as C# TicketTracker)
const ticketTracker = {};

// Log socket connection
io.on('connection', (socket) => {
    console.log('🌐 Socket.io Client Connected');
});

/** 
 * MATCH C# [HttpPost("buy/{eventId}")]
 * Initiates checkout and returns redirect URL
 */
app.post('/api/Tickets/buy/:eventId', async (req, res) => {
    // Generate reference like C# (OT + Ticks)
    const reference = "OT" + Date.now().toString().slice(-10);
    const amount = 2500.00;

    try {
        const data = await oneKhusa.initiateHostedCheckout(
            amount, 
            reference, 
            "OneTicket Showcase Entry"
        );
        
        // Save status as Pending
        ticketTracker[reference] = "Pending";

        // Return the redirect URL to the frontend
        res.json({
            status: "success",
            redirectUrl: `https://checkout.onekhusa.com/requestToPay/initiate?ptid=${data.paymentTransactionId}`,
            reference: reference
        });
    } catch (error) {
        console.error("Initiation Error:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
});

/** 
 * MATCH C# [HttpGet("status/{reference}")]
 * Used for polling or manual status verification
 */
app.get('/api/Tickets/status/:reference', (req, res) => {
    const status = ticketTracker[req.params.reference] || "NotFound";
    res.json({ status: status });
});

/** 
 * MATCH C# [HttpPost("payments")] Webhook
 * Handles OneKhusa automated notifications
 */
app.post('/webhooks/payments', (req, res) => {
    const payload = req.body;
    
    // OneKhusa Checkout Webhook uses 'metaData.ReferenceNumber' (Capital R)
    const myRef = payload.metaData?.ReferenceNumber || 
                  payload.metaData?.referenceNumber || 
                  payload.sourceReferenceNumber;

    if (payload.responseCode === "S100" || payload.transactionStatusCode === "S") {
        ticketTracker[myRef] = "Paid";
        
        if (global.io) {
            global.io.emit('webhook_received', { reference: myRef, status: 'Paid' });
        }
    }
    res.status(200).send("acknowledged");
});

// IMPORTANT: Start the HTTP server, not the app
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`🚀 OneTicket Checkout: http://localhost:${PORT}`);
    console.log(`📡 Webhook Endpoint:  /webhooks/payments`);
    console.log(`-----------------------------------------------`);
});