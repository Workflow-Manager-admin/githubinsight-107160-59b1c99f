/**
 * PUBLIC_INTERFACE
 * Utility module for interacting with GitHub API.
 * Will provide methods for searching users, repositories, fetching trending, stats, etc.
 */

const GITHUB_API_BASE = "https://api.github.com";

// PUBLIC_INTERFACE
export async function searchRepositories(query) {
  // TODO: implement repo search
  const res = await fetch(`${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function searchUsers(query) {
  // TODO: implement user search
  const res = await fetch(`${GITHUB_API_BASE}/search/users?q=${encodeURIComponent(query)}`);
  return res.json();
}

// PUBLIC_INTERFACE
export async function fetchUserProfile(username) {
  // TODO: get user profile details
  const res = await fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`);
  return res.json();
}

// More methods (trending, repo details, etc.) can be added here as needed.
