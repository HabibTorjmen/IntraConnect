// charge.docx §4.7 — fixed taxonomy
export const COMPANY_CATEGORIES = [
  'POLICIES',
  'EMPLOYEE_HANDBOOK',
  'SAFETY_GUIDELINES',
  'QUALITY_STANDARDS',
  'FORMS_TEMPLATES',
  'TRAINING_MATERIALS',
  'COMPANY_ANNOUNCEMENTS',
  'CERTIFICATES_LICENSES',
] as const;

export const EMPLOYEE_CATEGORIES = [
  'EMPLOYMENT_CONTRACTS',
  'ID_DOCUMENTS',
  'EDUCATIONAL_CERTIFICATES',
  'MEDICAL_RECORDS',
  'PERFORMANCE_REVIEWS',
  'DISCIPLINARY_RECORDS',
] as const;

export const COMPANY_CATEGORIES_SET = new Set<string>(COMPANY_CATEGORIES);
export const EMPLOYEE_CATEGORIES_SET = new Set<string>(EMPLOYEE_CATEGORIES);

export type DocumentType = 'company' | 'personal';

export function validateCategory(type: DocumentType, category?: string): void {
  if (!category) return;
  const ok =
    type === 'company'
      ? COMPANY_CATEGORIES_SET.has(category)
      : EMPLOYEE_CATEGORIES_SET.has(category);
  if (!ok) {
    throw new Error(
      `Invalid category "${category}" for type "${type}" (charge.docx §4.7).`,
    );
  }
}
