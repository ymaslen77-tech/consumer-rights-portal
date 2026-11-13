export type ContextualDraft = {
  title: string;
  legalGrounds: string;
  examples: string[];
};
export declare const CONTEXTUAL_DRAFTS: Record<string, ContextualDraft>;
export declare function getContextualDraft(situationSlug?: string, documentSlug?: string): ContextualDraft | null;
export declare function getContextualTitle(situationSlug: string | undefined, documentSlug: string, fallback: string): string;
