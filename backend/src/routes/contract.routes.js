import express from 'express';
import { sendContract, getLandlordContracts, getTenantContracts, updateContractStatus } from '../controllers/contract.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { sendContractSchema } from '../validations/contract.validation.js';

const router = express.Router();

router.use(verifyToken);

router.post('/send', validate(sendContractSchema), sendContract);
router.get('/landlord', getLandlordContracts);
router.get('/tenant', getTenantContracts);
router.patch('/:id/status', updateContractStatus);

export default router;
