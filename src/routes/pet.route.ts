import express from 'express';
import * as pc from '../controllers/pet.controller';

const router = express.Router();

router.get('/', pc.getAllPets);
router.get('/:id', pc.getPet);
router.post('/', pc.createPet);
router.put('/:id', pc.modifyPet);
router.delete('/:id', pc.removePet);
router.get('/:id/pet', pc.getPetComments);
router.get('/:id/comment', pc.createPetComments);

export default router;
