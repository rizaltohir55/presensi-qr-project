const crypto = require('crypto');

const QR_SECRET_KEY = process.env.QR_SECRET_KEY;
const TOKEN_LIFESPAN_SECONDS = 60; // QR code valid for 1 minute

if (!QR_SECRET_KEY) {
    console.error('QR_SECRET_KEY is not defined in environment variables. Please set it.');
    process.exit(1); // Exit if the secret key is not set
}

/**
 * Generates a time-based QR token.
 * The token is a hash of the secret key, a timestamp rounded to the nearest minute,
 * and optional additional data (location_id, shift_id).
 * @param {string} locationId - The ID of the location.
 * @param {string} shiftId - The ID of the shift.
 * @returns {string} The generated QR token.
 */
const generateToken = (locationId, shiftId) => {
    // Get current time rounded down to the nearest minute
    const now = Math.floor(Date.now() / (TOKEN_LIFESPAN_SECONDS * 1000));
    const dataToHash = `${QR_SECRET_KEY}-${now}-${locationId || ''}-${shiftId || ''}`;
    return crypto.createHash('sha256').update(dataToHash).digest('hex');
};

/**
 * Validates a given QR token against the current minute and the previous minute.
 * This provides a small window for network latency or clock skew.
 * @param {string} token - The token to validate.
 * @param {string} locationId - The ID of the location.
 * @param {string} shiftId - The ID of the shift.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
const validateToken = (token, locationId, shiftId) => {
    // Check against current minute
    const expectedTokenCurrent = generateToken(locationId, shiftId);
    if (token === expectedTokenCurrent) {
        return true;
    }

    // Check against previous minute (to account for slight time differences)
    const now = Math.floor(Date.now() / (TOKEN_LIFESPAN_SECONDS * 1000));
    const previousMinute = now - 1;
    const dataToHashPrevious = `${QR_SECRET_KEY}-${previousMinute}-${locationId || ''}-${shiftId || ''}`;
    const expectedTokenPrevious = crypto.createHash('sha256').update(dataToHashPrevious).digest('hex');

    if (token === expectedTokenPrevious) {
        return true;
    }

    return false;
};

module.exports = {
    generateToken,
    validateToken,
    TOKEN_LIFESPAN_SECONDS
};
