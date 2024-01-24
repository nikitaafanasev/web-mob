export class IdService {
  generate() {
    // A-Z, 0-9, 5 characters
    return Math.random().toString(36).toUpperCase().slice(-5);
  }
}

export const idService = new IdService();
