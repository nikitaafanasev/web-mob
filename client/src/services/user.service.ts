import { createContext } from '@lit/context';
import { httpClient } from '../http-client.js';
import { User } from '../models/user.js';

export const userServiceContext = createContext<UserService>('user-service');

export class UserService {
  async signIn(user: SignInUser) {
    const response = await httpClient.api.post('/users/sign-in', user);
    const json = await response.json();
    this.extractToken(json);
    console.log(json);
    return json as User;
  }

  async signUp(user: SignUpUser) {
    const response = await httpClient.api.post('/users/sign-up', user);
    const json = await response.json();
    this.extractToken(json);
    const result = json as User;
    return result;
  }

  async signOut() {
    await httpClient.api.delete('/users/sign-out');
  }

  async findOne(id: string) {
    const response = await httpClient.api.get(`/users/${id}`);
    const json = await response.json();
    const result = json as User;
    return result;
  }

  async findMany(ids: string[]) {
    const userMap = new Map<string, User>();
    console.log(ids);
    for (const userId of ids) {
      const user = await this.findOne(userId);
      if (user) {
        userMap.set(userId, user);
      }
    }
    return userMap;
  }

  private extractToken(json: any) {
    const token = json.token;
    sessionStorage.setItem('jwt-token', token);
  }
}

type SignInUser = Pick<User, 'email' | 'password'>;

type SignUpUser = Pick<User, 'email' | 'password' | 'name'>;
