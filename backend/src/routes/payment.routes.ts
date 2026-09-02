import { Router } from 'express';
import { checkoutSession, completeSimulatedPayment, uploadScreenshot } from '../controllers/payment.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const router = Router();

router.use(authenticateJWT);

router.post('/checkout', checkoutSession);
router.post('/complete', completeSimulatedPayment);
router.post('/upload-screenshot', upload.single('screenshot'), uploadScreenshot);

export default router;
