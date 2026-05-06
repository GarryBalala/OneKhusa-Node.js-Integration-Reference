const axios = require('axios');
const getAccessToken = require('./auth');
const { generateIdempotencyKey } = require('./utils');

const cleanUrl = (url) => url.replace(/\/+$/, "");


 //Handles Single Disbursement (Instant Payout)

const requestSinglePayout = async (data) => {
    const token = await getAccessToken();
    const merchantNo = parseInt(process.env.ONEKHUSA_MERCHANT_NUMBER);
    
    
    const safeReference = data.reference
        .replace(/[^a-zA-Z0-9]/g, "") 
        .slice(0, 12);                

    const payload = {
        merchantAccountNumber: merchantNo,
        sourceReferenceNumber: safeReference,
        beneficiaryName: data.beneficiaryName || "OneTicket User",
        beneficiaryAccountNumber: data.accountNumber.toString(),
        connectorId: parseInt(data.connectorId),
        transactionAmount: parseFloat(data.amount),
        transactionDescription: data.description || "OneTicket Payout",
        capturedBy: process.env.ONEKHUSA_CAPTURED_BY
    };

    console.log("--- Sending Single Payout ---");
    console.log("Ref:", safeReference, "Len:", safeReference.length);

    const response = await axios.post(
        `${cleanUrl(process.env.ONEKHUSA_BASE_URL)}/disbursements/single/add`,
        payload,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Idempotency-Key': `IDEM${safeReference}${Date.now()}`.slice(0, 30),
                'Accept-Language': 'en'
            }
        }
    );
    return response.data;
};

/**
 * Handles Batch Disbursement (Excel/CSV Upload)
 * File content must be Base64 encoded.
 */
const requestBatchPayout = async (fileBuffer, fileName) => {
    const token = await getAccessToken();
    const merchantNo = parseInt(process.env.ONEKHUSA_MERCHANT_NUMBER);
    const extension = fileName.split('.').pop().toUpperCase();

    const payload = {
        merchantAccountNumber: merchantNo,
        isBatchScheduled: false,
        contentType: extension === 'CSV' ? 'CSV' : 'XLSX',
        capturedBy: process.env.ONEKHUSA_CAPTURED_BY,
        fileContent: fileBuffer.toString('base64'),
        scheduledDate: null
    };

    console.log("--- Sending Batch Upload ---");
    
    const response = await axios.post(
        `${cleanUrl(process.env.ONEKHUSA_BASE_URL)}/disbursements/batch/addFile`,
        payload,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Idempotency-Key': `BATCH${merchantNo}${Date.now()}`.slice(0, 30),
                'Accept-Language': 'en'
            }
        }
    );
    return response.data;
};

module.exports = { requestSinglePayout, requestBatchPayout };