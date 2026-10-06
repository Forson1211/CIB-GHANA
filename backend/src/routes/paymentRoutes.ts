import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';

const router = Router();

router.get('/config', PaymentController.getConfig);
router.post('/initialize', PaymentController.initializePayment);
router.get('/verify/:reference', PaymentController.verifyPayment);
router.get('/verify', PaymentController.verifyPayment);
router.post('/verify', PaymentController.verifyPayment);
router.post('/status', PaymentController.verifyPayment);
router.post('/webhook', PaymentController.handleWebhook);

export default router;
