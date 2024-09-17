import { Request, Response } from "express";
import { paypalClient } from "../services/paypalClient";
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export const createPayment = async (req: Request, res: Response) => {
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

export const capturePayment = async (req: Request, res: Response) => {
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
