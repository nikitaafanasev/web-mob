import express from 'express';
import { MenuItem, MenuItemComment, MenuItemRating } from '../models/menu-item.js';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import multer from 'multer';
import path from 'node:path';
import { entityService } from '../services/entity.service.js';

const router = express.Router();
const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: 'files/menu-items/',
    filename: (req, file, cb) => {
      const id = req.params.id;
      cb(null, `${id}${path.extname(file.originalname)}`);
    }
  })
});

router.get('/', async (req, res) => {
  const menuItemDAO: GenericDAO<MenuItem> = req.app.locals.menuItemDAO;
  const type = req.query.type as MenuItem['type'];
  const menuItems = await menuItemDAO.findAll({ type });
  res.json({ results: menuItems });
});

router.get('/:id', async (req, res) => {
  const menuItemDAO: GenericDAO<MenuItem> = req.app.locals.menuItemDAO;
  const menuItem = await menuItemDAO.findOne({ id: req.params.id });
  if (menuItem === null) {
    res.status(404);
    return res.json({ message: 'Menu item could not be found.' });
  }
  res.json(menuItem);
});

router.patch('/:id', async (req, res) => {
  try {
    await new Promise<void>((resolve, reject) => {
      upload.single('image')(req, res, (err: unknown) => {
        err ? reject(err) : resolve();
      });
    });
  } catch (e) {
    res.status(401).json({ message: 'Error on data upload: ' + (e as Error).message });
  }
  const menuItemDAO: GenericDAO<MenuItem> = req.app.locals.menuItemDAO;
  const partialMenuItem: Partial<MenuItem> = { id: req.params.id };
  const props: (keyof MenuItem)[] = ['name', 'description', 'price', 'type', 'categories', 'imageUrl'];
  for (const prop of props) {
    if (prop in req.body) {
      partialMenuItem[prop] = req.body[prop];
    }
  }
  if (req.file) {
    partialMenuItem.imageUrl = `${req.protocol}://${req.hostname}:${req.app.locals.port}/files/menu-items/${req.file.filename}`;
  }
  await menuItemDAO.update(partialMenuItem);
  const menuItem = await menuItemDAO.findOne({ id: req.params.id });
  res.json(menuItem);
});

router.post('/:id/comments', authService.authenticationMiddleware, async (req, res) => {
  console.log(res.locals.userClaimSet);
  const menuItemDAO: GenericDAO<MenuItem> = req.app.locals.menuItemDAO;
  const comment = entityService.create(req.body) as MenuItemComment;
  comment.creatorId = res.locals.userClaimSet.id;
  const menuItem = await menuItemDAO.findOne({ id: req.params.id });
  if (menuItem === null) {
    res.status(404);
    return res.json({ message: 'Menu item could not be found.' });
  }
  menuItem.comments.push(comment);
  await menuItemDAO.update(menuItem);
  res.json(comment);
});

router.post('/:id/ratings', authService.authenticationMiddleware, async (req, res) => {
  const menuItemDAO: GenericDAO<MenuItem> = req.app.locals.menuItemDAO;
  const rating = entityService.create(req.body) as MenuItemComment;
  rating.creatorId = res.locals.userClaimSet.id;
  const menuItem = await menuItemDAO.findOne({ id: req.params.id });
  if (menuItem === null) {
    res.status(404);
    return res.json({ message: 'Menu item could not be found.' });
  }

  const existingRating = menuItem.ratings.find(r => r.creatorId === rating.creatorId);
  if (existingRating) {
    existingRating.value = req.body.value;
    await menuItemDAO.update(menuItem);
    return res.json(existingRating);
  } else {
    const rating = entityService.create(req.body) as MenuItemRating;
    rating.creatorId = res.locals.userClaimSet.id;
    menuItem.ratings.push(rating);
    await menuItemDAO.update(menuItem);
    return res.json(rating);
  }
});

router.delete('/:id', async (req, res) => {
  const menuItemDAO: GenericDAO<MenuItem> = req.app.locals.menuItemDAO;
  const menuItem = await menuItemDAO.findOne({ id: req.params.id });
  if (menuItem === null) {
    res.status(404);
    return res.json({ message: 'Menu item could not be found.' });
  }
  await menuItemDAO.delete(menuItem.id);
  res.json({ message: 'Menu item deleted.' });
});

export default router;
