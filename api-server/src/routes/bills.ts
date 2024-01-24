import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Bill } from '../models/bill.js';
import { authService } from '../services/auth.service.js';
import { Task, TaskType } from '../models/task.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const billDAO: GenericDAO<Bill> = req.app.locals.billDAO;
  const bills = await billDAO.findAll();
  res.json({ results: bills });
});

router.get('/my-bill', authService.authenticationMiddleware, async (req, res) => {
  const billDAO: GenericDAO<Bill> = req.app.locals.billDAO;
  const userId = res.locals.userClaimSet.id;
  const bill = await billDAO.findOne({ payerId: userId });
  if (bill) {
    return res.json(bill);
  }
  res.status(404).json({ message: 'No bill found.' });
});

router.get('/:id', async (req, res) => {
  const billDAO: GenericDAO<Bill> = req.app.locals.billDAO;
  const bill = await billDAO.findOne({ id: req.params.id });
  if (bill === null) {
    res.status(404);
    return res.json({ message: 'Bill could not be found.' });
  }
  res.json(bill);
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const billDAO: GenericDAO<Bill> = req.app.locals.billDAO;
  const userId: string = res.locals.userClaimSet.id;
  const bill = await billDAO.create({ ...req.body, paid: true, payerId: userId });
  res.status(201).json(bill);
});

export default router;
