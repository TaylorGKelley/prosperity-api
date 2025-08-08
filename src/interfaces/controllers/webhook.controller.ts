import { type RequestHandler } from 'express';
import crypto, { type UUID } from 'node:crypto';
import { Users } from '@/application/useCases/Users.useCase';
import { generateSignature } from '@/application/utils/generateSignature.webhook';

type HandlerResponse = { success: true } | { success: false; error: string };

export const webhook: RequestHandler<{ id: UUID }, HandlerResponse> = (
  req,
  res
) => {
  try {
    if (
      req.headers['x-webhook-secret'] !==
      process.env.AUTH_SERVICE_WEBHOOK_SECRET
    ) {
      throw new Error('Unauthorized');
    } else if (
      req.headers['x-webhook-signature']!.toString() ===
      generateSignature(process.env.AUTH_SERVICE_WEBHOOK_SECRET!, req.body)
    ) {
      throw new Error('Signature does not match');
    }

    const user = req.body;

    Users.createUser(user);

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error((error as Error).message);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
};
