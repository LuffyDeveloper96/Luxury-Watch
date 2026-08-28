/**
 * Shared Safe Regex Escaping Utility
 * Escapes special regex metacharacters to prevent ReDoS and uncaught SyntaxError in dynamic queries.
 */
export const escapeRegex = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default {
  escapeRegex
};
