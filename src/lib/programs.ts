// DTI Programs and Courses - Central configuration file
// This ensures consistency across all forms, filters, and displays

export const DIPLOMA_PROGRAMS = [
  'Registered Nursing',
  'Midwifery',
  'Psychosocial Counselling (Diploma)',
] as const;

export const CERTIFICATE_PROGRAMS = [
  'Assistant Nursing',
  'Clinical Record Management',
  'Hospital Record Management',
  'Dental Health Care Assistant',
  'Psychosocial Counselling',
  'HIV/AIDS Management',
  'Health Care Assistant',
  'Pharmacy Assistant',
  'TB Management',
] as const;

// Combined list for dropdowns
export const ALL_PROGRAMS = [
  // Diploma Programs
  ...DIPLOMA_PROGRAMS,
  // Certificate Programs
  ...CERTIFICATE_PROGRAMS,
] as const;

// For filters with "All" option
export const PROGRAMS_WITH_ALL = ['All Programs', ...ALL_PROGRAMS] as const;

// Grouped programs for better organization in select dropdowns
export const GROUPED_PROGRAMS = {
  'Full-Time Diploma Courses': DIPLOMA_PROGRAMS,
  'Certificate Courses': CERTIFICATE_PROGRAMS,
} as const;

// Program metadata (duration info)
export const PROGRAM_DETAILS: Record<string, { duration: string; type: 'diploma' | 'certificate' }> = {
  'Registered Nursing': { duration: '3 Years', type: 'diploma' },
  'Midwifery': { duration: '3 Years', type: 'diploma' },
  'Psychosocial Counselling (Diploma)': { duration: '2 Years', type: 'diploma' },
  'Assistant Nursing': { duration: '6-12 Months', type: 'certificate' },
  'Clinical Record Management': { duration: '3-6 Months', type: 'certificate' },
  'Hospital Record Management': { duration: '6-12 Months', type: 'certificate' },
  'Dental Health Care Assistant': { duration: '3-6 Months', type: 'certificate' },
  'Psychosocial Counselling': { duration: '3-6 Months', type: 'certificate' },
  'HIV/AIDS Management': { duration: '3-6 Months', type: 'certificate' },
  'Health Care Assistant': { duration: '3-6 Months', type: 'certificate' },
  'Pharmacy Assistant': { duration: '3-6 Months', type: 'certificate' },
  'TB Management': { duration: '3-6 Months', type: 'certificate' },
};

export type Program = typeof ALL_PROGRAMS[number];
