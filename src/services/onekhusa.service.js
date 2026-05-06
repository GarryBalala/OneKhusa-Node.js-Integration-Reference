const axios = require('axios');
require('dotenv').config();

class OneKhusaService {
    async initiateHostedCheckout(amount, reference, description) {
        // 1. Clean the data to ensure perfect types
        const apiKey = process.env.ONEKHUSA_API_KEY?.trim();
        const apiSecret = process.env.ONEKHUSA_API_SECRET?.trim();
        const orgId = process.env.ONEKHUSA_ORG_ID?.trim();
        const merchantNo = parseInt(process.env.ONEKHUSA_MERCHANT_NUMBER);

        const payload = {
            authentication: {
                apiKey: apiKey,
                apiSecret: apiSecret
            },
            merchant: {
                organisationId: orgId,
                merchantAccountNumber: merchantNo
            },
            payment: {
                sourceReferenceNumber: reference,
                description: description,
                amount: parseFloat(amount)
            },
            // Inside your initiateHostedCheckout method:
            route: {
                // Both point back to home, but we add a 'ref' parameter
                successRedirectionUrl: `${process.env.PUBLIC_CALLBACK_URL}/?ref=${reference}`,
                failureRedirectionUrl: `${process.env.PUBLIC_CALLBACK_URL}/?ref=${reference}`,
                callbackApiUrl: `${process.env.PUBLIC_CALLBACK_URL}/webhooks/payments`
            }
        };

        // DEBUG: Verify the payload in terminal
        console.log("--- Sending Checkout Payload ---");
        console.log(JSON.stringify(payload, null, 2));

        try {
            const response = await axios.post(
                process.env.ONEKHUSA_CHECKOUT_URL,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Idempotency-Key': `CHK-${reference}-${Date.now()}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            // Detailed Error Logging
            if (error.response) {
                console.error("OneKhusa API Error Response:", error.response.data);
            } else {
                console.error("Network Error:", error.message);
            }
            throw error;
        }
    }
}

module.exports = new OneKhusaService();