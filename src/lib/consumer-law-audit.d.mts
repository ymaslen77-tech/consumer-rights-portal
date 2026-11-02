export type VerifiedLaw={name:string;url:string};
export type LegalAudit={
 links:VerifiedLaw[];risk:string;reviewDate:string;eligibilityRequired:boolean;sources:VerifiedLaw[];
};
export const STATUTES:Record<string,VerifiedLaw>;
export function validateLegalReferenceMatrix(topics:string[],documents:string[]):boolean;
export function getLegalAudit(topic:string,docSlug:string,claimType:string):LegalAudit;