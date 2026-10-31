export type ClaimType = "pretrial_claim" | "state_notification" | "court_document";
export type DraftFields = {
  recipient: string; sender: string; address: string; contact: string;
  agreement: string; eventDate: string; description: string; request: string;
  evidence: string; claimAmount: string; counterpartyName: string; counterpartyAddress: string;
};
export function parseRubles(value: string): number | null;
export const REQUIRED_FIELDS: string[];
export function validateDraft(fields: Partial<DraftFields>, claimType: ClaimType): string[];
export function draftText(fields: DraftFields, meta:{title:string; legalBasis:string; claimType:ClaimType}): string;
