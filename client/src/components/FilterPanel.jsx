import CustomSelect from "./CustomSelect";

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
  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categoriesList,
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active Only" },
    { value: "resolved", label: "Resolved Only" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];

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
          <CustomSelect
            id="feed-category-filter"
            value={category}
            onChange={(val) => onCategoryChange({ target: { value: val } })}
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>

        {/* Status selection */}
        <div className="filter-select-wrapper">
          <CustomSelect
            id="feed-status-filter"
            value={status}
            onChange={(val) => onStatusChange({ target: { value: val } })}
            options={statusOptions}
            placeholder="All Statuses"
          />
        </div>

        {/* Location input */}
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
          <CustomSelect
            id="feed-sort-filter"
            value={sort}
            onChange={(val) => onSortChange({ target: { value: val } })}
            options={sortOptions}
            placeholder="Newest First"
          />
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
