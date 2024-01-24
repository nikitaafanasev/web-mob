import express from 'express';
import { authService } from '../services/auth.service.js';
import { Order, OrderItem } from '../models/order.js';
import { GenericDAO } from '../models/generic.dao.js';
import { Task, TaskType } from '../models/task.js';
import { idService } from '../services/id.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const orderDAO = req.app.locals.orderDAO;
  const orders = await orderDAO.findAll({ creatorId: res.locals.userClaimSet.id });
  res.json({ results: orders });
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const orderDAO: GenericDAO<Order> = req.app.locals.orderDAO;
  const userId = res.locals.userClaimSet.id;
  const order = await orderDAO.create({
    ...req.body,
    creatorId: res.locals.userClaimSet.id
  });
  //
  const [foodOrders, drinkOrders] = order.orderItems.reduce(
    (acc, orderItem) => {
      if (orderItem.menuItem.type === 'food') {
        acc[0].push(orderItem);
      } else {
        acc[1].push(orderItem);
      }
      return acc;
    },
    [[], []] as [OrderItem[], OrderItem[]]
  );
  const taskDAO: GenericDAO<Task> = req.app.locals.taskDAO;
  if (foodOrders.length > 0) {
    const foodOrderedTask = await taskDAO.create({
      simpleId: idService.generate(),
      title: 'Food Order',
      description: `Food ordered`,
      type: TaskType.FOOD_ORDERED,
      status: 'open',
      order: foodOrders,
      guestId: userId
    });
  }
  // TODO: WebSocket
  if (drinkOrders.length > 0) {
    const drinksOrderedTask = await taskDAO.create({
      simpleId: idService.generate(),
      title: 'Drink Order',
      description: `Food ordered`,
      type: TaskType.DRINK_ORDERED,
      status: 'open',
      order: drinkOrders,
      guestId: userId
    });
  }
  // TODO: WebSocket
  res.json();
});

export default router;
