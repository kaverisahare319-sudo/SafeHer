const axios = require('axios');

// Sends an SMS to one phone number using Fast2SMS (India numbers).
// Get a free API key at https://www.fast2sms.com after signup.
async function sendSMS(phone, message) {
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'q',
        message,
        language: 'english',
        flash: 0,
        numbers: phone
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error(`SMS to ${phone} failed:`, err.response?.data || err.message);
    return null;
  }
}

module.exports = sendSMS;
