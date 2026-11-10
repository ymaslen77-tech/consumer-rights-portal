export type ClaimType = "pretrial_claim" | "state_notification" | "court_document";
export type DraftFields = {
  recipient: string; sender: string; address: string; contact: string;
  agreement: string; eventDate: string; description: string; request: string;
  evidence: string; claimAmount: string; counterpartyName: string; counterpartyAddress: string;
 courtBirth:string; courtIdentifier:string; courtNotices:string; courtPretrial:string;courtCalculation:string;courtFee:string;
};
export function parseRubles(value: string): number | null;
export function getRecipientPrompt(meta:{slug?:string;recipient?:string;claimType:ClaimType;topicSlug?:string;situationSlug?:string}):{label:string;hint:string};
export function getDocumentLegalGrounds(legalBasis:string,situationSlug?:string,documentSlug?:string):string;
export const REQUIRED_FIELDS: string[];
export function validateDraft(fields: Partial<DraftFields>, claimType: ClaimType): string[];
export function draftText(fields: DraftFields, meta:{title:string; legalBasis:string; claimType:ClaimType; contextTitle?:string;
 legalRisk?:string; legalLinks?:Array<{title:string;url:string}>}): string;
