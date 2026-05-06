const crypto = require('crypto');

const generateIdempotencyKey = (merchantNumber) => {
    const uuid = crypto.randomUUID(); // Generates a unique ID
    return `${merchantNumber}-${uuid}`;
};

module.exports = { generateIdempotencyKey };