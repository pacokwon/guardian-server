import express from 'express';
import * as uc from '../controllers/user.controller';

const router = express.Router();

router.get('/', uc.getAllUsers);
router.get('/:id', uc.getUser);
router.post('/', uc.createUser);
router.put('/:id', uc.modifyUser);
router.delete('/:id', uc.removeUser);
router.get('/:id/pet', uc.getUserPets);
router.get('/:id/comment', uc.getUserComments);

export default router;
