// backend/config/paypal.js

const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// 1. Get your Client ID and Secret from the .env file
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

// 2. Set up the Sandbox environment
const environment = new checkoutNodeJssdk.core.SandboxEnvironment(
  clientId,
  clientSecret
);

// 3. Create the PayPal client
const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

module.exports = client;