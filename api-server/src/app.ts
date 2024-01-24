import 'express-async-errors'; // express app won't crash on unhandled promise rejections
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import tasks from './routes/tasks.js';
import users from './routes/users.js';
import startDB from './db.js';
import { corsService } from './services/cors.service.js';

import config from '../config.js';
import menuItems from './routes/menu-items.js';
import orders from './routes/orders.js';
import { startWebSocketServer } from './ws-server.js';
import bills from './routes/bills.js';

function configureApp(app: Express) {
  const basedir = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(corsService.corsMiddleware);
  app.use(
    '/files',
    express.static(path.join(basedir, '..', 'files'), {
      etag: true,
      setHeaders: function (res) {
        res.setHeader('Cache-Control', 'max-age=0, must-revalidate');
      }
    })
  );
  app.use('/api/users', users);
  app.use('/api/menu-items', menuItems);
  app.use('/api/orders', orders);
  app.use('/api/tasks', tasks);
  app.use('/api/bills', bills);
  // Error Handler (We need to define this as the last middleware, because it is a catch all error handler)
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  });
}

export async function start() {
  const app = express();

  configureApp(app);
  await startDB(app);
  startHttpServer(app, config.server.port);
}

function startHttpServer(app: Express, port: number) {
  const httpServer = http.createServer(app);
  startWebSocketServer(httpServer);
  httpServer.listen(port, () => {
    app.locals.port = port;
    // Hier wird nur der tatsächliche Port ausgegeben, Änderungen sind nur in der config.json möglich!
    console.log(`Server running at http://localhost:${port}`);
  });
}

start();
