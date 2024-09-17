import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

// Configurar el entorno de PayPal
function environment() {
  let clientId = process.env.PAYPAL_CLIENT_ID;
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId as string, clientSecret as string);
  } else {
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId as string, clientSecret as string);
  }
}

// Configurar el cliente de PayPal
export function paypalClient() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}