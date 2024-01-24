import { createContext } from '@lit/context';
import { httpClient } from '../http-client.js';
import { Entity } from '../models/entity.js';
import {Reservation} from "../models/reservation";

export const reservationServiceContext = createContext<ReservationService>('order-service');

class CreateReservation {
}

export class ReservationService {
    async findAll() {
        const response = await httpClient.api.get('/reservations');
        return (await response.json()).results as Promise<Reservation[]>;
    }

    async create(reservation: CreateReservation) {
        const response = await httpClient.api.post('/orders', reservation);
    }

    async findOne(id: number) {
        return undefined;
    }
}

export type CreateOrder = Omit<Reservation, keyof Entity | 'creatorId'>;

export interface Reservation extends Entity {
}
class ReservationImpl implements Reservation {
    get time(): number {
        return this.time;
    }

    set time(value: number) {
        this.time = value;
    }
    get id(): never {
        return this.id;
    }

    set id(value: never) {
        this.id = value;
    }
    get date(): number {
        return this.date;
    }

    set date(value: number) {
        this.date = value;
    }
    get creatorId(): string {
        return this.creatorId;
    }

    set creatorId(value: string) {
        this.creatorId = value;
    }
    get createdAt(): number {
        return this.createdAt;
    }

    set createdAt(value: number) {
        this.createdAt = value;
    }
}