import mongodb from 'mongodb';
import { Express } from 'express';
import { MongoGenericDAO } from './models/mongo-generic.dao.js';
import { InMemoryGenericDAO } from './models/in-memory-generic.dao.js';
import { Task } from './models/task.js';
import { seed } from './seed.js';

import config from '../config.js';
import { User } from './models/user.js';
import { MenuItem } from './models/menu-item.js';
import { Order } from './models/order.js';
import { Bill } from './models/bill.js';
const { MongoClient } = mongodb;

export default async function startDB(app: Express) {
  switch (config.db.use) {
    case 'mongodb':
      await startMongoDB(app);
      break;
    default:
      await startInMemoryDB(app);
  }
  if (config.db.seed) {
    await seed(app);
  }
  return async () => Promise.resolve();
}

async function startInMemoryDB(app: Express) {
  app.locals.userDAO = new InMemoryGenericDAO<User>();
  app.locals.menuItemDAO = new InMemoryGenericDAO<MenuItem>();
  app.locals.orderDAO = new InMemoryGenericDAO<Order>();
  app.locals.taskDAO = new InMemoryGenericDAO<Task>();
  app.locals.billDAO = new InMemoryGenericDAO<Bill>();
  return async () => Promise.resolve();
}

async function startMongoDB(app: Express) {
  const client = await connectToMongoDB();
  const db = client.db('taskman');
  app.locals.userDAO = new MongoGenericDAO<User>(db, 'users');
  app.locals.menuItemDAO = new MongoGenericDAO<MenuItem>(db, 'menu-items');
  app.locals.orderDAO = new MongoGenericDAO<Order>(db, 'orders');
  app.locals.taskDAO = new MongoGenericDAO<Task>(db, 'tasks');
  return async () => await client.close();
}

async function connectToMongoDB() {
  const url = `mongodb://${config.db.connect.host}:${config.db.connect.port.mongodb}`;
  const client = new MongoClient(url, {
    auth: { username: config.db.connect.user, password: config.db.connect.password },
    authSource: config.db.connect.database
  });
  try {
    await client.connect();
  } catch (err) {
    console.error('Could not connect to MongoDB: ', err);
    process.exit(1);
  }
  return client;
}
