import { createContext } from '@lit/context';

export const stringServiceContext = createContext<StringService>('string-service');

export class StringService {
  date(createdAt: number) {
    const given = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - given.getTime();
    const diffDays = Math.floor(diff / (1000 * 3600 * 24));
    const diffHours = Math.floor(diff / (1000 * 3600));
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffSeconds = Math.floor(diff / 1000);
    if (diffDays > 0) {
      return diffDays === 1 ? 'one day ago' : diffDays + ' days ago';
    } else if (diffHours > 0) {
      return diffHours === 1 ? 'one hour ago' : diffHours + ' hours ago';
    } else if (diffMinutes > 0) {
      return diffMinutes === 1 ? 'one  minute ago' : diffMinutes + ' minutes ago';
    } else if (diffSeconds > 0) {
      return diffSeconds === 1 ? 'one second ago' : diffSeconds + ' seconds ago';
    } else {
      return 'just now';
    }
  }
}
