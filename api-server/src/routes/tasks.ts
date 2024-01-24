import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Task, TaskType } from '../models/task.js';
import { User, UserRole } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import { idService } from '../services/id.service.js';
import { Bill } from '../models/bill.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const status = req.query.status as Task['status'];
  const role = res.locals.userClaimSet.role as User['role'];
  let tasks: Task[] = [];
  switch (role) {
    case UserRole.WAITER:
      const foodPreparedTasks = await taskDAO.findAll({ type: TaskType.FOOD_PREPARED, status });
      const drinksPreparedTasks = await taskDAO.findAll({ type: TaskType.DRINK_PREPARED, status });
      const talkRequestedTasks = await taskDAO.findAll({ type: TaskType.TALK_REQUESTED, status });
      const paymentRequestedCashTasks = await taskDAO.findAll({ type: TaskType.PAYMENT_REQUESTED_CASH, status });
      const paymentRequestedCardTasks = await taskDAO.findAll({ type: TaskType.PAYMENT_REQUESTED_CARD, status });
      tasks.push(
        ...foodPreparedTasks,
        ...drinksPreparedTasks,
        ...talkRequestedTasks,
        ...paymentRequestedCashTasks,
        ...paymentRequestedCardTasks
      );
      tasks = tasks.sort((a, b) => a.createdAt - b.createdAt);
      return res.json({ results: tasks });
    case UserRole.CHEF:
      const foodOrderedTasks = await taskDAO.findAll({ type: TaskType.FOOD_ORDERED, status });
      tasks.push(...foodOrderedTasks);
      tasks = tasks.sort((a, b) => a.createdAt - b.createdAt);
      return res.json({ results: tasks });
    case UserRole.BARKEEPER:
      const drinkOrderedTasks = await taskDAO.findAll({ type: TaskType.DRINK_ORDERED, status });
      tasks.push(...drinkOrderedTasks);
      tasks = tasks.sort((a, b) => a.createdAt - b.createdAt);
      return res.json({ results: tasks });
    default:
      res.status(403).json({ message: 'You are not allowed to claim tasks.' });
  }
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const userId = res.locals.userClaimSet.id;
  const data = req.body.data;
  delete req.body.data;
  const taskPartial: Task = req.body;
  const task = { status: 'open', type: taskPartial.type, guestId: userId, simpleId: idService.generate() } as Task;
  switch (taskPartial.type) {
    case TaskType.TALK_REQUESTED:
      return handleTalkRequestedTask(req, res, task);
    case TaskType.PAYMENT_REQUESTED_CASH:
    case TaskType.PAYMENT_REQUESTED_CARD:
      return handlePaymentTask(req, res, task, data);
    default:
      return res.status(400).json({ message: 'Task type not supported.' });
  }
});

router.post('/:id/next', authService.authenticationMiddleware, async (req, res) => {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const userId = res.locals.userClaimSet.id;
  const task = await taskDAO.findOne({ id: req.params.id });
  if (task === null) {
    res.status(404);
    return res.json({ message: 'Task could not be found.' });
  }
  switch (task.type) {
    case TaskType.FOOD_ORDERED:
      return handleOrderedTask(req, res, task, TaskType.FOOD_ORDERED, userId);
    case TaskType.DRINK_ORDERED:
      return handleOrderedTask(req, res, task, TaskType.DRINK_ORDERED, userId);
    case TaskType.FOOD_PREPARED:
    case TaskType.DRINK_PREPARED:
    case TaskType.PAYMENT_REQUESTED_CASH:
    case TaskType.PAYMENT_REQUESTED_CARD:
    case TaskType.TALK_REQUESTED:
      return handleSimpleTask(req, res, task, userId);
    default:
      return res.json({ message: 'Task type not supported.' });
  }
});

export default router;

async function handleTalkRequestedTask(req: express.Request, res: express.Response, task: Task) {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const openTalkRequestedTask = await taskDAO.findOne({
    type: TaskType.TALK_REQUESTED,
    status: 'open',
    guestId: task.guestId
  });
  const claimedTalkRequestedTask = await taskDAO.findOne({
    type: TaskType.TALK_REQUESTED,
    status: 'claimed',
    guestId: task.guestId
  });
  if (openTalkRequestedTask !== null || claimedTalkRequestedTask !== null) {
    res.status(400);
    return res.json({ message: 'You already requested a talk. A Waiter will come to you!' });
  }
  task.title = 'Talk';
  task.description = 'Waiter requested';
  const talkTask = await taskDAO.create(task);
  return res.json(talkTask);
}

async function handleOrderedTask(
  req: express.Request,
  res: express.Response,
  task: Task,
  type: TaskType.FOOD_ORDERED | TaskType.DRINK_ORDERED,
  userId: string
) {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  switch (task.status) {
    case 'open':
      task.status = 'claimed';
      await taskDAO.update(task);
      return res.json(task);
    case 'claimed':
      task.status = 'done';
      task.claimerId = userId;
      await taskDAO.update(task);
      const preparedTask = await taskDAO.create({
        simpleId: task.simpleId,
        title: type === TaskType.FOOD_ORDERED ? 'Food Preparation' : 'Drink Preparation',
        description: type === TaskType.FOOD_ORDERED ? 'Food prepared' : 'Drink prepared',
        type: type === TaskType.FOOD_ORDERED ? TaskType.FOOD_PREPARED : TaskType.DRINK_PREPARED,
        status: 'open',
        order: task.order,
        guestId: task.guestId
      });
      return res.json(preparedTask);
    case 'done':
      return res.json({ message: 'Task is already done.' });
    default:
      res.status(400);
      return res.json({ message: 'An error occured.' });
  }
}

// Tasks, which don't create new tasks after they are done
async function handleSimpleTask(req: express.Request, res: express.Response, task: Task, userId: string) {
  switch (task.status) {
    case 'open':
      task.status = 'claimed';
      task.claimerId = userId;
      return res.json(task);
    case 'claimed':
      task.status = 'done';
      task.claimerId = userId;
      return res.json(task);
    case 'done':
      res.status(400);
      return res.json({ message: 'You cannot update a task that is done.' });
    default:
      res.status(400);
      return res.json({ message: 'You cannot update a task that is done.' });
  }
}

async function handlePaymentTask(req: express.Request, res: express.Response, task: Task, data: any) {
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  const cashTask = await taskDAO.findOne({
    type: TaskType.PAYMENT_REQUESTED_CASH,
    status: 'open',
    guestId: task.guestId
  });
  const cardTask = await taskDAO.findOne({
    type: TaskType.PAYMENT_REQUESTED_CARD,
    status: 'open',
    guestId: task.guestId
  });
  if (cashTask !== null || cardTask !== null) {
    res.status(400);
    return res.json({ message: 'You already requested a payment. A Waiter will come to you!' });
  }

  switch (task.type) {
    case TaskType.PAYMENT_REQUESTED_CASH:
      task.title = 'Payment requested';
      task.description = 'Payment requested';
      task.data = data;
      const paymentTaskCash = await taskDAO.create(task);
      return res.json(paymentTaskCash);
    case TaskType.PAYMENT_REQUESTED_CARD:
      task.title = 'Payment requested';
      task.description = 'Payment requested';
      task.data = data;
      const paymentTaskCard = await taskDAO.create(task);
      return res.json(paymentTaskCard);
    default:
      return res.status(400).json({ message: 'Task type not supported.' });
  }
}
