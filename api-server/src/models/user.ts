import { Entity } from './entity';

export interface User extends Entity {
  reservations: string;
  email: string;
  password: string;
  name: {
    first: string;
    last: string;
  };
  role: UserRole;
  avatarUrl?: string;
  table?: number;
}

export enum UserRole {
  ADMIN = 'admin',
  GUEST = 'guest',
  WAITER = 'waiter',
  CHEF = 'chef',
  BARKEEPER = 'barkeeper'
}
