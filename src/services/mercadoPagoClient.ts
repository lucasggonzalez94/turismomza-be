import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
});

export const payment = new Payment(mercadopago);
export const preference = new Preference(mercadopago);

export default mercadopago;