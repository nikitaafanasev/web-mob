import { v4 as uuidv4 } from 'uuid';

export class EntityService {
  create(entity: object) {
    return { ...entity, id: uuidv4(), createdAt: new Date().getTime() };
  }
}

export const entityService = new EntityService();
