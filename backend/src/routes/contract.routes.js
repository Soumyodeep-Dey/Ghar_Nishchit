import express from 'express';
import { sendContract, getLandlordContracts, getTenantContracts, updateContractStatus } from '../controllers/contract.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { sendContractSchema } from '../validations/contract.validation.js';

const router = express.Router();

router.use(verifyToken);

router.post('/send', requireRole('landlord'), validate(sendContractSchema), sendContract);
router.get('/landlord', requireRole('landlord'), getLandlordContracts);
router.get('/tenant', requireRole('tenant'), getTenantContracts);
router.patch('/:id/status', requireRole('tenant'), updateContractStatus);

export default router;
