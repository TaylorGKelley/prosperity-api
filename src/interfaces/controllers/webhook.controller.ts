import { type RequestHandler } from 'express';
import { type UUID } from 'node:crypto';
import { Users } from '@/application/useCases/Users.useCase';

type HandlerResponse = { success: true } | { success: false; error: string };

export const webhook: RequestHandler<{ id: UUID }, HandlerResponse> = (
  req,
  res
) => {
  try {
    // Get data from req.body
    if (
      req.headers['x-webhook-secret'] !==
      process.env.AUTH_SERVICE_WEBHOOK_SECRET
    )
      throw new Error('Unauthorized');

    const user = req.body;

    Users.createUser(user);

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
};
