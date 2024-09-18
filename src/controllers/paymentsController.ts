import { Request, Response } from "express";
import crypto from 'crypto';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

import { paypalClient } from "../services/paypalClient";
import { payment, preference } from "../services/mercadoPagoClient";
import prisma from "../prismaClient";

const WEBHOOK_SECRET = process.env.MERCADOPAGO_ACCESS_TOKEN;

export const createPaymentPaypal = async (req: Request, res: Response) => {
  const { amount, currency = 'USD' } = req.body;

  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: "Invalid amount provided" });
  }

  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
      },
    ],
  });

  try {
    const response = await paypalClient().execute(request);
    res.status(201).json({
      status: 'success',
      order: {
        id: response.result.id,
        status: response.result.status,
      },
      links: response.result.links,
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ 
      status: 'error',
      message: "Error creating PayPal order",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const capturePaymentPaypal = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);

  try {
    const capture = await paypalClient().execute(request);
    
    if (capture.result.status === 'COMPLETED') {
      res.status(200).json({
        status: 'success',
        orderId: capture.result.id,
        captureId: capture.result.purchase_units[0].payments.captures[0].id
      });
    } else {
      res.status(400).json({
        status: 'failure',
        message: 'Payment capture was not successful'
      });
    }
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({ error: "Error capturing PayPal order" });
  }
};

export const createPaymentMercadoPago = async (req: Request, res: Response) => {
  try {
    const { attractionId, userId, amount } = req.body;

    const preferenceData = {
      body: {
        items: [
          {
            id: `AD-${attractionId}`,
            title: 'Publicidad de atracción turística',
            currency_id: 'ARS',
            description: 'Publicidad para atracción turística',
            category_id: 'services',
            quantity: 1,
            unit_price: Number(amount)
          }
        ],
        payer: {
          name: 'Nombre del Usuario',
          email: 'usuario@email.com',
          phone: {
            area_code: '11',
            number: '22223333'
          },
          identification: {
            type: 'DNI',
            number: '12345678'
          },
          address: {
            street_name: 'Calle',
            street_number: '123',
            zip_code: '1111'
          }
        },
        back_urls: {
          success: "https://tuapp.com/success",
          failure: "https://tuapp.com/failure",
          pending: "https://tuapp.com/pending"
        },
        auto_return: "approved",
        external_reference: `${userId}-${attractionId}`,
        notification_url: 'https://tuapp.com/api/mercadopago/webhook'
      }
    };

    const response = await preference.create(preferenceData);
    const preferenceId = response.id;

    const advertisement = await prisma.advertisement.create({
      data: {
        attractionId: attractionId,
        userId: userId,
        amountPaid: Number(amount),
        isActive: false,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde ahora
      },
    });

    res.json({
      id: advertisement.id,
      preferenceId,
      init_point: response.init_point
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
};

export const handleMercadoPagoWebhook = async (req: Request, res: Response) => {
  try {
    const body = JSON.stringify(req.body);
    const mpSignature = req.headers['x-mp-signature'] as string;

    if (!mpSignature) {
      return res.status(400).json({ error: 'Firma no proporcionada' });
    }

    const hash = crypto.createHmac('sha256', WEBHOOK_SECRET as string).update(body).digest('hex');

    if (hash !== mpSignature) {
      return res.status(401).json({ error: 'Firma inválida, notificación no confiable' });
    }

    const paymentInfo = req.body;

    if (paymentInfo.type === 'payment') {
      const paymentDetails = await payment.get(paymentInfo.data.id);

      const { status, external_reference } = paymentDetails;
      const [userId, attractionId] = external_reference!.split('-');

      if (status === 'approved') {
        await prisma.advertisement.updateMany({
          where: { attractionId: attractionId, userId: userId },
          data: {
            isActive: true,
          },
        });
      }

      res.sendStatus(200);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error procesando la notificación de pago' });
  }
};
