import { SupplementItem } from '../models/SupplementItem.js';

export const getSupplements = async (req, res, next) => {
  try {
    const { category, maxBudget } = req.query;

    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (maxBudget && !isNaN(Number(maxBudget))) {
      query.estimatedPriceMin = { $lte: Number(maxBudget) };
    }

    const items = await SupplementItem.find(query).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
      disclaimer:
        'All prices and supplement listings are illustrative educational models. FitPulse does not prescribe supplements or claim necessity. Always consult a certified dietitian or physician.',
    });
  } catch (err) {
    next(err);
  }
};

export const createSupplement = async (req, res, next) => {
  try {
    const item = await SupplementItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

export const updateSupplement = async (req, res, next) => {
  try {
    const item = await SupplementItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Supplement item not found.' });
    }
    res.status(200).json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

export const deleteSupplement = async (req, res, next) => {
  try {
    const item = await SupplementItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Supplement item not found.' });
    }
    res.status(200).json({ success: true, message: 'Supplement removed from catalog.' });
  } catch (err) {
    next(err);
  }
};
