import express from 'express';
import { getDashboardData, deleteUser, deleteProperty, deleteContract } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/dashboard', getDashboardData);
router.delete('/user/:id', deleteUser);
router.delete('/property/:id', deleteProperty);
router.delete('/contract/:id', deleteContract);

export default router;
