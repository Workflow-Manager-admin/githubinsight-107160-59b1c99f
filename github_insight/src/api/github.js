/**
 * PUBLIC_INTERFACE
 * Utility module for interacting with GitHub Public API.
 * Provides fetch-based search, trending fallback, profile/org/repo queries, and robust error handling for integration.
 */

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Handle fetch errors and HTTP status errors.
 */
async function handleResponse(response) {
  if (!response.ok) {
    // Try to parse a helpful error body if present
    let errorMsg = `GitHub API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody && (errorBody.message || errorBody.documentation_url)) {
        errorMsg +=
          ` - ${errorBody.message}` +
          (errorBody.documentation_url ? ` (${errorBody.documentation_url})` : "");
      }
    } catch (_) {
      // Ignore: Not JSON or no body
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

/**
 * PUBLIC_INTERFACE
 * Search GitHub repositories by keyword/criteria.
 * @param {string} query
 * @param {object} opts {page, per_page, sort, order}
 * @returns {Promise<object>}
 */
export async function searchRepositories(query, opts = {}) {
  const params = new URLSearchParams({
    q: query,
    sort: opts.sort || 'best match',
    order: opts.order || 'desc',
    per_page: opts.per_page || 20,
    page: opts.page || 1
  });
  const url = `${GITHUB_API_BASE}/search/repositories?${params}`;
  try {
    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    // Advanced error handling could persist or surface this.
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * Search GitHub users by keyword/criteria.
 * @param {string} query
 * @param {object} opts {page, per_page, sort, order}
 * @returns {Promise<object>}
 */
export async function searchUsers(query, opts = {}) {
  const params = new URLSearchParams({
    q: query,
    sort: opts.sort || "best match",
    order: opts.order || "desc",
    per_page: opts.per_page || 20,
    page: opts.page || 1
  });
  const url = `${GITHUB_API_BASE}/search/users?${params}`;
  try {
    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch detailed user profile (or org) by username/login.
 * @param {string} username
 * @returns {Promise<object>}
 */
export async function fetchUserProfile(username) {
  const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`;
  try {
    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch repositories for a user or org.
 * @param {string} username
 * @param {object} opts {type, sort, direction, per_page, page}
 * @returns {Promise<object[]>}
 */
export async function fetchUserRepos(username, opts = {}) {
  const params = new URLSearchParams({
    type: opts.type || "all",
    sort: opts.sort || "updated",
    direction: opts.direction || "desc",
    per_page: opts.per_page || 20,
    page: opts.page || 1
  });
  const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?${params}`;
  try {
    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch repository details by owner and repo.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<object>}
 */
export async function fetchRepoDetails(owner, repo) {
  const url = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  try {
    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * Fallback for "trending" repos: get most-starred in recent period (since GitHub API lacks /trending).
 * See: https://github.com/trending for real trending, but GH API unsupported.
 * @param {object} opts {language, since, per_page, page}
 * @returns {Promise<object>}
 */
export async function fetchTrendingRepos(opts = {}) {
  // "Trending" approximation: search by stars, created in past week/month.
  // e.g. q=stars:>1000+created:>2023-12-01
  let since = opts.since || getTrendingSinceDate("week");
  let query = `stars:>100 created:>${since}`;
  if (opts.language) query += ` language:${opts.language}`;
  const params = new URLSearchParams({
    q: query,
    sort: "stars",
    order: "desc",
    per_page: opts.per_page || 10,
    page: opts.page || 1
  });
  const url = `${GITHUB_API_BASE}/search/repositories?${params}`;
  try {
    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    throw err;
  }
}

/**
 * PUBLIC_INTERFACE
 * Fallback "trending" developers: Search for users with many followers, recently active.
 * As GitHub API has no trending users endpoint, this is only a rough approximation.
 * @param {object} opts {since, per_page, page}
 * @returns {Promise<object>}
 */
export async function fetchTrendingUsers(opts = {}) {
  // "Trending" approximation: users with many followers and recent repo activity
  // GitHub does not expose last commit/activity, so use high follower + recent repos.
  let since = opts.since || getTrendingSinceDate("week");
  let query = `followers:>100 repos:>10 created:>${since}`;
  const params = new URLSearchParams({
    q: query,
    sort: "followers",
    order: "desc",
    per_page: opts.per_page || 10,
    page: opts.page || 1
  });
  const url = `${GITHUB_API_BASE}/search/users?${params}`;
  try {
    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    throw err;
  }
}

/**
 * Helper for trending queries: returns YYYY-MM-DD for {week,month,year} period start.
 */
function getTrendingSinceDate(period = "week") {
  const now = new Date();
  let daysAgo = 7;
  if (period === "month") daysAgo = 30;
  if (period === "year") daysAgo = 365;
  const ago = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return ago.toISOString().slice(0, 10);
}

/**
 * PUBLIC_INTERFACE
 * Fetch organization details by org login.
 * @param {string} orgname
 * @returns {Promise<object>}
 */
export async function fetchOrganization(orgname) {
  const url = `${GITHUB_API_BASE}/orgs/${encodeURIComponent(orgname)}`;
  try {
    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    throw err;
  }
}

// More methods (rate-limit info, starred repos, etc.) can be added as app grows.
