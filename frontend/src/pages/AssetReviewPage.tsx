import React, { useState, useEffect } from 'react';
import { 
  Upload, Image as ImageIcon, CheckCircle2, AlertTriangle, 
  Palette, Info, ArrowRight, ShieldCheck, Sparkles, Layers
} from 'lucide-react';
import api from '../api/client';
import { BrandProfile, AssetAnalysis } from '../types';
import { ScoreGauge } from '../components/ui/ScoreGauge';

export const AssetReviewPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [previousAssets, setPreviousAssets] = useState<AssetAnalysis[]>([]);

  useEffect(() => {
    api.get('/brands').then((res) => {
      setBrands(res.data);
      if (res.data.length > 0) setSelectedBrandId(res.data[0].id);
    });
    api.get('/assets').then((res) => {
      setPreviousAssets(res.data);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    if (selectedBrandId) formData.append('brand_id', selectedBrandId);

    try {
      const res = await api.post('/assets/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysisResult(res.data);
      setPreviousAssets(prev => [res.data.asset, ...prev]);
    } catch (err) {
      console.error('Failed to analyze image', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-inkloom-text tracking-tight">
          Visual Asset & Brand Color Review
        </h1>
        <p className="text-xs sm:text-sm text-inkloom-muted mt-1">
          Inspect marketing visuals, extract dominant color palettes, and benchmark against brand standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload & Preview Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-inkloom-border">
            <span className="text-xs font-bold text-inkloom-text">Upload Asset</span>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-inkloom-border text-xs font-semibold outline-none"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          <div className="relative border-2 border-dashed border-inkloom-border hover:border-inkloom-primary rounded-3xl p-6 text-center cursor-pointer transition-colors bg-inkloom-bg/30">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {previewUrl ? (
              <div className="space-y-2">
                <img
                  src={previewUrl}
                  alt="Asset Preview"
                  className="max-h-56 mx-auto rounded-2xl object-contain shadow-sm border border-inkloom-border"
                />
                <div className="text-xs font-bold text-inkloom-text">{file?.name}</div>
                <div className="text-[10px] text-inkloom-muted font-mono">
                  {((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB • Click to replace
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-inkloom-primary flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-inkloom-text">Choose an image or drop here</div>
                  <div className="text-[11px] text-inkloom-muted">PNG, JPG, WebP up to 15MB</div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!file || isUploading}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-inkloom-primary to-inkloom-secondary hover:from-inkloom-primaryHover hover:to-blue-600 shadow-glow-primary transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isUploading ? 'Extracting Pillow Palette...' : 'Analyze Visual Brand Match'}</span>
          </button>

          {/* Disclaimer regarding automated checks */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-inkloom-muted leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-inkloom-secondary flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-inkloom-text">Governance Capability:</strong> Automated checks measure genuine dominant pixel frequencies and Euclidean RGB delta distances against brand swatches. Logo clearspace verification remains a human review checkpoint.
            </span>
          </div>
        </div>

        {/* Analysis Results Panel */}
        <div className="lg:col-span-7 space-y-5">
          {analysisResult ? (
            <div className="space-y-5 animate-in fade-in">
              {/* Score header */}
              <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-inkloom-muted block">
                    Visual Brand Affinity
                  </span>
                  <div className="text-xl font-black text-inkloom-text mt-1">
                    {analysisResult.asset.brand_match_score}% Color Match
                  </div>
                  <p className="text-xs text-inkloom-muted mt-1 max-w-sm">
                    {analysisResult.summary}
                  </p>
                </div>
                <ScoreGauge score={analysisResult.asset.brand_match_score} size={96} />
              </div>

              {/* Dominant Palette Swatches */}
              <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft space-y-4">
                <h3 className="text-sm font-bold text-inkloom-text">Extracted Dominant Color Palette</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(analysisResult.asset.dominant_colors || []).map((c: any, i: number) => (
                    <div key={i} className="p-3 rounded-2xl border border-inkloom-border bg-inkloom-bg/40 space-y-2">
                      <div
                        className="w-full h-12 rounded-xl border border-black/10 shadow-sm"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="text-xs font-bold text-inkloom-text font-mono">{c.hex}</div>
                      <div className="text-[10px] text-inkloom-muted font-semibold">{c.percentage}% area</div>
                      {c.closest_brand_color && (
                        <div className="text-[10px] text-inkloom-primary font-bold truncate">
                          Near: {c.closest_brand_color}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dimensions & Quality Check */}
              <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft space-y-3">
                <h3 className="text-sm font-bold text-inkloom-text">Dimensional & Display Standards</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-inkloom-bg/60">
                    <div className="text-[10px] uppercase font-bold text-inkloom-muted">Resolution</div>
                    <div className="text-sm font-extrabold text-inkloom-text">
                      {analysisResult.asset.width} × {analysisResult.asset.height} px
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-inkloom-bg/60">
                    <div className="text-[10px] uppercase font-bold text-inkloom-muted">Aspect Ratio</div>
                    <div className="text-sm font-extrabold text-inkloom-text">
                      {analysisResult.asset.aspect_ratio}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-inkloom-bg/60">
                    <div className="text-[10px] uppercase font-bold text-inkloom-muted">Alt Text Check</div>
                    <div className="text-xs font-bold text-inkloom-error">Missing Tag</div>
                  </div>
                </div>

                {analysisResult.warnings?.length > 0 && (
                  <div className="pt-2 space-y-1">
                    {analysisResult.warnings.map((w: string, i: number) => (
                      <div key={i} className="text-xs text-inkloom-error flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-inkloom-border text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-inkloom-primary flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-inkloom-text">No image analyzed yet</div>
              <p className="text-xs text-inkloom-muted max-w-sm mx-auto">
                Upload a brand visual or campaign diagram to inspect genuine pixel color frequencies and brand palette adherence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
