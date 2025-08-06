import { type UUID } from 'node:crypto';

export type User = {
  id: UUID;
  email: string;
};
