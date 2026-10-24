import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, Info, 
  Send, RefreshCw, Check, X, FileText, ChevronRight, Layers, ArrowRight, CornerDownRight, BookOpen
} from 'lucide-react';
import api from '../api/client';
import { BrandProfile, ContentItem, ContentType, ReviewIssue, IssueSeverity, ReviewSession } from '../types';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

export const ReviewStudioPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryContentId = searchParams.get('content_id');

  // State
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [contentId, setContentId] = useState<string>(queryContentId || '');
  const [title, setTitle] = useState('Introducing Luminary Cloud Mesh');
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [textContent, setTextContent] = useState('');
  const [versionNumber, setVersionNumber] = useState<number>(1);
  const [currentScore, setCurrentScore] = useState<number>(100);

  // Review states
  const [issues, setIssues] = useState<ReviewIssue[]>([]);
  const [reviewSummary, setReviewSummary] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [activeDismissModal, setActiveDismissModal] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState<string>('');

  // Approval submit modal
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [approvalNotes, setApprovalNotes] = useState<string>('All critical brand issues resolved. Submitting for sign-off.');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Fetch brand profiles and content if query param exists
  useEffect(() => {
    const init = async () => {
      try {
        const brandsRes = await api.get('/brands');
        setBrands(brandsRes.data);
        if (brandsRes.data.length > 0 && !selectedBrandId) {
          setSelectedBrandId(brandsRes.data[0].id);
        }

        if (queryContentId) {
          const contentRes = await api.get(`/content/${queryContentId}`);
          const c: ContentItem = contentRes.data;
          setContentId(c.id);
          setTitle(c.title);
          setContentType(c.content_type);
          setSelectedBrandId(c.brand_id);
          setVersionNumber(c.current_version_number);
          setCurrentScore(c.latest_score);

          if (c.current_version) {
            setTextContent(c.current_version.text_content);
          }

          // Fetch latest review for this content
          const reviewsRes = await api.get(`/reviews?content_id=${c.id}`);
          if (reviewsRes.data.length > 0) {
            const latestRev: ReviewSession = reviewsRes.data[0];
            setIssues(latestRev.issues || []);
            setReviewSummary(latestRev.summary || '');
            setCurrentScore(latestRev.compliance_score);
          }
        } else {
          // Default sample content loaded for immediate testing
          loadDemoSample();
        }
      } catch (err) {
        console.error('Failed to load review studio data', err);
      }
    };
    init();
  }, [queryContentId]);

  const loadDemoSample = () => {
    setTitle('Introducing Luminary Cloud Mesh: The Future of Distributed Compute');
    setTextContent(`Today, we are thrilled to unveil Luminary Cloud Mesh, the world's best distributed computing infrastructure designed to crush the competition.

Obviously, traditional cloud architectures are obsolete. While legacy providers offer cheap solutions that fail under load, Luminary delivers 100% uptime with zero downtime across any multi-cloud cluster. 

Our engineering rockstar team founded in 2018 has built a platform proven to double your developer velocity with no risk. With over 2 million customers already onboarded, we offer 100% guaranteed reliability for all enterprise workloads.

Try our beta version today and experience the unbeatable speed of modern cloud intelligence.`);
  };

  const handleRunReview = async () => {
    if (!textContent.trim() || !selectedBrandId) return;
    setIsReviewing(true);

    try {
      let targetContentId = contentId;
      // 1. If content doesn't exist yet, create it
      if (!targetContentId) {
        const createRes = await api.post('/content', {
          title,
          content_type: contentType,
          brand_id: selectedBrandId,
          text_content: textContent,
        });
        targetContentId = createRes.data.id;
        setContentId(targetContentId);
        setVersionNumber(1);
      } else {
        // Update existing content with current text to create new version if text changed
        const updateRes = await api.patch(`/content/${targetContentId}`, {
          title,
          text_content: textContent,
          change_summary: 'Editor updates before review rerun'
        });
        setVersionNumber(updateRes.data.current_version_number);
      }

      // 2. Trigger review execution
      const reviewRes = await api.post('/reviews', {
        content_id: targetContentId,
      });

      const review: ReviewSession = reviewRes.data;
      setIssues(review.issues || []);
      setCurrentScore(review.compliance_score);
      setReviewSummary(review.summary || '');
    } catch (err) {
      console.error('Failed to run review', err);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleApplyFix = async (issue: ReviewIssue) => {
    try {
      const res = await api.post(`/reviews/issues/${issue.id}/apply-suggestion`);
      const { new_text_content, new_version_number } = res.data;

      // Update text in editor and version number
      setTextContent(new_text_content);
      setVersionNumber(new_version_number);

      // Update local issue status
      setIssues(prev =>
        prev.map(i => (i.id === issue.id ? { ...i, status: 'accepted' } : i))
      );

      // Re-calculate local score or rerun
      setTimeout(() => {
        handleRunReview();
      }, 300);
    } catch (err) {
      console.error('Error applying suggestion', err);
    }
  };

  const handleDismissIssue = async (issueId: string) => {
    try {
      await api.patch(`/reviews/issues/${issueId}`, {
        status: 'dismissed',
        dismissal_reason: dismissReason || 'Dismissed by reviewer discretion',
      });
      setIssues(prev =>
        prev.map(i => (i.id === issueId ? { ...i, status: 'dismissed', dismissal_reason: dismissReason } : i))
      );
      setActiveDismissModal(null);
      setDismissReason('');
    } catch (err) {
      console.error('Error dismissing issue', err);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!contentId) return;
    try {
      await api.post('/approvals', {
        content_id: contentId,
        notes: approvalNotes,
      });
      setShowApprovalModal(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit approval', err);
    }
  };

  const filteredIssues = issues.filter(i => {
    if (severityFilter === 'all') return true;
    return i.severity === severityFilter;
  });

  const openIssuesCount = issues.filter(i => i.status === 'open').length;

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-inkloom-border shadow-card-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-inkloom-primary/10 text-inkloom-primary border border-inkloom-primary/20">
              Review Studio
            </span>
            <span className="text-xs font-bold text-inkloom-muted">Version {versionNumber}</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl sm:text-2xl font-black text-inkloom-text bg-transparent border-0 outline-none w-full p-0 focus:ring-0"
            placeholder="Content title..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Brand profile selector */}
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-inkloom-border bg-inkloom-bg/50 text-xs font-bold text-inkloom-text outline-none"
          >
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name} Guidelines</option>
            ))}
          </select>

          {/* Content type */}
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="px-3 py-2 rounded-xl border border-inkloom-border bg-inkloom-bg/50 text-xs font-semibold text-inkloom-text outline-none uppercase"
          >
            <option value="blog">Blog Post</option>
            <option value="advertisement">Advertisement</option>
            <option value="social_post">Social Post</option>
            <option value="email">Marketing Email</option>
            <option value="landing_page">Landing Page</option>
            <option value="document">Documentation</option>
          </select>

          {/* Quick Demo Sample Loader */}
          <button
            type="button"
            onClick={loadDemoSample}
            className="px-3 py-2 rounded-xl border border-inkloom-border bg-white text-xs font-semibold text-inkloom-muted hover:text-inkloom-text hover:bg-inkloom-bg transition-colors"
            title="Load sample copy with intentional governance violations"
          >
            Load Sample
          </button>

          {/* Submit for Approval CTA */}
          <button
            type="button"
            onClick={() => setShowApprovalModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-inkloom-primary bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Approval</span>
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-inkloom-success text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Version {versionNumber} successfully submitted to the approval queue for stakeholder review!</span>
        </div>
      )}

      {/* Split Pane Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Content Editor */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-inkloom-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-inkloom-text">Editor Canvas</span>
              <span className="text-[11px] text-inkloom-muted font-mono">
                {textContent.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunReview}
                disabled={isReviewing || !textContent.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-inkloom-primary to-inkloom-secondary hover:from-inkloom-primaryHover hover:to-blue-600 shadow-glow-primary transition-all flex items-center gap-2 group"
              >
                <Sparkles className={`w-4 h-4 ${isReviewing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                <span>{isReviewing ? 'Auditing Guidelines...' : 'Run Brand Review'}</span>
              </button>
            </div>
          </div>

          {/* Fluid Progress indicator while auditing */}
          {isReviewing && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-inkloom-primary">
                <span>Deterministic rules & brand guidelines matching...</span>
                <span>In Progress</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-purple-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-inkloom-primary to-inkloom-secondary rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Editable Textarea */}
          <div className="relative">
            <textarea
              rows={16}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste or write your campaign, blog, advertisement, or documentation copy here..."
              className="w-full p-4 rounded-2xl border border-inkloom-border bg-inkloom-bg/30 text-sm leading-relaxed text-inkloom-text font-normal focus:bg-white focus:ring-2 focus:ring-inkloom-primary/20 focus:border-inkloom-primary outline-none transition-all resize-y"
            />
          </div>

          {/* Flagged items highlighting chips */}
          {issues.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-inkloom-bg/80 border border-inkloom-border space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-inkloom-muted block">
                Detected Excerpt Tags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {issues.map((iss, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                      iss.status === 'accepted'
                        ? 'bg-emerald-50 text-inkloom-success border-emerald-200 line-through'
                        : iss.status === 'dismissed'
                        ? 'bg-slate-100 text-inkloom-muted border-slate-200'
                        : iss.severity === 'critical'
                        ? 'bg-red-50 text-inkloom-error border-red-200 font-bold'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    "{iss.excerpt}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Compliance Score & Issue Cards */}
        <div className="lg:col-span-5 space-y-5">
          {/* Score Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-inkloom-muted block">
                Brand Compliance Score
              </span>
              <div className="text-xl font-black text-inkloom-text mt-1">
                {openIssuesCount === 0 ? '100% Compliant' : `${openIssuesCount} Issues Flagged`}
              </div>
              <p className="text-xs text-inkloom-muted mt-1 max-w-xs leading-relaxed">
                {reviewSummary || 'Audit against selected brand profile.'}
              </p>
            </div>

            <ScoreGauge score={currentScore} size={96} />
          </div>

          {/* Severity Filters */}
          <div className="bg-white rounded-2xl p-2.5 border border-inkloom-border shadow-card-soft flex items-center justify-between text-xs font-semibold overflow-x-auto gap-1">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                severityFilter === 'all' ? 'bg-inkloom-primary text-white font-bold' : 'text-inkloom-muted hover:text-inkloom-text'
              }`}
            >
              All ({issues.length})
            </button>
            <button
              onClick={() => setSeverityFilter('critical')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                severityFilter === 'critical' ? 'bg-red-500 text-white font-bold' : 'text-inkloom-error hover:bg-red-50'
              }`}
            >
              Critical ({issues.filter(i => i.severity === 'critical').length})
            </button>
            <button
              onClick={() => setSeverityFilter('high')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                severityFilter === 'high' ? 'bg-amber-500 text-white font-bold' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              High ({issues.filter(i => i.severity === 'high').length})
            </button>
            <button
              onClick={() => setSeverityFilter('medium')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                severityFilter === 'medium' ? 'bg-blue-500 text-white font-bold' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              Medium ({issues.filter(i => i.severity === 'medium').length})
            </button>
          </div>

          {/* Issues List */}
          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {issues.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-inkloom-border text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-inkloom-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-inkloom-text">No issues detected</div>
                <p className="text-xs text-inkloom-muted">
                  Click <span className="font-semibold text-inkloom-primary">"Run Brand Review"</span> or load the demo copy to evaluate compliance.
                </p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-xs text-inkloom-muted">
                No issues match this severity filter.
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`bg-white rounded-3xl p-5 border shadow-card-soft transition-all space-y-3 ${
                    issue.status === 'accepted'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : issue.status === 'dismissed'
                      ? 'border-slate-200 opacity-60'
                      : issue.severity === 'critical'
                      ? 'border-red-200 hover:border-red-300'
                      : 'border-inkloom-border hover:border-purple-200'
                  }`}
                >
                  {/* Top issue metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={issue.severity}>{issue.severity.toUpperCase()}</Badge>
                      <span className="text-[10px] font-mono text-inkloom-muted">
                        {issue.rule_id}
                      </span>
                    </div>

                    {issue.status === 'accepted' ? (
                      <span className="text-[11px] font-bold text-inkloom-success flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Resolved
                      </span>
                    ) : issue.status === 'dismissed' ? (
                      <span className="text-[11px] font-medium text-inkloom-muted">
                        Dismissed
                      </span>
                    ) : null}
                  </div>

                  {/* Flagged excerpt */}
                  <div className="p-2.5 rounded-xl bg-inkloom-bg/80 border border-inkloom-border font-mono text-xs text-inkloom-text font-semibold flex items-center gap-2">
                    <span className="text-inkloom-error font-bold">"{issue.excerpt}"</span>
                  </div>

                  {/* Human-readable explanation */}
                  <p className="text-xs text-inkloom-text leading-relaxed">
                    {issue.explanation}
                  </p>

                  {/* Guideline Citation */}
                  {issue.guideline_reference && (
                    <div className="text-[11px] text-inkloom-muted flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-inkloom-primary flex-shrink-0" />
                      <span>{issue.guideline_reference}</span>
                    </div>
                  )}

                  {/* Suggested fix and action button */}
                  {issue.suggested_correction && issue.status === 'open' && (
                    <div className="pt-2 border-t border-inkloom-border/60 flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="text-[10px] uppercase font-bold text-inkloom-muted block">
                          Suggested Replacement:
                        </span>
                        <span className="font-semibold text-inkloom-success">
                          "{issue.suggested_correction}"
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveDismissModal(issue.id)}
                          className="px-2.5 py-1.5 rounded-xl border border-inkloom-border text-[11px] font-semibold text-inkloom-muted hover:text-inkloom-text hover:bg-inkloom-bg"
                        >
                          Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFix(issue)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-inkloom-primary to-indigo-600 hover:from-inkloom-primaryHover hover:to-indigo-700 shadow-sm flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply Fix</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dismiss reason display if dismissed */}
                  {issue.status === 'dismissed' && issue.dismissal_reason && (
                    <div className="text-[11px] text-inkloom-muted italic">
                      Reason: "{issue.dismissal_reason}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dismiss Reason Modal */}
      {activeDismissModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-inkloom-border space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-inkloom-text">Dismiss Flagged Item</h3>
            <p className="text-xs text-inkloom-muted">
              Document reason for audit trail. Approvers will inspect this rationale during review sign-off.
            </p>
            <textarea
              rows={3}
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="e.g. Legal indemnity already secured for this campaign."
              className="w-full p-3 rounded-xl border border-inkloom-border text-xs outline-none focus:border-inkloom-primary"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveDismissModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-inkloom-muted hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDismissIssue(activeDismissModal)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-inkloom-primary hover:bg-inkloom-primaryHover"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Submit Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-inkloom-border space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-inkloom-primary flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-inkloom-text">Submit for Human Sign-off</h3>
            </div>
            <p className="text-xs text-inkloom-muted leading-relaxed">
              Submitting <span className="font-bold text-inkloom-text">{title} (Version {versionNumber})</span> to the organization approval queue. Approvers will verify guidelines adherence before final sign-off.
            </p>

            <div>
              <label className="block text-xs font-bold text-inkloom-text mb-1">
                Notes for the Approver
              </label>
              <textarea
                rows={3}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-inkloom-border text-xs outline-none focus:border-inkloom-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-inkloom-muted hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForApproval}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-inkloom-primary to-inkloom-secondary hover:from-inkloom-primaryHover hover:to-blue-600 shadow-glow-primary"
              >
                Submit Approval Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
