import express from 'express';
import userRoute from './user.route';
import petRoute from './pet.route';
import commentRoute from './comment.route';

const router = express.Router();

router.use('/user', userRoute);
router.use('/pet', petRoute);
router.use('/comment', commentRoute);

export default router;
