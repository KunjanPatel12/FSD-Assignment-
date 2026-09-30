import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ShieldAlert,
  Utensils,
} from 'lucide-react';
import { supplementApi } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SupplementGuidePage = () => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState(4000);
  const [loading, setLoading] = useState(true);

  const fetchSupplements = async () => {
    setLoading(true);
    try {
      const res = await supplementApi.getAll({
        category: selectedCategory,
        maxBudget: budgetFilter,
      });
      setItems(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplements();
  }, [selectedCategory, budgetFilter]);

  const categories = ['all', 'protein', 'creatine', 'pre_workout', 'recovery', 'micronutrients'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Educational Nutrition & Supplementation Guide
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Supplement & Whole-Food Nutrition Guide
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Explore common fitness supplements with estimated illustrative pricing in Indian Rupees (INR), physiological purposes,
          usage guidelines, and whole food alternatives.
        </p>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-amber-950">Educational Reference Notice:</span> Supplement
          listings and estimated costs are for illustrative informational purposes. FitPulse does not
          prescribe supplements, suggest dosages, or imply that supplements are necessary for fitness
          progress. Always consult a certified healthcare professional or registered dietitian.
        </p>
      </div>

      {/* Filters Card */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Budget Slider */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
            <span className="text-xs text-slate-600 font-medium">Max Monthly Est.:</span>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(Number(e.target.value))}
              className="w-28 accent-emerald-600"
            />
            <span className="text-xs font-bold font-mono text-emerald-700 min-w-14">
              ₹{budgetFilter.toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <LoadingSpinner text="Loading supplement index..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <Card key={item._id} className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="emerald" size="sm" className="capitalize mb-1.5">
                      {item.category.replace('_', ' ')}
                    </Badge>
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-700 block">
                      ₹{item.estimatedPriceMin?.toLocaleString('en-IN')} - ₹{item.estimatedPriceMax?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">est. monthly cost</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Purpose & Function:
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.purpose}</p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    General Usage:
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.usageGuidance}</p>
                </div>

                {item.foodAlternatives?.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5" /> Whole Food Equivalent Sources:
                    </span>
                    <ul className="text-xs text-slate-700 list-disc list-inside space-y-0.5">
                      {item.foodAlternatives.map((food, i) => (
                        <li key={i}>{food}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {item.allergenInfo?.length > 0 && (
                <p className="text-[11px] text-slate-500 pt-2 border-t border-gray-100">
                  <span className="font-semibold text-slate-700">Allergen Notice:</span>{' '}
                  {item.allergenInfo.join(', ')}
                </p>
              )}
            </Card>
          ))}

          {items.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 text-xs">
              No items found matching the selected budget or category filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
