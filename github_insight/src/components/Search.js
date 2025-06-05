import React from "react";

/**
 * PUBLIC_INTERFACE
 * Search component renders the search section, including the search bar,
 * the search results placeholder, and provides handlers as props.
 */
function Search({
  searchInput,
  setSearchInput,
  onSearch,
  showResults,
  searchQuery
}) {
  return (
    <section className="gi-section gi-search-section">
      <form
        className="gi-searchbar"
        onSubmit={onSearch}
        role="search"
        aria-label="Search GitHub"
      >
        <input
          type="text"
          placeholder="Search GitHub users or repositories…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="gi-input"
          aria-label="GitHub search"
        />
        <button className="gi-btn gi-btn-accent" type="submit" aria-label="Submit Search">
          Search
        </button>
      </form>
      {showResults && (
        <div className="gi-search-results-card">
          <div className="gi-card-title">
            Search Results for: <span style={{ color: "var(--color-accent)" }}>{searchQuery}</span>
          </div>
          <div className="gi-card-description">[Placeholder] Show live GitHub search results here.</div>
        </div>
      )}
    </section>
  );
}

export default Search;
