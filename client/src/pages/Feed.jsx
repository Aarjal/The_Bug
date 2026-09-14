import { useState, useEffect, useMemo } from "react";
import { SearchX, Inbox, RefreshCw, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { getFeed } from "../api/services";
import { CATEGORIES } from "../utils/helpers";
import ItemCard from "../components/ItemCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import "../styles/Feed.css";

function FeedHeroHeader() {
  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.25rem", color: "var(--primary)" }}>
        Community Reports Feed
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
        Browse through lost and found listings reported by the community.
      </p>
    </div>
  );
}

function FeedSkeletonGrid() {
  return (
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
  );
}

function FeedPaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button
        type="button"
        className="btn btn-outline"
        disabled={!pagination.hasPreviousPage}
        onClick={() => onPageChange(pagination.currentPage - 1)}
        aria-label="Previous Page"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="pagination-info">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <button
        type="button"
        className="btn btn-outline"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.currentPage + 1)}
        aria-label="Next Page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function FeedEmptyState({ isFiltered, onResetFilters }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {isFiltered ? <SearchX size={32} /> : <Inbox size={32} />}
      </div>
      <h3>No reports found</h3>
      <p>
        {isFiltered
          ? "No items match your search filters."
          : "No lost or found items have been posted yet."}
      </p>
      {isFiltered && (
        <button
          type="button"
          onClick={onResetFilters}
          className="btn btn-primary"
          style={{ padding: "0.55rem 1.25rem" }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

function FeedErrorCard({ message, onRetry }) {
  return (
    <div
      className="error-card card"
      style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}
    >
      <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
      <h3 style={{ marginBottom: "0.5rem" }}>Failed to load feed</h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="btn btn-primary"
        style={{ display: "inline-flex", margin: "0 auto", gap: "0.5rem" }}
      >
        <RefreshCw size={16} />
        <span>Retry</span>
      </button>
    </div>
  );
}

export default function Feed() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [locationInput, setLocationInput] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

  const [itemType, setItemType] = useState("");
  const [category, setCategory] = useState("");
  const [itemStatus, setItemStatus] = useState("active");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [feedError, setFeedError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(locationInput);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [locationInput]);

  const dynamicCategories = useMemo(() => {
    if (!items || items.length === 0) return CATEGORIES;

    const baseValues = new Set(CATEGORIES.map((c) => c.value));
    const newlyDiscovered = [];

    items.forEach((item) => {
      if (item.category && !baseValues.has(item.category)) {
        baseValues.add(item.category);
        newlyDiscovered.push({
          value: item.category,
          label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        });
      }
    });

    return newlyDiscovered.length > 0 ? [...CATEGORIES, ...newlyDiscovered] : CATEGORIES;
  }, [items]);

  useEffect(() => {
    let isMounted = true;

    async function fetchFeedItems() {
      try {
        const { data } = await getFeed({
          page: currentPage,
          limit: 12,
          q: debouncedSearch || undefined,
          type: itemType || undefined,
          category: category || undefined,
          status: itemStatus || undefined,
          location: debouncedLocation || undefined,
          sort: sortBy || undefined,
        });

        if (isMounted) {
          setItems(data.items);
          setPagination(data.pagination);
          setFeedError("");
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setFeedError("Failed to fetch lost & found feed. Please try again.");
          setIsLoading(false);
        }
      }
    }

    fetchFeedItems();

    return () => {
      isMounted = false;
    };
  }, [currentPage, debouncedSearch, itemType, category, itemStatus, debouncedLocation, sortBy, refreshIndex]);

  const isFiltered =
    Boolean(searchInput) ||
    Boolean(debouncedSearch) ||
    Boolean(itemType) ||
    Boolean(category) ||
    itemStatus !== "active" ||
    Boolean(locationInput) ||
    Boolean(debouncedLocation) ||
    sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setLocationInput("");
    setDebouncedLocation("");
    setItemType("");
    setCategory("");
    setItemStatus("active");
    setSortBy("newest");
    setCurrentPage(1);
    setIsLoading(true);
  };

  const handleTypeSelect = (selectedType) => {
    setItemType(selectedType);
    setCurrentPage(1);
    setIsLoading(true);
  };

  const handleCategorySelect = (selectedCategory) => {
    const value = selectedCategory?.target ? selectedCategory.target.value : selectedCategory;
    setCategory(value);
    setCurrentPage(1);
    setIsLoading(true);
  };

  const handleStatusSelect = (selectedStatus) => {
    const value = selectedStatus?.target ? selectedStatus.target.value : selectedStatus;
    setItemStatus(value);
    setCurrentPage(1);
    setIsLoading(true);
  };

  const handleSortSelect = (selectedSort) => {
    const value = selectedSort?.target ? selectedSort.target.value : selectedSort;
    setSortBy(value);
    setCurrentPage(1);
    setIsLoading(true);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  };

  return (
    <div className="container main-content">
      <div className="feed-layout">
        <FeedHeroHeader />

        <div className="filter-panel">
          <SearchBar
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <FilterPanel
            type={itemType}
            onTypeChange={handleTypeSelect}
            category={category}
            onCategoryChange={handleCategorySelect}
            categoriesList={dynamicCategories}
            status={itemStatus}
            onStatusChange={handleStatusSelect}
            location={locationInput}
            onLocationChange={(e) => setLocationInput(e.target.value)}
            sort={sortBy}
            onSortChange={handleSortSelect}
            onReset={handleResetFilters}
            isFiltered={isFiltered}
          />
        </div>

        {feedError && (
          <FeedErrorCard message={feedError} onRetry={handleRetry} />
        )}

        {isLoading ? (
          <FeedSkeletonGrid />
        ) : items.length > 0 ? (
          <>
            <div className="feed-grid">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>

            <FeedPaginationControls
              pagination={pagination}
              onPageChange={(nextPage) => {
                setIsLoading(true);
                setCurrentPage(Math.max(1, nextPage));
              }}
            />
          </>
        ) : (
          <FeedEmptyState isFiltered={isFiltered} onResetFilters={handleResetFilters} />
        )}
      </div>
    </div>
  );
}
