import { useState, useEffect } from "react";
import { SearchX, Inbox, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { getFeed } from "../api/services";
import { CATEGORIES } from "../utils/helpers";
import ItemCard from "../components/ItemCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import "../styles/Feed.css";

export default function Feed() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Raw inputs (need to be debounced)
  const [searchVal, setSearchVal] = useState("");
  const [locationVal, setLocationVal] = useState("");

  // Query Filters State
  const [q, setQ] = useState("");
  const [type, setType] = useState(""); // "" (All), "lost", "found"
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("active"); // default active-first
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Categories list state (initialized with helpers CATEGORIES, dynamically extended if needed)
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);

  // Debounce search input q (350ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setQ(searchVal);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Debounce location input (350ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setLocation(locationVal);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [locationVal]);

  // Populate categories dynamically from current feed items if available
  useEffect(() => {
    if (items && items.length > 0) {
      const itemCategories = [...new Set(items.map((item) => item.category))].filter(Boolean);
      const updatedList = [...CATEGORIES];
      itemCategories.forEach((catVal) => {
        if (!updatedList.some((c) => c.value === catVal)) {
          updatedList.push({
            value: catVal,
            label: catVal.charAt(0).toUpperCase() + catVal.slice(1),
          });
        }
      });
      setCategoriesList(updatedList);
    }
  }, [items]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: 12,
        q: q || undefined,
        type: type || undefined,
        category: category || undefined,
        status: status || undefined,
        location: location || undefined,
        sort: sort || undefined,
      };

      const { data } = await getFeed(params);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setError("Failed to fetch lost & found feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Refetch items when any filter or page changes
  useEffect(() => {
    fetchItems();
  }, [q, type, category, status, location, sort, page]);

  // Check if any filter is currently applied (compared to default state)
  const isFiltered =
    searchVal !== "" ||
    q !== "" ||
    type !== "" ||
    category !== "" ||
    status !== "active" ||
    locationVal !== "" ||
    location !== "" ||
    sort !== "newest";

  const handleTypeChange = (newType) => {
    setType(newType);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleLocationChange = (e) => {
    setLocationVal(e.target.value);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchVal("");
    setQ("");
    setType("");
    setCategory("");
    setStatus("active");
    setLocationVal("");
    setLocation("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="container main-content">
      <div className="feed-layout">
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.25rem", color: "var(--primary)" }}>
            Community Reports Feed
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Browse through lost and found listings reported by the community.
          </p>
        </div>

        {/* Filters Panel containing Search and Filters */}
        <div className="filter-panel">
          {/* Search bar row */}
          <SearchBar value={searchVal} onChange={(e) => setSearchVal(e.target.value)} />

          {/* Filters controls row */}
          <FilterPanel
            type={type}
            onTypeChange={handleTypeChange}
            category={category}
            onCategoryChange={handleCategoryChange}
            categoriesList={categoriesList}
            status={status}
            onStatusChange={handleStatusChange}
            location={locationVal}
            onLocationChange={handleLocationChange}
            sort={sort}
            onSortChange={handleSortChange}
            onReset={resetFilters}
            isFiltered={isFiltered}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="error-card card" style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
            <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
            <h3 style={{ marginBottom: "0.5rem" }}>Failed to load feed</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error}</p>
            <button
              onClick={fetchItems}
              className="btn btn-primary"
              style={{ display: "inline-flex", margin: "0 auto", gap: "0.5rem" }}
            >
              <RefreshCw size={16} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          // Grid loading skeletons
          <div className="feed-grid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="skeleton-card">
                <div className="skeleton-image" />
                <div className="skeleton-body">
                  <div className="skeleton-line skeleton-meta" />
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line skeleton-desc" />
                  <div className="skeleton-line skeleton-desc" style={{ width: "60%" }} />
                </div>
                <div className="skeleton-footer">
                  <div className="skeleton-user">
                    <div className="skeleton-avatar" />
                    <div className="skeleton-line skeleton-name" />
                  </div>
                  <div className="skeleton-line skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          // Item Feed Cards
          <>
            <div className="feed-grid">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="btn btn-outline"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-outline"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next Page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="empty-state">
            <div className="empty-state-icon">
              {isFiltered ? <SearchX size={32} /> : <Inbox size={32} />}
            </div>
            <h3>No reports found</h3>
            <p>
              {isFiltered
                ? "No items match your search."
                : "No lost or found items have been posted yet."}
            </p>
            {isFiltered && (
              <button onClick={resetFilters} className="btn btn-primary" style={{ padding: "0.55rem 1.25rem" }}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

