//
// PUBLIC_INTERFACE
// storage.js - Utility helpers for persistent localStorage access.
// Designed for search history (array of strings) and other simple data needs.
//

const HISTORY_KEY = "githubinsight_search_history";
// Set upper limit for history entries
const HISTORY_LIMIT = 7;

/**
 * PUBLIC_INTERFACE
 * Save search history to localStorage.
 * Ensures deduplication and length limit.
 * @param {string[]} historyArr
 */
export function setSearchHistory(historyArr) {
  const deduped = Array.from(new Set(historyArr)).slice(0, HISTORY_LIMIT);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(deduped));
}

/**
 * PUBLIC_INTERFACE
 * Retrieve search history from localStorage.
 * Returns array of string queries.
 * @returns {string[]}
 */
export function getSearchHistory() {
  const data = window.localStorage.getItem(HISTORY_KEY);
  if (!data) return [];
  try {
    const arr = JSON.parse(data);
    if (Array.isArray(arr)) return arr.slice(0, HISTORY_LIMIT);
    return [];
  } catch (_) {
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * Add a search query to history; persists deduped, trimmed list.
 * @param {string} query
 */
export function addSearchQuery(query) {
  if (!query || typeof query !== "string" || !query.trim()) return;
  let history = getSearchHistory();
  history = [query.trim(), ...history.filter(q => q !== query.trim())].slice(0, HISTORY_LIMIT);
  setSearchHistory(history);
}

/**
 * PUBLIC_INTERFACE
 * Clear search history from localStorage.
 */
export function clearSearchHistory() {
  window.localStorage.removeItem(HISTORY_KEY);
}
