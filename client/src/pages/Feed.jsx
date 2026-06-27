import { useState, useEffect } from "react";
import { SearchX, Inbox, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { getFeed } from "../api/services";
import { CATEGORIES } from "../utils/helpers";
import ItemCard from "../components/ItemCard";
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

  // Query Filters State
  const [type, setType] = useState(""); // "" (All), "lost", "found"
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("active"); // default active-first
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: 12,
        status: status || undefined,
        type: type || undefined,
        category: category || undefined,
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

  // Refetch items when filters or page change
  useEffect(() => {
    fetchItems();
  }, [type, category, status, page]);

  // Reset page to 1 when changing filters
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

  const resetFilters = () => {
    setType("");
    setCategory("");
    setStatus("active");
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

        {/* Filters Panel */}
        <div className="filter-panel">
          <div className="filter-left">
            {/* Type tabs */}
            <div className="type-tabs">
              <button
                className={`type-tab ${type === "" ? "active" : ""}`}
                onClick={() => handleTypeChange("")}
              >
                All Items
              </button>
              <button
                className={`type-tab ${type === "lost" ? "active" : ""}`}
                onClick={() => handleTypeChange("lost")}
              >
                Lost
              </button>
              <button
                className={`type-tab ${type === "found" ? "active" : ""}`}
                onClick={() => handleTypeChange("found")}
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
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
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
                onChange={handleStatusChange}
              >
                <option value="active">Active Only</option>
                <option value="resolved">Resolved Only</option>
                <option value="">All Statuses</option>
              </select>
            </div>
          </div>

          <div className="filter-right">
            {(type !== "" || category !== "" || status !== "active") && (
              <button
                onClick={resetFilters}
                className="btn btn-outline"
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", height: "38px" }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{error}</span>
            <button onClick={fetchItems} className="btn btn-outline btn-sm" style={{ padding: "0.35rem 0.75rem", border: "1px solid #feb2b2" }}>
              <RefreshCw size={14} style={{ marginRight: "0.25rem" }} /> Retry
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
              {category || type || status !== "active" ? <SearchX size={32} /> : <Inbox size={32} />}
            </div>
            <h3>No reports found</h3>
            <p>
              We couldn&apos;t find any items matching your filters. Try resetting them or check back later!
            </p>
            <button onClick={resetFilters} className="btn btn-primary" style={{ padding: "0.55rem 1.25rem" }}>
              Show All Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
