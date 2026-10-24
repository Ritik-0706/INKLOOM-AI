export type UserRole = 'admin' | 'manager' | 'approver' | 'creator';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  title?: string;
  avatar_url?: string;
  organization_id: string;
  is_active: boolean;
  created_at: string;
}

export interface BrandColor {
  name: string;
  hex: string;
  type?: 'primary' | 'secondary' | 'accent' | 'highlight' | 'text';
}

export interface ToneRule {
  rule: string;
  description: string;
}

export interface PreferredTerm {
  term: string;
  replaces: string[];
  rationale: string;
}

export interface ProhibitedTerm {
  term: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  suggestion: string;
}

export interface ApprovedFact {
  id: string;
  topic?: string;
  claim: string;
  source: string;
  category?: string;
  contradiction_triggers?: string[];
}

export interface BrandProfile {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  version: number;
  is_active: boolean;
  tone_voice?: string;
  tone_rules?: ToneRule[];
  preferred_terms?: PreferredTerm[];
  prohibited_terms?: ProhibitedTerm[];
  approved_facts?: ApprovedFact[];
  brand_colors?: BrandColor[];
  typography?: {
    headings?: string;
    body?: string;
    min_font_size?: number;
  };
  logo_guidelines?: string;
  logo_url?: string;
  content_restrictions?: string[];
  accessibility_reqs?: string[];
  required_disclaimers?: Array<{ name: string; keyword: string; required_disclaimer: string }>;
  created_at: string;
  updated_at: string;
}

export type ContentStatus = 'draft' | 'in_review' | 'changes_requested' | 'approved' | 'rejected' | 'archived';
export type ContentType = 'blog' | 'advertisement' | 'social_post' | 'email' | 'landing_page' | 'document' | 'image';

export interface ContentVersion {
  id: string;
  content_id: string;
  version_number: number;
  text_content: string;
  visual_asset_url?: string;
  change_summary?: string;
  created_by_id?: string;
  created_at: string;
}

export interface ContentItem {
  id: string;
  organization_id: string;
  brand_id: string;
  creator_id?: string;
  title: string;
  content_type: ContentType;
  status: ContentStatus;
  current_version_number: number;
  latest_score: number;
  created_at: string;
  updated_at: string;
  current_version?: ContentVersion;
  versions?: ContentVersion[];
}

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type IssueCategory =
  | 'tone_of_voice'
  | 'terminology'
  | 'messaging'
  | 'factual_accuracy'
  | 'unsupported_claims'
  | 'visual_consistency'
  | 'accessibility'
  | 'policy_violations';

export interface ReviewIssue {
  id: string;
  review_id: string;
  rule_id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  excerpt: string;
  start_pos: number;
  end_pos: number;
  explanation: string;
  guideline_reference?: string;
  suggested_correction?: string;
  confidence: number;
  status: 'open' | 'accepted' | 'dismissed' | 'resolved';
  dismissal_reason?: string;
  created_at: string;
}

export interface ReviewSession {
  id: string;
  organization_id: string;
  content_id: string;
  content_version_id: string;
  brand_id: string;
  compliance_score: number;
  engine_type: string;
  status: string;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  summary?: string;
  created_at: string;
  issues: ReviewIssue[];
}

export interface ApprovalRequest {
  id: string;
  organization_id: string;
  content_id: string;
  content_version_id: string;
  requester_id?: string;
  reviewer_id?: string;
  status: ContentStatus;
  decision_notes?: string;
  requested_version_number?: string;
  is_superseded: boolean;
  requested_at: string;
  decided_at?: string;
  content_title?: string;
  content_type?: string;
  requester_name?: string;
  reviewer_name?: string;
}

export interface ContentComment {
  id: string;
  content_id: string;
  user_id?: string;
  user_name?: string;
  user_avatar?: string;
  user_role?: string;
  message: string;
  parent_id?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface DominantColor {
  hex: string;
  percentage: number;
  rgb: number[];
  closest_brand_color?: string;
  delta_e?: number;
  is_brand_compliant?: boolean;
}

export interface AssetAnalysis {
  id: string;
  filename: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  width: number;
  height: number;
  aspect_ratio: string;
  dominant_colors: DominantColor[];
  brand_match_score: number;
  checks_result: any;
  created_at: string;
}

export interface AnalyticsData {
  total_reviewed: number;
  pending_approvals: number;
  critical_issues: number;
  average_compliance_score: number;
  first_pass_approval_rate: number;
  turnaround_time_hours: number;
  categories_breakdown: Array<{
    category: string;
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  severities_breakdown: Array<{
    severity: string;
    count: number;
    color: string;
  }>;
  trends: Array<{
    date: string;
    score: number;
    review_count: number;
  }>;
  frequent_mistakes: Array<{
    phrase: string;
    occurrences: number;
    rule_id: string;
    suggestion: string;
  }>;
}
