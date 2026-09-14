import CustomSelect from "./CustomSelect";

function TypeFilterTabs({ activeType, onSelectType }) {
  const filterTabs = [
    { key: "", label: "All" },
    { key: "lost", label: "Lost" },
    { key: "found", label: "Found" },
  ];

  return (
    <div className="type-tabs" role="tablist" aria-label="Item type filter">
      {filterTabs.map(({ key, label }) => (
        <button
          key={key || "all"}
          type="button"
          role="tab"
          aria-selected={activeType === key}
          className={`type-tab ${activeType === key ? "active" : ""}`}
          onClick={() => onSelectType(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function FilterPanel({
  type,
  onTypeChange,
  category,
  onCategoryChange,
  categoriesList = [],
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

  // Dispatches either direct value or synthetic event for backward compatibility
  const dispatchChange = (handler, nextValue) => {
    if (!handler) return;
    try {
      handler({ target: { value: nextValue } });
    } catch {
      handler(nextValue);
    }
  };

  return (
    <div className="filters-row">
      <div className="filters-group-left">
        <TypeFilterTabs activeType={type} onSelectType={onTypeChange} />

        <div className="filter-select-wrapper">
          <CustomSelect
            id="feed-category-filter"
            value={category}
            onChange={(selected) => dispatchChange(onCategoryChange, selected)}
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>

        <div className="filter-select-wrapper">
          <CustomSelect
            id="feed-status-filter"
            value={status}
            onChange={(selected) => dispatchChange(onStatusChange, selected)}
            options={statusOptions}
            placeholder="All Statuses"
          />
        </div>

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

        <div className="filter-select-wrapper">
          <CustomSelect
            id="feed-sort-filter"
            value={sort}
            onChange={(selected) => dispatchChange(onSortChange, selected)}
            options={sortOptions}
            placeholder="Newest First"
          />
        </div>
      </div>

      <div className="filters-group-right">
        {isFiltered && (
          <button
            type="button"
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
