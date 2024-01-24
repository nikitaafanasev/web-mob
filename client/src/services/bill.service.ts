import { createContext } from '@lit/context';
import { httpClient } from '../http-client.js';
import { Bill } from '../models/bill.js';

export const billServiceContext = createContext<BillService>('bill-service');

export class BillService {
  async findOne() {
    const response = await httpClient.api.get('/bills/my-bill');
    const json = await response.json();
    return json as Bill;
  }

  create(bill: Partial<Bill>) {
    return httpClient.api.post('/bills', bill);
  }
}
