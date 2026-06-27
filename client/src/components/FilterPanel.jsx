export default function FilterPanel({
  type,
  onTypeChange,
  category,
  onCategoryChange,
  categoriesList,
  status,
  onStatusChange,
  location,
  onLocationChange,
  sort,
  onSortChange,
  onReset,
  isFiltered,
}) {
  return (
    <div className="filters-row">
      <div className="filters-group-left">
        {/* Type tabs */}
        <div className="type-tabs">
          <button
            className={`type-tab ${type === "" ? "active" : ""}`}
            onClick={() => onTypeChange("")}
          >
            All
          </button>
          <button
            className={`type-tab ${type === "lost" ? "active" : ""}`}
            onClick={() => onTypeChange("lost")}
          >
            Lost
          </button>
          <button
            className={`type-tab ${type === "found" ? "active" : ""}`}
            onClick={() => onTypeChange("found")}
          >
            Found
          </button>
        </div>

        {/* Category selection */}
        <div className="filter-select-wrapper">
          <label htmlFor="feed-category-filter" className="sr-only">
            Filter by Category
          </label>
          <select
            id="feed-category-filter"
            className="form-select"
            value={category}
            onChange={onCategoryChange}
          >
            <option value="">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status selection */}
        <div className="filter-select-wrapper">
          <label htmlFor="feed-status-filter" className="sr-only">
            Filter by Status
          </label>
          <select
            id="feed-status-filter"
            className="form-select"
            value={status}
            onChange={onStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>

        {/* Location selection */}
        <div className="filter-select-wrapper location-input-field">
          <label htmlFor="feed-location-filter" className="sr-only">
            Filter by Location
          </label>
          <input
            id="feed-location-filter"
            type="text"
            className="form-input"
            placeholder="Filter by location..."
            value={location}
            onChange={onLocationChange}
          />
        </div>

        {/* Sort selection */}
        <div className="filter-select-wrapper">
          <label htmlFor="feed-sort-filter" className="sr-only">
            Sort By
          </label>
          <select
            id="feed-sort-filter"
            className="form-select"
            value={sort}
            onChange={onSortChange}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="filters-group-right">
        {isFiltered && (
          <button
            onClick={onReset}
            className="btn btn-outline"
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", height: "38px" }}
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
