import crypto from 'node:crypto';

export function generateSignature(secret: string, payload: any) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}
