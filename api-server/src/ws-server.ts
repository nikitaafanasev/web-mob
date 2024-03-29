import { IncomingMessage, Server } from 'node:http';
import cookie from 'cookie';
import WebSocket, { WebSocketServer } from 'ws';
import { User } from './models/user.js';
import { authService } from './services/auth.service.js';

interface WebSocketExt extends WebSocket {
  isAlive: boolean;
  claimsSet: Partial<User>;
}

class MyWebSocketServer {
  private wss!: WebSocket.Server;

  public init(httpServer: Server) {
    this.wss = new WebSocketServer({ server: httpServer });
    this.setupHeartBeat();

    this.wss.on('connection', (ws: WebSocketExt, req) => this.onConnection(ws, req));
  }

  public sendMessage(userId: string, message: object) {
    const messageString = JSON.stringify(message);
    this.wss.clients.forEach(client => {
      const ws = client as WebSocketExt;
      if (ws.claimsSet.id === userId) {
        ws.send(messageString);
      }
    });
  }

  private async onConnection(ws: WebSocketExt, req: IncomingMessage) {
    const valid = await this.validateConnection(ws, req);
    if (valid) {
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });
    } else {
      ws.close();
    }
  }

  private async validateConnection(ws: WebSocketExt, req: IncomingMessage) {
    const token = cookie.parse(req.headers.cookie as string)['jwt-token'];
    try {
      ws.claimsSet = authService.verifyToken(token) as Partial<User>;
      return true;
    } catch (error) {
      return false;
    }
  }

  private setupHeartBeat() {
    setInterval(() => {
      this.wss.clients.forEach(client => {
        const ws = client as WebSocketExt;
        if (!ws.isAlive) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(() => {
          /* noop */
        });
      });
    }, 30000);
  }
}

export const wsServer = new MyWebSocketServer();

export function startWebSocketServer(httpServer: Server) {
  wsServer.init(httpServer);
}
