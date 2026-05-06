// llml profile catalog — design tokens
// Source-of-truth: design/colors_and_type.css
// This file re-exports the tokens as JS constants for use in Astro components.

export const TOKENS = {
  color: {
    primary: "#2F6BFF",
    primaryPress: "#234fc2",
    secondary: "#1A1F27",
    paper: "#F3F1EA",
    paper2: "#E7E1D4",
    border: "#D8D2C4",
    muted: "#8A8375",
    ink: "#111318",
    success: "#1EBC73",
    warning: "#C98512",
    error: "#D84B45",
    info: "#2F6BFF",
  },
  spacing: {
    "2xs": "4px",
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
    "4xl": "96px",
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "18px",
    full: "9999px",
  },
  layout: {
    app: "1280px",
    marketing: "1180px",
    gutter: "24px",
  },
};
