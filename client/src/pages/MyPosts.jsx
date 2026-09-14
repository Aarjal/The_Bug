import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Compass, Edit2, CheckCircle, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { getMyItems, deleteItem, resolveItem } from "../api/services";
import { useToast } from "../context/ToastContext";
import { formatRelativeTime } from "../utils/helpers";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/DetailAndMyItems.css";
import "../styles/Feed.css";

function MyPostsHeader() {
  return (
    <div className="dashboard-header">
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>
          My Reported Items
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Manage, edit, or resolve items you have posted to the feed.
        </p>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Link to="/create?type=lost" className="btn btn-outline" style={{ fontSize: "0.85rem", height: "42px" }}>
          Report Lost
        </Link>
        <Link to="/create?type=found" className="btn btn-primary" style={{ fontSize: "0.85rem", height: "42px" }}>
          Report Found
        </Link>
      </div>
    </div>
  );
}

function MyPostsFilterTabs({ activeFilter, onSelectFilter, counts }) {
  const tabs = [
    { key: "all", label: `All Posts (${counts.all})` },
    { key: "lost", label: `Active Lost (${counts.lost})` },
    { key: "found", label: `Active Found (${counts.found})` },
    { key: "resolved", label: `Resolved (${counts.resolved})` },
  ];

  return (
    <div className="dashboard-tabs" role="tablist">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={activeFilter === key}
          className={`dashboard-tab ${activeFilter === key ? "active" : ""}`}
          onClick={() => onSelectFilter(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function MyPostCard({ item, onResolve, onDelete }) {
  const isLost = item.type === "lost";
  const incidentDate = isLost ? item.dateLost : item.dateFound;
  const isResolved = item.status === "resolved";

  return (
    <div className={`card item-card ${isResolved ? "resolved" : ""}`} style={{ height: "auto" }}>
      <div className="item-image-wrapper">
        <span className={`badge item-badge-type ${isLost ? "badge-lost" : "badge-found"}`}>
          {item.type}
        </span>
        {item.image ? (
          <img src={item.image} alt={item.title} className="item-image" loading="lazy" />
        ) : (
          <Compass size={28} strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>

      <div className="item-card-body" style={{ paddingBottom: "1rem" }}>
        <div className="item-meta-top">
          <span className="item-category-pill">{item.category}</span>
          <span style={{ fontSize: "0.75rem" }}>{formatRelativeTime(incidentDate || item.createdAt)}</span>
        </div>
        <h3 className="item-card-title">{item.title}</h3>
        <p className="item-card-desc" style={{ marginBottom: "0" }}>{item.description}</p>
      </div>

      <div className="user-card-actions">
        <Link to={`/item/${item._id}`} className="user-card-btn" title="View details">
          <Search size={14} aria-hidden="true" />
          <span>View</span>
        </Link>
        <Link to={`/edit/${item._id}`} className="user-card-btn" title="Edit report">
          <Edit2 size={14} aria-hidden="true" />
          <span>Edit</span>
        </Link>
        {item.status === "active" && (
          <button
            type="button"
            onClick={() => onResolve(item._id)}
            className="user-card-btn user-card-btn-success"
            title="Mark resolved"
          >
            <CheckCircle size={14} aria-hidden="true" />
            <span>Resolve</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(item._id)}
          className="user-card-btn user-card-btn-danger"
          title="Delete report"
        >
          <Trash2 size={14} aria-hidden="true" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

function MyPostsSkeletonGrid() {
  return (
    <div className="feed-grid">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-body">
            <div className="skeleton-line skeleton-meta" />
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-desc" />
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-line skeleton-btn" style={{ width: "100%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MyPostsEmptyState({ hasItemsInTotal }) {
  if (!hasItemsInTotal) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Compass size={32} aria-hidden="true" />
        </div>
        <h3>No items posted</h3>
        <p>You haven&apos;t posted any items yet.</p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <Link to="/create?type=lost" className="btn btn-outline btn-sm">
            Report Lost
          </Link>
          <Link to="/create?type=found" className="btn btn-primary btn-sm">
            Report Found
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Compass size={32} aria-hidden="true" />
      </div>
      <h3>No matching items</h3>
      <p>You haven&apos;t reported any items matching this filter yet.</p>
    </div>
  );
}

export default function MyPosts() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { addToast } = useToast();

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    actionType: "",
    targetId: "",
    title: "",
    message: "",
    buttonType: "warning",
    confirmText: "Confirm",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchUserPosts() {
      try {
        const { data } = await getMyItems();
        if (isMounted) {
          setItems(data);
          setError("");
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setError("Failed to fetch your reported items.");
          setLoading(false);
        }
      }
    }

    fetchUserPosts();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const requestResolve = (targetId) => {
    setConfirmDialog({
      isOpen: true,
      actionType: "resolve",
      targetId,
      title: "Resolve Item",
      message: "Are you sure you want to mark this item as resolved?",
      buttonType: "warning",
      confirmText: "Resolve",
    });
  };

  const requestDelete = (targetId) => {
    setConfirmDialog({
      isOpen: true,
      actionType: "delete",
      targetId,
      title: "Delete Report",
      message: "Are you sure you want to permanently delete this report?",
      buttonType: "danger",
      confirmText: "Delete",
    });
  };

  const handleExecuteConfirmedAction = async () => {
    const { actionType, targetId } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

    if (actionType === "resolve") {
      try {
        await resolveItem(targetId);
        addToast("Item marked as resolved!", "success");
        setLoading(true);
        setRefreshTrigger((prev) => prev + 1);
      } catch {
        addToast("Failed to mark item as resolved.", "error");
      }
    } else if (actionType === "delete") {
      try {
        await deleteItem(targetId);
        addToast("Report deleted successfully.", "success");
        setLoading(true);
        setRefreshTrigger((prev) => prev + 1);
      } catch {
        addToast("Failed to delete report.", "error");
      }
    }
  };

  const filterCounts = useMemo(() => ({
    all: items.length,
    lost: items.filter((item) => item.type === "lost" && item.status === "active").length,
    found: items.filter((item) => item.type === "found" && item.status === "active").length,
    resolved: items.filter((item) => item.status === "resolved").length,
  }), [items]);

  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      if (filter === "all") return true;
      if (filter === "lost") return item.type === "lost" && item.status === "active";
      if (filter === "found") return item.type === "found" && item.status === "active";
      if (filter === "resolved") return item.status === "resolved";
      return true;
    });
  }, [items, filter]);

  return (
    <div className="container main-content">
      <div className="dashboard-layout">
        <MyPostsHeader />

        <MyPostsFilterTabs
          activeFilter={filter}
          onSelectFilter={setFilter}
          counts={filterCounts}
        />

        {loading ? (
          <MyPostsSkeletonGrid />
        ) : error ? (
          <div className="error-card card" style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
            <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} aria-hidden="true" />
            <h3 style={{ marginBottom: "0.5rem" }}>Failed to load posts</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setRefreshTrigger((prev) => prev + 1);
              }}
              className="btn btn-primary"
              style={{ display: "inline-flex", margin: "0 auto", gap: "0.5rem" }}
            >
              <RefreshCw size={16} aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        ) : displayedItems.length === 0 ? (
          <MyPostsEmptyState hasItemsInTotal={items.length > 0} />
        ) : (
          <div className="feed-grid">
            {displayedItems.map((item) => (
              <MyPostCard
                key={item._id}
                item={item}
                onResolve={requestResolve}
                onDelete={requestDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText="Cancel"
        type={confirmDialog.buttonType}
        onConfirm={handleExecuteConfirmedAction}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
