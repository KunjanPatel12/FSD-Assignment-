import mongoose from 'mongoose';

const supplementItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['protein', 'creatine', 'pre_workout', 'recovery', 'micronutrients'],
      index: true,
    },
    estimatedPriceMin: {
      type: Number,
      required: true,
      default: 0,
    },
    estimatedPriceMax: {
      type: Number,
      required: true,
      default: 0,
    },
    purpose: {
      type: String,
      required: true,
    },
    usageGuidance: {
      type: String,
      required: true,
    },
    foodAlternatives: [{ type: String }],
    allergenInfo: [{ type: String }],
    isIllustrative: {
      type: Boolean,
      default: true,
    },
    educationalDisclaimer: {
      type: String,
      default:
        'Educational reference only. Estimated market pricing is illustrative. Consult a registered dietitian or healthcare provider before introducing new dietary supplements.',
    },
  },
  {
    timestamps: true,
  }
);

export const SupplementItem = mongoose.model('SupplementItem', supplementItemSchema);
