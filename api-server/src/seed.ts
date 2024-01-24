import { Express } from 'express';

import { GenericDAO } from './models/generic.dao.js';
import { Task } from './models/task.js';

import seeds from '../db/seeds.json' assert { type: 'json' };
import { User } from './models/user.js';
import { MenuItem } from './models/menu-item.js';
import config from '../config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export async function seed(app: Express) {
  const paths = ['menu-items', 'users/profiles'];
  // delete files directory
  const basedir = path.dirname(fileURLToPath(import.meta.url));
  const filesDir = path.join(basedir, '..', 'files');
  fs.rmdirSync(filesDir, { recursive: true });
  // create files directory
  fs.mkdirSync(filesDir);
  // create files from paths
  for (const href of paths) {
    fs.mkdirSync(path.join(filesDir, href), { recursive: true });
  }

  // add example files
  const pathsExamples = ['menu-items'];
  for (const href of pathsExamples) {
    copyExampleFiles(href);
  }
  const userDAO: GenericDAO<User> = app.locals.userDAO;
  for (const [_, user] of Object.entries(seeds.users)) {
    await userDAO.create(user as User);
  }

  const menuItemDAO: GenericDAO<MenuItem> = app.locals.menuItemDAO;
  for (const menuItem of seeds.menuItems) {
    const createMenuItem = menuItem as unknown as MenuItem;
    createMenuItem.imageUrl = createImageUrl('menu-items/' + menuItem.id!);
    await menuItemDAO.create(createMenuItem);
  }
}

function copyExampleFiles(href: string) {
  // from api/server-server/example-files to api-server/api-server/files
  const basedir = path.dirname(fileURLToPath(import.meta.url));
  const exampleDir = path.join(basedir, '..', 'example-files', href);
  const filesDir = path.join(basedir, '..', 'files', href);
  // copy example files to files directory
  fs.readdirSync(exampleDir).forEach((file: string) => {
    const src = path.join(exampleDir, file);
    const dest = path.join(filesDir, file);
    fs.copyFileSync(src, dest);
  });
}

function createImageUrl(path: string) {
  return `http://${config.db.connect.host}:${config.server.port}/files/${path}.jpg`;
}

function convertDate(dateStr: string) {
  function pad(num: number) {
    return num.toString().padStart(2, '0');
  }

  if (!isNaN(Number(dateStr.substring(0, 1)))) {
    return dateStr;
  }
  const date = new Date();
  if (dateStr === 'yesterday') {
    date.setDate(date.getDate() - 1);
  } else if (dateStr === 'tomorrow') {
    date.setDate(date.getDate() + 1);
  } else if (dateStr.substring(0, 1) === '+') {
    date.setDate(date.getDate() + Number(dateStr.substring(1)));
  } else if (dateStr.substring(0, 1) === '-') {
    date.setDate(date.getDate() - Number(dateStr.substring(1)));
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
