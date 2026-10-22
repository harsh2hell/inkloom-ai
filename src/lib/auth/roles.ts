import { Role } from "@prisma/client";

export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string;
  avatarUrl?: string | null;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Checks if a user is permitted to approve a specific content version.
 * Rule: Creators cannot approve their own content.
 * Only Brand Admins can approve content, provided they did not author it.
 */
export function canApproveContent(
  user: UserContext,
  submitterId: string
): PermissionCheckResult {
  if (user.role === Role.AUDITOR) {
    return {
      allowed: false,
      reason: "Auditor role has read-only permissions and cannot approve content.",
    };
  }

  if (user.role === Role.AGENCY_CREATOR || user.role === Role.EXTERNAL_CREATOR) {
    return {
      allowed: false,
      reason: "Creators cannot approve content. Only an authorized Brand Admin/Reviewer may approve.",
    };
  }

  if (user.id === submitterId) {
    return {
      allowed: false,
      reason: "Policy violation: Creators/submitters cannot approve their own content.",
    };
  }

  if (user.role === Role.BRAND_ADMIN) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "Unauthorized role for content approval.",
  };
}

/**
 * Checks if a user can override findings or resolve pending policy exceptions.
 * Only Brand Admins can perform overrides.
 */
export function canOverrideFindings(user: UserContext): PermissionCheckResult {
  if (user.role === Role.BRAND_ADMIN) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "Only authorized Brand Reviewers (Brand Admin) can override policy findings.",
  };
}

/**
 * Checks if a user can generate a creator brief from approved content.
 */
export function canGenerateBrief(user: UserContext): PermissionCheckResult {
  if (user.role === Role.BRAND_ADMIN || user.role === Role.AGENCY_CREATOR) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "External Creators and Auditors cannot generate creator briefs.",
  };
}

/**
 * Checks if a user can submit adapted final content for a brief.
 */
export function canSubmitCreatorContent(user: UserContext): PermissionCheckResult {
  if (user.role === Role.EXTERNAL_CREATOR || user.role === Role.AGENCY_CREATOR) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "Only creators can submit final adaptations against a brief.",
  };
}
