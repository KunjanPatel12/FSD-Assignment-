import express from 'express';
import {
  getSupplements,
  createSupplement,
  updateSupplement,
  deleteSupplement,
} from '../controllers/supplementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSupplements);

// Admin-managed supplement catalog
router.post('/', protect, authorize('admin'), createSupplement);
router.put('/:id', protect, authorize('admin'), updateSupplement);
router.delete('/:id', protect, authorize('admin'), deleteSupplement);

export default router;
