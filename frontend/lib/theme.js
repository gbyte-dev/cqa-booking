const THEME_KEY = 'cqa-theme';

export function getTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return localStorage.getItem(THEME_KEY) || 'light';
}

export function setTheme(theme) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(THEME_KEY, theme);

  document.documentElement.setAttribute(
    'data-theme',
    theme
  );
}

export function toggleTheme() {
  const currentTheme = getTheme();

  const newTheme =
    currentTheme === 'dark'
      ? 'light'
      : 'dark';

  setTheme(newTheme);

  return newTheme;
}

export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const savedTheme =
    localStorage.getItem(THEME_KEY);

  const theme =
    savedTheme === 'dark'
      ? 'dark'
      : 'light';

  document.documentElement.setAttribute(
    'data-theme',
    theme
  );
}