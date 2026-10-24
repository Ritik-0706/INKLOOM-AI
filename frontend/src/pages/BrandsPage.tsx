import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit3, Trash2, Shield, Palette, FileText, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import { BrandProfile } from '../types';

export const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-inkloom-text tracking-tight">
            Brand Governance Guidelines
          </h1>
          <p className="text-xs sm:text-sm text-inkloom-muted mt-1">
            Manage your organization's approved tone, terminology, facts, and color rules.
          </p>
        </div>

        <Link
          to="/brands/new"
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-inkloom-primary to-inkloom-secondary hover:from-inkloom-primaryHover hover:to-blue-600 shadow-glow-primary transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Brand Profile</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-inkloom-primary bg-inkloom-primary/10 px-2 py-0.5 rounded-md">
                    {brand.industry || 'Enterprise'}
                  </span>
                  <h2 className="text-xl font-bold text-inkloom-text mt-1.5">{brand.name}</h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-inkloom-muted border border-slate-200">
                  v{brand.version}
                </span>
              </div>

              <p className="text-xs text-inkloom-muted line-clamp-2 leading-relaxed mb-4">
                {brand.description || brand.tone_voice}
              </p>

              {/* Color swatches preview */}
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-inkloom-muted block mb-1.5">
                  Brand Color Palette
                </span>
                <div className="flex items-center gap-2">
                  {(brand.brand_colors || []).map((c, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-lg border border-black/10 shadow-sm flex items-center justify-center text-[9px] font-bold text-white relative group"
                      style={{ backgroundColor: c.hex }}
                      title={`${c.name} (${c.hex})`}
                    />
                  ))}
                </div>
              </div>

              {/* Rules summary pills */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-inkloom-border/60 text-center">
                <div className="p-2 rounded-xl bg-inkloom-bg/60">
                  <div className="text-[10px] uppercase font-bold text-inkloom-muted">Prohibited</div>
                  <div className="text-xs font-extrabold text-inkloom-error">
                    {(brand.prohibited_terms || []).length} terms
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-inkloom-bg/60">
                  <div className="text-[10px] uppercase font-bold text-inkloom-muted">Verified Facts</div>
                  <div className="text-xs font-extrabold text-inkloom-secondary">
                    {(brand.approved_facts || []).length} claims
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-inkloom-bg/60">
                  <div className="text-[10px] uppercase font-bold text-inkloom-muted">Preferred</div>
                  <div className="text-xs font-extrabold text-inkloom-highlight">
                    {(brand.preferred_terms || []).length} rules
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-inkloom-border flex items-center justify-between">
              <Link
                to={`/studio?brand_id=${brand.id}`}
                className="text-xs font-bold text-inkloom-muted hover:text-inkloom-text flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Test in Studio</span>
              </Link>

              <Link
                to={`/brands/${brand.id}`}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-inkloom-primary hover:bg-inkloom-primary/10 transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Guidelines</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
