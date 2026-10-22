// Optional market-research questions on the download form. Shared by the form, /api/subscribe (which only
// stores answers from these lists) and the admin dashboard.
export const SURVEY = {
  heard_from: {
    label: "How did you find us?",
    admin: "Como conheceram a Elonai",
    options: ["Facebook", "Instagram", "Pinterest", "TikTok", "YouTube", "Google search", "A friend or family member", "My church or small group", "Email", "Other"],
  },
  heart_topic: {
    label: "What's weighing on your heart?",
    admin: "O que pesa no coração",
    options: ["Anxiety and worry", "Sleep and rest", "Grief and loss", "Marriage and family", "Loneliness", "Faith and doubt", "Purpose and direction", "Health", "Finances", "Other"],
  },
  age_range: {
    label: "Your age",
    admin: "Faixa etária",
    options: ["Under 25", "25–34", "35–44", "45–54", "55–64", "65+"],
  },
} as const;

export type SurveyField = keyof typeof SURVEY;
export const SURVEY_FIELDS = Object.keys(SURVEY) as SurveyField[];

export const surveyAnswer = (field: SurveyField, v: unknown) =>
  (SURVEY[field].options as readonly string[]).includes(String(v)) ? String(v) : null;
