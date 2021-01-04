import express from 'express';
import * as cc from '@/controllers/comment.controller';

const router = express.Router();

router.put('/:id', cc.modifyComment);
router.delete('/:id', cc.removeComment);

export default router;
