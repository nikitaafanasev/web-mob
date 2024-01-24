import express from 'express';
import { User, UserRole } from '../models/user.js';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: 'files/users/',
    filename: (req, file, cb) => {
      const userId = authService.extractUserClaimSet(req).id;
      cb(null, `${userId}${path.extname(file.originalname)}`);
    }
  })
});

router.post('/sign-up', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  if (req.body.password !== req.body.passwordCheck) {
    res.status(400);
    authService.removeToken(res);
    return res.json({ message: 'Passwords do not match.' });
  }
  const name = req.body.name;
  const createUser: User = { ...req.body, name, role: UserRole.GUEST, table: Math.floor(Math.random() * 30) + 1 };
  if ((await userDAO.findOne({ email: createUser.email })) !== null) {
    res.status(409);
    authService.removeToken(res);
    return res.json({ message: 'A user with this email address already exists.' });
  }
  const user = await userDAO.create(createUser);
  createAndSetToken(user, res);
  res.json({ ...user, token: res.getHeader('Authorization') });
});

router.post('/sign-in', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user: User = req.body;
  const result = await userDAO.findOne({ email: user.email, password: user.password });
  if (result === null) {
    authService.removeToken(res);
    res.status(401);
    return res.json({ message: 'You have entered an invalid username or password.' });
  }
  createAndSetToken(result, res);
  res.json({ ...result, token: res.getHeader('Authorization') });
});

router.get('/:id', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const userId = req.params.id;
  const user = await userDAO.findOne({ id: userId });
  if (user === null) {
    res.status(404);
    return res.json({ message: 'User could not be found.' });
  }
  res.json(user);
});

router.patch('/', authService.authenticationMiddleware, async (req, res) => {
  try {
    await new Promise<void>((resolve, reject) => {
      upload.single('image')(req, res, (err: unknown) => {
        err ? reject(err) : resolve();
      });
    });
  } catch (e) {
    res.status(401).json({ message: 'Error on upload: ' + (e as Error).message });
  }
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const partialUser: Partial<User> = { id: res.locals.userClaimSet.id };

  const props: (keyof User)[] = ['name', 'email'];
  for (const prop of props) {
    if (prop in req.body) {
      partialUser[prop] = req.body[prop];
    }
  }
  if (req.file) {
    partialUser.avatarUrl = `${req.protocol}://${req.hostname}:${req.app.locals.port}/files/users/${req.file.filename}`;
  }
  await userDAO.update(partialUser);
  res.status(200).end();
});

router.delete('/sign-out', (req, res) => {
  authService.removeToken(res);
  res.status(200).end();
});

export default router;

function createAndSetToken(user: User, res: express.Response) {
  const token = authService.createBearerToken({ ...user }, res);
  res.setHeader('Authorization', token);
  //authService.createAndSetToken({ ...user }, res);
}
