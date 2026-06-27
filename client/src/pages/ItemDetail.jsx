import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Calendar, Compass, User, Edit2, CheckCircle, Trash2, ArrowLeft, RefreshCw, X, AlertCircle } from "lucide-react";
import { getItem, deleteItem, resolveItem, getItemMatches, createRecoveryRequest, getSentRecoveryRequests } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/helpers";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/DetailAndMyItems.css";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Match state
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Recovery request state
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimSubmitLoading, setClaimSubmitLoading] = useState(false);
  const [claimError, setClaimError] = useState("");

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", // "resolve" | "delete"
    title: "",
    message: "",
    buttonType: "warning", // "warning" | "danger"
    confirmText: "Confirm",
  });

  const fetchItemAndMatches = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getItem(id);
      setItem(data);

      const ownerId = data.userId?._id || data.userId;
      const isOwner = user && ownerId && user._id.toString() === ownerId.toString();

      if (isOwner) {
        setMatchesLoading(true);
        try {
          const { data: matchesData } = await getItemMatches(id);
          setMatches(matchesData);
        } catch (matchErr) {
          console.error("Failed to load matches:", matchErr);
        } finally {
          setMatchesLoading(false);
        }
      } else if (user && data.type === "found") {
        try {
          const { data: sentData } = await getSentRecoveryRequests();
          const alreadySent = sentData.requests.some((req) => {
            const reqItemId = req.item?._id || req.item;
            return reqItemId.toString() === id.toString();
          });
          setHasSentRequest(alreadySent);
        } catch (sentErr) {
          console.error("Failed to load sent recovery requests:", sentErr);
        }
      }
    } catch (err) {
      setError("Report not found or has been deleted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemAndMatches();
  }, [id, user]);

  const triggerResolveConfirm = () => {
    setConfirmModal({
      isOpen: true,
      type: "resolve",
      title: "Resolve Item",
      message: "Are you sure you want to mark this item as resolved?",
      buttonType: "warning",
      confirmText: "Resolve",
    });
  };

  const triggerDeleteConfirm = () => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      title: "Delete Report",
      message: "Are you sure you want to permanently delete this report? This cannot be undone.",
      buttonType: "danger",
      confirmText: "Delete",
    });
  };

  const handleConfirmAction = async () => {
    const { type } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    setActionLoading(true);

    if (type === "resolve") {
      try {
        const { data } = await resolveItem(id);
        setItem(data);
        addToast("Item successfully marked as resolved!", "success");
      } catch (err) {
        addToast("Failed to mark item as resolved. Please try again.", "error");
      } finally {
        setActionLoading(false);
      }
    } else if (type === "delete") {
      try {
        await deleteItem(id);
        addToast("Report deleted successfully.", "success");
        navigate("/", { replace: true });
      } catch (err) {
        addToast("Failed to delete report. Please try again.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimSubmitLoading(true);
    setClaimError("");
    try {
      await createRecoveryRequest({
        itemId: id,
        message: claimMessage,
      });
      addToast("Recovery request submitted successfully!", "success");
      setHasSentRequest(true);
      setShowClaimModal(false);
      setClaimMessage("");
    } catch (err) {
      setClaimError(err.response?.data?.message || "Failed to submit recovery request.");
    } finally {
      setClaimSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div className="spinner spinner-dark" style={{ width: "2.5rem", height: "2.5rem" }} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container main-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
        <div className="error-card card" style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
          <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>Report Not Found</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error || "The report you are looking for has been deleted or does not exist."}</p>
          <button onClick={() => navigate("/")} className="btn btn-primary" style={{ margin: "0 auto" }}>
            Go to Home Feed
          </button>
        </div>
      </div>
    );
  }

  const isLost = item.type === "lost";
  const itemDate = isLost ? item.dateLost : item.dateFound;

  // Compare logged in user ID with post owner ID
  const ownerId = item.userId?._id || item.userId;
  const isOwner = user && ownerId && user._id.toString() === ownerId.toString();

  return (
    <div className="container main-content">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ alignSelf: "flex-start", marginBottom: "1.5rem", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="detail-layout">
        {/* Left Side: Photo */}
        <div className="detail-image-section">
          <div className={`detail-image-wrapper ${item.status === "resolved" ? "resolved" : ""}`}>
            {item.image ? (
              <img src={item.image} alt={item.title} className="detail-image" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <Compass size={48} strokeWidth={1.5} />
                <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>No Image Preview Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Information Details */}
        <div className="detail-info-section">
          <div className="detail-header-row">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div className="detail-meta-pills">
                <span className={`badge ${isLost ? "badge-lost" : "badge-found"}`}>
                  {item.type}
                </span>
                <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text)" }}>
                  {item.category}
                </span>
                {item.status === "resolved" && (
                  <span className="badge badge-resolved">Resolved</span>
                )}
              </div>
              <h1 className="detail-title">{item.title}</h1>
            </div>
          </div>

          {/* Description */}
          <div className="detail-desc-box">
            <h2 className="detail-desc-title">Description</h2>
            <p className="detail-desc-text">{item.description}</p>
          </div>

          {/* Metadata Grid */}
          <div className="detail-grid-info">
            <div className="detail-info-item">
              <MapPin size={18} />
              <span><strong>Location:</strong> {item.location}</span>
            </div>
            <div className="detail-info-item">
              <Calendar size={18} />
              <span>
                <strong>Date {isLost ? "Lost" : "Found"}:</strong> {formatDate(itemDate)}
              </span>
            </div>
            <div className="detail-info-item">
              <User size={18} />
              <span>
                <strong>Reported By:</strong> {item.userId?.username || "Community Member"}
              </span>
            </div>
          </div>

          {/* Claim Item Action Panel for Non-Owners */}
          {!isOwner && user && item.type === "found" && item.status === "active" && (
            <div className="claim-action-panel" style={{ marginTop: "1.5rem" }}>
              {hasSentRequest ? (
                <button
                  className="btn btn-outline btn-block"
                  disabled
                  style={{
                    color: "var(--success)",
                    borderColor: "var(--success)",
                    background: "rgba(72, 187, 120, 0.05)",
                    cursor: "not-allowed"
                  }}
                >
                  <CheckCircle size={18} />
                  <span>Recovery Request Sent</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="btn btn-accent btn-block"
                >
                  <span>Claim Item</span>
                </button>
              )}
            </div>
          )}

          {/* Owner-Only Management Actions */}
          {isOwner && (
            <div className="owner-actions-panel">
              <span className="owner-actions-title">Management Actions</span>
              <div className="owner-buttons-row">
                {item.status === "active" && (
                  <button
                    onClick={triggerResolveConfirm}
                    className="btn btn-accent"
                    style={{ flex: 1, minWidth: "140px" }}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={16} />
                    <span>Mark Resolved</span>
                  </button>
                )}
                <Link
                  to={`/edit/${item._id}`}
                  className="btn btn-outline"
                  style={{ flex: 1, minWidth: "100px", justifyContent: "center" }}
                  disabled={actionLoading}
                >
                  <Edit2 size={16} />
                  <span>Edit Report</span>
                </Link>
                <button
                  onClick={triggerDeleteConfirm}
                  className="btn btn-danger"
                  style={{ flex: 1, minWidth: "100px" }}
                  disabled={actionLoading}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Matches Section (Only visible to the post owner) */}
      {isOwner && (
        <div className="matches-section">
          <div className="matches-title-row">
            <RefreshCw size={22} className={matchesLoading ? "spin" : ""} />
            <h2>Potential Auto Matches</h2>
          </div>

          {matchesLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <div className="spinner spinner-dark" />
            </div>
          ) : matches.length > 0 ? (
            <div className="matches-grid">
              {matches.map(({ item: matchItem, score }) => {
                const matchDate = matchItem.type === "lost" ? matchItem.dateLost : matchItem.dateFound;
                return (
                  <Link to={`/item/${matchItem._id}`} key={matchItem._id} className="match-card">
                    {/* Thumbnail preview */}
                    <div className="match-image-preview">
                      {matchItem.image ? (
                        <img src={matchItem.image} alt={matchItem.title} />
                      ) : (
                        <Compass size={20} className="text-muted" />
                      )}
                    </div>

                    {/* Information */}
                    <div className="match-info">
                      <span className="match-title">{matchItem.title}</span>
                      <div className="match-meta">
                        <span>Category: {matchItem.category}</span>
                        <span>Location: {matchItem.location}</span>
                        <span>Date: {formatDate(matchDate)}</span>
                      </div>
                    </div>

                    {/* Score badge */}
                    <div className="match-score-badge">
                      <span>{score}% Match</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "2rem", border: "1px dashed var(--border)" }}>
              <Compass size={28} style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }} />
              <h4 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>No current matches</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Our algorithms are checking for reported {isLost ? "found" : "lost"} items under this category. We will alert you immediately if a candidate is found!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recovery Request Modal */}
      {showClaimModal && (
        <div className="modal-overlay" onClick={() => setShowClaimModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Claim Item</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowClaimModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleClaimSubmit}>
              <div className="modal-body">
                <p>
                  You are sending a recovery request to the finder of this item. Please provide details (like contents, distinguishing marks, where you lost it) to help verify ownership.
                </p>
                
                {claimError && (
                  <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                    {claimError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="claim-message-textarea">
                    Message (Optional)
                  </label>
                  <textarea
                    id="claim-message-textarea"
                    className="form-textarea"
                    placeholder="Describe your item, contents, labels, or proof of ownership..."
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    disabled={claimSubmitLoading}
                    rows={4}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowClaimModal(false)}
                  disabled={claimSubmitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-accent"
                  disabled={claimSubmitLoading}
                >
                  {claimSubmitLoading ? (
                    <>
                      <div className="spinner spinner-dark" style={{ width: "1rem", height: "1rem", borderColor: "rgba(255, 255, 255, 0.3)", borderTopColor: "#fff" }} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        type={confirmModal.buttonType}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
