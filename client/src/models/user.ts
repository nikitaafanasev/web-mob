import { createContext } from '@lit/context';
import { Entity } from './entity.js';

export const userContext = createContext<User | undefined>('user');

export interface User extends Entity {
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
