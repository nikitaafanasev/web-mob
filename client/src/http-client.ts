export interface HttpClientConfig {
  baseURL: string;
  apiPath: string;
  filesPath: string;
}

export class HttpClient {
  api!: HttpClientInternal;
  files!: HttpClientInternal;

  init(config: HttpClientConfig) {
    this.api = new HttpClientInternal(`${config.baseURL}/${config.apiPath}/`);
    this.files = new HttpClientInternal(`${config.baseURL}/${config.filesPath}/`);
  }
}

class HttpClientInternal {
  constructor(private baseURL: string) {}

  resolve(url: string) {
    return url.startsWith('http') ? url : `${this.baseURL}${url.startsWith('/') ? url.substring(1) : url}`;
  }

  get(url: string, options?: RequestInit) {
    return this.createFetch('GET', url, null, options);
  }

  post(url: string, body: unknown, options?: RequestInit) {
    return this.createFetch('POST', url, body, options);
  }

  put(url: string, body: unknown, options?: RequestInit) {
    return this.createFetch('PUT', url, body, options);
  }

  patch(url: string, body: unknown, options?: RequestInit) {
    return this.createFetch('PATCH', url, body, options);
  }

  delete(url: string, options?: RequestInit) {
    return this.createFetch('DELETE', url, null, options);
  }

  private async createFetch(method: string, url: string, body?: unknown, options?: RequestInit) {
    const requestOptions: RequestInit = options ?? {};
    requestOptions.method = method;
    requestOptions.credentials = 'include';
    requestOptions.headers = {
      Authorization: sessionStorage.getItem('jwt-token') || ''
    };
    if (body instanceof FormData) {
      requestOptions.body = body;
    } else {
      requestOptions.headers = {
        ...(requestOptions.headers ?? {}),
        'Content-Type': 'application/json; charset=utf-8'
      };
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }
    }
    const response = await fetch(this.resolve(url), requestOptions);
    if (response.ok) {
      return response;
    } else {
      let message = await response.text();
      try {
        message = JSON.parse(message).message;
      } catch (e) {
        message = (e as Error).message;
      }
      message = message || response.statusText;
      return Promise.reject({ message, statusCode: response.status });
    }
  }
}

export const httpClient = new HttpClient();
export type HttpError = { message: string; statusCode: number };
