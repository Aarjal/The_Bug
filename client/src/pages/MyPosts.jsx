import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search, Compass, Edit2, CheckCircle, Trash2 } from "lucide-react";
import { getMyItems, deleteItem, resolveItem } from "../api/services";
import { useToast } from "../context/ToastContext";
import { formatRelativeTime } from "../utils/helpers";
import "../styles/DetailAndMyItems.css";
import "../styles/Feed.css";

export default function MyPosts() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all"); // "all", "lost", "found", "resolved"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  const fetchMyItems = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getMyItems();
      setItems(data);
    } catch (err) {
      setError("Failed to fetch your reported items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, []);

  const handleResolve = async (id) => {
    if (!window.confirm("Are you sure you want to mark this item as resolved?")) return;
    try {
      await resolveItem(id);
      addToast("Item marked as resolved!", "success");
      fetchMyItems(); // reload
    } catch (err) {
      addToast("Failed to mark item as resolved.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this report?")) return;
    try {
      await deleteItem(id);
      addToast("Report deleted successfully.", "success");
      fetchMyItems(); // reload
    } catch (err) {
      addToast("Failed to delete report.", "error");
    }
  };

  // Client-side filtering of user's posts
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "lost") return item.type === "lost" && item.status === "active";
    if (filter === "found") return item.type === "found" && item.status === "active";
    if (filter === "resolved") return item.status === "resolved";
    return true;
  });

  return (
    <div className="container main-content">
      <div className="dashboard-layout">
        {/* Dashboard Header */}
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

        {/* Filters Tabs */}
        <div className="dashboard-tabs">
          <button className={`dashboard-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All Posts ({items.length})
          </button>
          <button className={`dashboard-tab ${filter === "lost" ? "active" : ""}`} onClick={() => setFilter("lost")}>
            Active Lost ({items.filter((i) => i.type === "lost" && i.status === "active").length})
          </button>
          <button className={`dashboard-tab ${filter === "found" ? "active" : ""}`} onClick={() => setFilter("found")}>
            Active Found ({items.filter((i) => i.type === "found" && i.status === "active").length})
          </button>
          <button className={`dashboard-tab ${filter === "resolved" ? "active" : ""}`} onClick={() => setFilter("resolved")}>
            Resolved ({items.filter((i) => i.status === "resolved").length})
          </button>
        </div>

        {/* Dashboard Content */}
        {loading ? (
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
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : filteredItems.length > 0 ? (
          <div className="feed-grid">
            {filteredItems.map((item) => {
              const isLost = item.type === "lost";
              const itemDate = isLost ? item.dateLost : item.dateFound;

              return (
                <div key={item._id} className={`card item-card ${item.status === "resolved" ? "resolved" : ""}`} style={{ height: "auto" }}>
                  <div className="item-image-wrapper">
                    <span className={`badge item-badge-type ${isLost ? "badge-lost" : "badge-found"}`}>
                      {item.type}
                    </span>
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="item-image" />
                    ) : (
                      <Compass size={28} strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="item-card-body" style={{ paddingBottom: "1rem" }}>
                    <div className="item-meta-top">
                      <span className="item-category-pill">{item.category}</span>
                      <span style={{ fontSize: "0.75rem" }}>{formatRelativeTime(itemDate || item.createdAt)}</span>
                    </div>
                    <h3 className="item-card-title">{item.title}</h3>
                    <p className="item-card-desc" style={{ marginBottom: "0" }}>{item.description}</p>
                  </div>

                  {/* Quick-action buttons directly on the cards */}
                  <div className="user-card-actions">
                    <Link to={`/item/${item._id}`} className="user-card-btn" title="View details">
                      <Search size={14} />
                      <span>View</span>
                    </Link>
                    <Link to={`/edit/${item._id}`} className="user-card-btn" title="Edit report">
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </Link>
                    {item.status === "active" && (
                      <button onClick={() => handleResolve(item._id)} className="user-card-btn user-card-btn-success" title="Mark resolved">
                        <CheckCircle size={14} />
                        <span>Resolve</span>
                      </button>
                    )}
                    <button onClick={() => handleDelete(item._id)} className="user-card-btn user-card-btn-danger" title="Delete report">
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Compass size={32} />
            </div>
            <h3>No reports found here</h3>
            <p>You haven&apos;t reported any items matching this filter yet.</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <Link to="/create?type=lost" className="btn btn-outline btn-sm">
                Report Lost
              </Link>
              <Link to="/create?type=found" className="btn btn-primary btn-sm">
                Report Found
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
