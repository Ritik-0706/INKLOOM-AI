import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, CheckCircle2, ShieldAlert, 
  HelpCircle, Sparkles, BookOpen, Layers
} from 'lucide-react';
import api from '../api/client';
import { BrandProfile, ProhibitedTerm, PreferredTerm, ApprovedFact, BrandColor } from '../types';

export const BrandEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Enterprise Cloud & AI');
  const [description, setDescription] = useState('');
  const [toneVoice, setToneVoice] = useState('Authoritative, optimistic, consultative, and accessible.');
  const [activeTab, setActiveTab] = useState<'voice' | 'prohibited' | 'preferred' | 'facts' | 'colors' | 'disclaimers'>('voice');

  const [prohibitedTerms, setProhibitedTerms] = useState<ProhibitedTerm[]>([]);
  const [preferredTerms, setPreferredTerms] = useState<PreferredTerm[]>([]);
  const [approvedFacts, setApprovedFacts] = useState<ApprovedFact[]>([]);
  const [brandColors, setBrandColors] = useState<BrandColor[]>([]);
  const [disclaimers, setDisclaimers] = useState<Array<{ name: string; keyword: string; required_disclaimer: string }>>([]);

  const [newProhibited, setNewProhibited] = useState({ term: '', severity: 'medium' as any, reason: '', suggestion: '' });
  const [newPreferred, setNewPreferred] = useState({ term: '', replaces: '', rationale: '' });
  const [newFact, setNewFact] = useState({ id: '', claim: '', source: '', contradiction_triggers: '' });
  const [newColor, setNewColor] = useState({ name: '', hex: '#7657F6', type: 'primary' as any });
  const [newDisclaimer, setNewDisclaimer] = useState({ name: '', keyword: '', required_disclaimer: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      api.get(`/brands/${id}`).then((res) => {
        const b: BrandProfile = res.data;
        setName(b.name);
        setIndustry(b.industry || 'Technology');
        setDescription(b.description || '');
        setToneVoice(b.tone_voice || '');
        setProhibitedTerms(b.prohibited_terms || []);
        setPreferredTerms(b.preferred_terms || []);
        setApprovedFacts(b.approved_facts || []);
        setBrandColors(b.brand_colors || []);
        setDisclaimers(b.required_disclaimers || []);
      });
    }
  }, [id, isNew]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const payload = {
      name,
      industry,
      description,
      tone_voice: toneVoice,
      prohibited_terms: prohibitedTerms,
      preferred_terms: preferredTerms,
      approved_facts: approvedFacts,
      brand_colors: brandColors,
      required_disclaimers: disclaimers
    };

    try {
      if (isNew) {
        const res = await api.post('/brands', payload);
        navigate(`/brands/${res.data.id}`);
      } else {
        await api.patch(`/brands/${id}`, payload);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving brand profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  const addProhibited = () => {
    if (!newProhibited.term) return;
    setProhibitedTerms([...prohibitedTerms, { ...newProhibited }]);
    setNewProhibited({ term: '', severity: 'medium', reason: '', suggestion: '' });
  };

  const removeProhibited = (index: number) => {
    setProhibitedTerms(prohibitedTerms.filter((_, i) => i !== index));
  };

  const addPreferred = () => {
    if (!newPreferred.term) return;
    setPreferredTerms([
      ...preferredTerms,
      {
        term: newPreferred.term,
        replaces: newPreferred.replaces.split(',').map((s) => s.trim()).filter(Boolean),
        rationale: newPreferred.rationale
      }
    ]);
    setNewPreferred({ term: '', replaces: '', rationale: '' });
  };

  const removePreferred = (index: number) => {
    setPreferredTerms(preferredTerms.filter((_, i) => i !== index));
  };

  const addFact = () => {
    if (!newFact.claim) return;
    setApprovedFacts([
      ...approvedFacts,
      {
        id: newFact.id || `FACT-${approvedFacts.length + 1}`,
        claim: newFact.claim,
        source: newFact.source || 'Corporate Governance',
        contradiction_triggers: newFact.contradiction_triggers.split(',').map((s) => s.trim()).filter(Boolean)
      }
    ]);
    setNewFact({ id: '', claim: '', source: '', contradiction_triggers: '' });
  };

  const removeFact = (index: number) => {
    setApprovedFacts(approvedFacts.filter((_, i) => i !== index));
  };

  const addColor = () => {
    if (!newColor.name || !newColor.hex) return;
    setBrandColors([...brandColors, { ...newColor }]);
    setNewColor({ name: '', hex: '#478BFF', type: 'secondary' });
  };

  const removeColor = (index: number) => {
    setBrandColors(brandColors.filter((_, i) => i !== index));
  };

  const addDisclaimer = () => {
    if (!newDisclaimer.keyword || !newDisclaimer.required_disclaimer) return;
    setDisclaimers([...disclaimers, { ...newDisclaimer }]);
    setNewDisclaimer({ name: '', keyword: '', required_disclaimer: '' });
  };

  const removeDisclaimer = (index: number) => {
    setDisclaimers(disclaimers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top back bar & Save CTA */}
      <div className="flex items-center justify-between">
        <Link
          to="/brands"
          className="inline-flex items-center gap-2 text-xs font-bold text-inkloom-muted hover:text-inkloom-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Brand Profiles</span>
        </Link>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-inkloom-success flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !name}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-inkloom-primary to-inkloom-secondary hover:from-inkloom-primaryHover hover:to-blue-600 shadow-glow-primary transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : isNew ? 'Create Brand Profile' : 'Save Guidelines'}</span>
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-inkloom-border shadow-card-soft">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-inkloom-text mb-1">Brand Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luminary Cloud"
              className="w-full px-3.5 py-2.5 rounded-xl border border-inkloom-border bg-inkloom-bg/30 text-sm font-semibold outline-none focus:border-inkloom-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-inkloom-text mb-1">Industry / Sector</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Enterprise Cloud & AI"
              className="w-full px-3.5 py-2.5 rounded-xl border border-inkloom-border bg-inkloom-bg/30 text-sm outline-none focus:border-inkloom-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-inkloom-text mb-1">Brand Overview</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of brand mission and market positioning."
              className="w-full px-3.5 py-2.5 rounded-xl border border-inkloom-border bg-inkloom-bg/30 text-xs outline-none focus:border-inkloom-primary"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-inkloom-border space-x-2 sm:space-x-4 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'voice', label: 'Voice & Tone' },
            { id: 'prohibited', label: `Prohibited Terms (${prohibitedTerms.length})` },
            { id: 'preferred', label: `Preferred Lexicon (${preferredTerms.length})` },
            { id: 'facts', label: `Verified Facts (${approvedFacts.length})` },
            { id: 'colors', label: `Colors (${brandColors.length})` },
            { id: 'disclaimers', label: `Mandatory Disclaimers (${disclaimers.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-inkloom-primary/10 text-inkloom-primary border border-inkloom-primary/20'
                  : 'text-inkloom-muted hover:text-inkloom-text hover:bg-inkloom-bg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Voice & Tone */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-inkloom-text mb-1">
                Tone of Voice Narrative
              </label>
              <textarea
                rows={4}
                value={toneVoice}
                onChange={(e) => setToneVoice(e.target.value)}
                placeholder="Explain the brand's personality, reading level, and emotional qualities."
                className="w-full px-3.5 py-2.5 rounded-xl border border-inkloom-border bg-inkloom-bg/30 text-xs leading-relaxed outline-none focus:border-inkloom-primary"
              />
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-900 leading-relaxed">
              <span className="font-bold">Governance Rule:</span> Our deterministic review engine actively checks submitted text for condescending language (e.g. 'obviously', 'clearly everyone knows'), aggressive sales hype, and overused clichés that dilute this voice.
            </div>
          </div>
        )}

        {/* TAB 2: Prohibited Terms */}
        {activeTab === 'prohibited' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border space-y-3">
              <span className="text-xs font-bold text-inkloom-text block">Add Prohibited Term</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Prohibited term (e.g. cheap)"
                  value={newProhibited.term}
                  onChange={(e) => setNewProhibited({ ...newProhibited, term: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                />
                <select
                  value={newProhibited.severity}
                  onChange={(e) => setNewProhibited({ ...newProhibited, severity: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                >
                  <option value="critical">Critical (Blocks Publishing)</option>
                  <option value="high">High Severity</option>
                  <option value="medium">Medium Severity</option>
                  <option value="low">Low Warning</option>
                </select>
                <input
                  type="text"
                  placeholder="Reason / Guideline citation"
                  value={newProhibited.reason}
                  onChange={(e) => setNewProhibited({ ...newProhibited, reason: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Approved Replacement"
                    value={newProhibited.suggestion}
                    onChange={(e) => setNewProhibited({ ...newProhibited, suggestion: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={addProhibited}
                    className="px-3 py-2 rounded-xl bg-inkloom-primary text-white text-xs font-bold hover:bg-inkloom-primaryHover"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-inkloom-border/60">
              {prohibitedTerms.map((t, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-inkloom-error">"{t.term}"</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        {t.severity}
                      </span>
                    </div>
                    <div className="text-inkloom-muted text-[11px]">{t.reason}</div>
                    <div className="text-inkloom-success text-[11px]">Suggested replacement: "{t.suggestion}"</div>
                  </div>
                  <button
                    onClick={() => removeProhibited(idx)}
                    className="p-1.5 text-inkloom-muted hover:text-inkloom-error rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Preferred Terms */}
        {activeTab === 'preferred' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border space-y-3">
              <span className="text-xs font-bold text-inkloom-text block">Standardize Preferred Terminology</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Target Preferred Term (e.g. specialist)"
                  value={newPreferred.term}
                  onChange={(e) => setNewPreferred({ ...newPreferred, term: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Replaces comma-separated words (e.g. ninja, guru)"
                  value={newPreferred.replaces}
                  onChange={(e) => setNewPreferred({ ...newPreferred, replaces: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rationale"
                    value={newPreferred.rationale}
                    onChange={(e) => setNewPreferred({ ...newPreferred, rationale: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={addPreferred}
                    className="px-3 py-2 rounded-xl bg-inkloom-primary text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-inkloom-border/60">
              {preferredTerms.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-inkloom-text">
                      Preferred: <span className="text-inkloom-primary">"{p.term}"</span>
                    </div>
                    <div className="text-inkloom-muted text-[11px]">
                      Replaces: {p.replaces.map((r) => `"${r}"`).join(', ')}
                    </div>
                  </div>
                  <button
                    onClick={() => removePreferred(idx)}
                    className="p-1.5 text-inkloom-muted hover:text-inkloom-error rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Verified Facts */}
        {activeTab === 'facts' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border space-y-3">
              <span className="text-xs font-bold text-inkloom-text block">Add Verified Brand Fact / Factual Claim</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Approved claim (e.g. Luminary Cloud was founded in 2021 by distributed systems veterans.)"
                  value={newFact.claim}
                  onChange={(e) => setNewFact({ ...newFact, claim: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Verification Source (e.g. Master Services Agreement v4)"
                    value={newFact.source}
                    onChange={(e) => setNewFact({ ...newFact, source: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contradiction Triggers (e.g. founded in 2018, founded in 2019)"
                      value={newFact.contradiction_triggers}
                      onChange={(e) => setNewFact({ ...newFact, contradiction_triggers: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={addFact}
                      className="px-3 py-2 rounded-xl bg-inkloom-primary text-white text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-inkloom-border/60">
              {approvedFacts.map((f, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between text-xs gap-4">
                  <div>
                    <div className="font-bold text-inkloom-text">{f.claim}</div>
                    <div className="text-inkloom-muted text-[11px] mt-0.5">Source: {f.source}</div>
                    {f.contradiction_triggers && f.contradiction_triggers.length > 0 && (
                      <div className="text-red-600 text-[10px] mt-0.5 font-medium">
                        Flags when content states: {f.contradiction_triggers.map((c) => `"${c}"`).join(', ')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFact(idx)}
                    className="p-1.5 text-inkloom-muted hover:text-inkloom-error rounded-lg flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Brand Colors */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border space-y-3">
              <span className="text-xs font-bold text-inkloom-text block">Add Brand Color Swatch</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Color Name (e.g. Electric Violet)"
                  value={newColor.name}
                  onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColor.hex}
                    onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={newColor.hex}
                    onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none font-mono"
                  />
                </div>
                <select
                  value={newColor.type}
                  onChange={(e) => setNewColor({ ...newColor, type: e.target.value as any })}
                  className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                >
                  <option value="primary">Primary Swatch</option>
                  <option value="secondary">Secondary Swatch</option>
                  <option value="accent">Accent Glow</option>
                  <option value="highlight">Highlight</option>
                  <option value="text">Primary Text</option>
                </select>
                <button
                  type="button"
                  onClick={addColor}
                  className="px-3 py-2 rounded-xl bg-inkloom-primary text-white text-xs font-bold"
                >
                  Add Swatch
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {brandColors.map((c, idx) => (
                <div key={idx} className="p-3 rounded-2xl border border-inkloom-border bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl border border-black/10 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div>
                      <div className="text-xs font-bold text-inkloom-text">{c.name}</div>
                      <div className="text-[10px] font-mono text-inkloom-muted">{c.hex}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeColor(idx)}
                    className="p-1 text-inkloom-muted hover:text-inkloom-error rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: Mandatory Disclaimers */}
        {activeTab === 'disclaimers' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border space-y-3">
              <span className="text-xs font-bold text-inkloom-text block">Add Mandatory Disclosure Rule</span>
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Disclaimer Label (e.g. Beta Notice)"
                    value={newDisclaimer.name}
                    onChange={(e) => setNewDisclaimer({ ...newDisclaimer, name: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Trigger keyword (e.g. beta, early access, preview)"
                    value={newDisclaimer.keyword}
                    onChange={(e) => setNewDisclaimer({ ...newDisclaimer, keyword: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Required Disclaimer Text (e.g. Features subject to change prior to general availability.)"
                    value={newDisclaimer.required_disclaimer}
                    onChange={(e) => setNewDisclaimer({ ...newDisclaimer, required_disclaimer: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-inkloom-border text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={addDisclaimer}
                    className="px-3 py-2 rounded-xl bg-inkloom-primary text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-inkloom-border/60">
              {disclaimers.map((d, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between text-xs gap-4">
                  <div>
                    <div className="font-bold text-inkloom-text">
                      {d.name} <span className="font-normal text-inkloom-muted">(Trigger: "{d.keyword}")</span>
                    </div>
                    <div className="text-inkloom-primary text-[11px] mt-0.5">
                      Required text: "{d.required_disclaimer}"
                    </div>
                  </div>
                  <button
                    onClick={() => removeDisclaimer(idx)}
                    className="p-1.5 text-inkloom-muted hover:text-inkloom-error rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
