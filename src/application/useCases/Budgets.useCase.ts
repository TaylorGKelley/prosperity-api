import { Budget } from '@/types/schema';
import { type User } from '@/types/User';
import { type UUID } from 'node:crypto';

export class Budgets {
  public static forUser(user: User | null) {
    if (user === null) throw new Error('Unauthorized');

    return new Budgets(user.id);
  }

  private _userId: UUID;
  public constructor(userId: UUID) {
    this._userId = userId;
  }

  public async get(): Promise<Budget> {
    return {
      id: '',
    };
  }
}
