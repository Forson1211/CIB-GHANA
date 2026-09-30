import { Router } from 'express';
import { RegistrationController } from '../controllers/registrationController.js';

const router = Router();

router.get('/', RegistrationController.getAllRegistrations);
router.post('/', RegistrationController.createRegistration);
router.post('/send-email', RegistrationController.sendEmailDirect);
router.get('/:identifier', RegistrationController.getRegistration);
router.post('/:identifier/resend-confirmation', RegistrationController.resendConfirmation);

export default router;
