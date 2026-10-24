import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, CheckCircle2, XCircle, AlertCircle, Clock, 
  MessageSquare, User, ArrowRight, Shield, Send, Check
} from 'lucide-react';
import api from '../api/client';
import { ApprovalRequest, ContentComment, ContentStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

export const ApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const canUserApprove = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'approver';

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/approvals');
      setApprovals(res.data);
      if (res.data.length > 0 && !selectedApproval) {
        setSelectedApproval(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching approvals', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (contentId: string) => {
    try {
      const res = await api.get(`/content/${contentId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  useEffect(() => {
    if (selectedApproval) {
      fetchComments(selectedApproval.content_id);
    }
  }, [selectedApproval]);

  const handleDecision = async (action: 'approve' | 'request-changes' | 'reject') => {
    if (!selectedApproval) return;
    try {
      await api.post(`/approvals/${selectedApproval.id}/${action}`, {
        decision_notes: decisionNotes,
      });
      setActionSuccess(`Content has been successfully marked as ${action.replace('-', ' ')}.`);
      setTimeout(() => setActionSuccess(null), 3000);
      setDecisionNotes('');
      fetchApprovals();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Operation not permitted.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedApproval) return;
    try {
      const res = await api.post(`/content/${selectedApproval.content_id}/comments`, {
        message: newComment,
      });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const filtered = approvals.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-inkloom-text tracking-tight">
            Human Governance & Approval Queue
          </h1>
          <p className="text-xs sm:text-sm text-inkloom-muted mt-1">
            Review submitted drafts, verify brand policy adherence, and authorize final sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!canUserApprove && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Sign-off requires Approver or Manager role</span>
            </div>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-inkloom-success text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-inkloom-border pb-2 text-xs font-bold overflow-x-auto">
        {['all', 'in_review', 'approved', 'changes_requested', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
              filterStatus === st
                ? 'bg-inkloom-primary text-white shadow-sm'
                : 'text-inkloom-muted hover:text-inkloom-text hover:bg-white'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Two Column Layout: Approval List on Left, Active Decision on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column list */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-inkloom-border text-center text-xs text-inkloom-muted">
              No approval requests match this filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedApproval(item)}
                className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                  selectedApproval?.id === item.id
                    ? 'bg-white border-inkloom-primary shadow-card-hover ring-2 ring-inkloom-primary/20'
                    : 'bg-white/80 border-inkloom-border hover:bg-white hover:border-inkloom-primary/40 shadow-card-soft'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-xs font-bold text-inkloom-text line-clamp-1">
                    {item.content_title}
                  </h3>
                  <Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge>
                </div>

                <div className="text-[11px] text-inkloom-muted line-clamp-2 leading-relaxed mb-3">
                  {item.decision_notes || 'No notes attached.'}
                </div>

                <div className="flex items-center justify-between text-[10px] text-inkloom-muted pt-2 border-t border-inkloom-border/50">
                  <span>Version {item.requested_version_number || '1'}</span>
                  <span>Requested by {item.requester_name || 'Team member'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right column: Inspector & Decision Console */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft space-y-6">
          {selectedApproval ? (
            <>
              <div className="space-y-1 pb-4 border-b border-inkloom-border">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedApproval.status}>
                    {selectedApproval.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs font-bold text-inkloom-muted">
                    Version {selectedApproval.requested_version_number}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-inkloom-text">{selectedApproval.content_title}</h2>
                <div className="text-xs text-inkloom-muted">
                  Submitted by <strong className="text-inkloom-text">{selectedApproval.requester_name}</strong> on {new Date(selectedApproval.requested_at).toLocaleDateString()}
                </div>
              </div>

              {/* Submitted notes */}
              <div className="p-4 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-inkloom-muted">
                  Requester Justification
                </span>
                <p className="text-xs text-inkloom-text leading-relaxed">
                  {selectedApproval.decision_notes || 'Submitted for brand compliance review.'}
                </p>
              </div>

              {/* Decision Actions (if pending) */}
              <div className="p-5 rounded-2xl border border-inkloom-border bg-white shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-inkloom-text">Sign-off Decision</span>
                  {selectedApproval.reviewer_name && (
                    <span className="text-[11px] text-inkloom-muted">
                      Reviewer: {selectedApproval.reviewer_name}
                    </span>
                  )}
                </div>

                <textarea
                  rows={2}
                  disabled={!canUserApprove}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder={canUserApprove ? "Add sign-off notes or required revisions feedback..." : "Only Approvers can record decisions."}
                  className="w-full p-3 rounded-xl border border-inkloom-border text-xs outline-none focus:border-inkloom-primary"
                />

                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={!canUserApprove}
                    onClick={() => handleDecision('reject')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-inkloom-error hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-40"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={!canUserApprove}
                    onClick={() => handleDecision('request-changes')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors disabled:opacity-40"
                  >
                    Request Revisions
                  </button>

                  <button
                    type="button"
                    disabled={!canUserApprove}
                    onClick={() => handleDecision('approve')}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm transition-all disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve for Publication</span>
                  </button>
                </div>
              </div>

              {/* Collaboration Comments Thread */}
              <div className="space-y-4 pt-4 border-t border-inkloom-border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-inkloom-primary" />
                  <span className="text-xs font-bold text-inkloom-text">
                    Collaboration History ({comments.length})
                  </span>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <div className="text-xs text-inkloom-muted italic">No comments yet.</div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="p-3 rounded-2xl bg-inkloom-bg/50 border border-inkloom-border/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-inkloom-text">{c.user_name}</span>
                          <span className="text-[10px] text-inkloom-muted">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-inkloom-muted leading-relaxed">{c.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a message to the team..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-inkloom-border text-xs outline-none focus:border-inkloom-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-inkloom-primary hover:bg-inkloom-primaryHover"
                  >
                    Post
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs text-inkloom-muted">
              Select an item from the queue to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
