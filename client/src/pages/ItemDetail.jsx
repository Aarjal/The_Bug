import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Compass,
  User,
  Edit2,
  CheckCircle,
  Trash2,
  ArrowLeft,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import {
  getItem,
  deleteItem,
  resolveItem,
  getItemMatches,
  createRecoveryRequest,
  getSentRecoveryRequests,
} from "../api/services";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import { formatDate } from "../utils/helpers";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/DetailAndMyItems.css";

function ItemMediaPreview({ image, title, isResolved }) {
  return (
    <div className="detail-image-section">
      <div className={`detail-image-wrapper ${isResolved ? "resolved" : ""}`}>
        {image ? (
          <img src={image} alt={title} className="detail-image" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <Compass size={48} strokeWidth={1.5} aria-hidden="true" />
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>No Image Preview Available</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemMetadataSummary({ item, isLost, incidentDate }) {
  return (
    <>
      <div className="detail-header-row">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div className="detail-meta-pills">
            <span className={`badge ${isLost ? "badge-lost" : "badge-found"}`}>{item.type}</span>
            <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text)" }}>
              {item.category}
            </span>
            {item.status === "resolved" && <span className="badge badge-resolved">Resolved</span>}
          </div>
          <h1 className="detail-title">{item.title}</h1>
        </div>
      </div>

      <div className="detail-desc-box">
        <h2 className="detail-desc-title">Description</h2>
        <p className="detail-desc-text">{item.description}</p>
      </div>

      <div className="detail-grid-info">
        <div className="detail-info-item">
          <MapPin size={18} aria-hidden="true" />
          <span>
            <strong>Location:</strong> {item.location}
          </span>
        </div>
        <div className="detail-info-item">
          <Calendar size={18} aria-hidden="true" />
          <span>
            <strong>Date {isLost ? "Lost" : "Found"}:</strong> {formatDate(incidentDate)}
          </span>
        </div>
        <div className="detail-info-item">
          <User size={18} aria-hidden="true" />
          <span>
            <strong>Reported By:</strong> {item.userId?.username || "Community Member"}
          </span>
        </div>
      </div>
    </>
  );
}

function ItemClaimPanel({ hasSentRequest, onRequestClaim }) {
  return (
    <div className="claim-action-panel" style={{ marginTop: "1.5rem" }}>
      {hasSentRequest ? (
        <button
          className="btn btn-outline btn-block"
          disabled
          style={{
            color: "var(--success)",
            borderColor: "var(--success)",
            background: "rgba(72, 187, 120, 0.05)",
            cursor: "not-allowed",
          }}
        >
          <CheckCircle size={18} />
          <span>Recovery Request Sent</span>
        </button>
      ) : (
        <button type="button" onClick={onRequestClaim} className="btn btn-accent btn-block">
          <span>Claim Item</span>
        </button>
      )}
    </div>
  );
}

function ItemOwnerActions({ itemId, isActive, isActionPending, onResolveClick, onDeleteClick }) {
  return (
    <div className="owner-actions-panel">
      <span className="owner-actions-title">Management Actions</span>
      <div className="owner-buttons-row">
        {isActive && (
          <button
            type="button"
            onClick={onResolveClick}
            className="btn btn-accent"
            style={{ flex: 1, minWidth: "140px" }}
            disabled={isActionPending}
          >
            <CheckCircle size={16} />
            <span>Mark Resolved</span>
          </button>
        )}
        <Link
          to={`/edit/${itemId}`}
          className="btn btn-outline"
          style={{ flex: 1, minWidth: "100px", justifyContent: "center" }}
        >
          <Edit2 size={16} />
          <span>Edit Report</span>
        </Link>
        <button
          type="button"
          onClick={onDeleteClick}
          className="btn btn-danger"
          style={{ flex: 1, minWidth: "100px" }}
          disabled={isActionPending}
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

function MatchedItemsSection({ matches, isLostItem }) {
  return (
    <div className="matches-section">
      <div className="matches-title-row">
        <RefreshCw size={22} aria-hidden="true" />
        <h2>Potential Auto Matches</h2>
      </div>

      {matches.length > 0 ? (
        <div className="matches-grid">
          {matches.map(({ item: matchedReport, score }) => {
            const reportDate =
              matchedReport.type === "lost" ? matchedReport.dateLost : matchedReport.dateFound;

            return (
              <Link to={`/item/${matchedReport._id}`} key={matchedReport._id} className="match-card">
                <div className="match-image-preview">
                  {matchedReport.image ? (
                    <img src={matchedReport.image} alt={matchedReport.title} />
                  ) : (
                    <Compass size={20} className="text-muted" aria-hidden="true" />
                  )}
                </div>

                <div className="match-info">
                  <span className="match-title">{matchedReport.title}</span>
                  <div className="match-meta">
                    <span>Category: {matchedReport.category}</span>
                    <span>Location: {matchedReport.location}</span>
                    <span>Date: {formatDate(reportDate)}</span>
                  </div>
                </div>

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
            Our matching engine scans for counterpart {isLostItem ? "found" : "lost"} listings under this
            category. You will be alerted the moment a candidate is posted.
          </p>
        </div>
      )}
    </div>
  );
}

function ClaimItemModal({ isOpen, onClose, onSubmit, message, onMessageChange, isSubmitting, error }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Claim Item</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <p>
              You are sending a recovery request to the finder of this item. Please provide details (like
              contents, distinguishing marks, where you lost it) to help verify ownership.
            </p>

            {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="claim-message-textarea">
                Message (Optional)
              </label>
              <textarea
                id="claim-message-textarea"
                className="form-textarea"
                placeholder="Describe your item, contents, labels, or proof of ownership..."
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div
                    className="spinner spinner-dark"
                    style={{
                      width: "1rem",
                      height: "1rem",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      borderTopColor: "#fff",
                    }}
                  />
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
  );
}

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { fetchUnreadCount } = useNotifications();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isActionPending, setIsActionPending] = useState(false);

  const [autoMatches, setAutoMatches] = useState([]);

  const [hasSentClaimRequest, setHasSentClaimRequest] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimNote, setClaimNote] = useState("");
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [claimErrorMessage, setClaimErrorMessage] = useState("");

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    actionType: "",
    title: "",
    message: "",
    buttonType: "warning",
    confirmText: "Confirm",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadItemAndContext() {
      try {
        const { data: itemData } = await getItem(id);
        if (!isMounted) return;
        setItem(itemData);

        const ownerId = itemData.userId?._id || itemData.userId;
        const isPostOwner = user && ownerId && user._id.toString() === ownerId.toString();

        if (isPostOwner) {
          try {
            const { data: matchesData } = await getItemMatches(id);
            if (isMounted) setAutoMatches(matchesData);
          } catch (matchErr) {
            console.error("Failed to load potential item matches:", matchErr);
          }
        } else if (user && itemData.type === "found") {
          try {
            const { data: sentData } = await getSentRecoveryRequests();
            const alreadyRequested = (sentData.requests || []).some((req) => {
              const requestedItemId = req.item?._id || req.item;
              return requestedItemId.toString() === id.toString();
            });
            if (isMounted) setHasSentClaimRequest(alreadyRequested);
          } catch (requestErr) {
            console.error("Failed to load existing recovery requests:", requestErr);
          }
        }
      } catch {
        if (isMounted) setErrorMessage("Report not found or has been deleted.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadItemAndContext();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const requestResolveConfirmation = () => {
    setConfirmDialog({
      isOpen: true,
      actionType: "resolve",
      title: "Resolve Item",
      message: "Are you sure you want to mark this item as resolved?",
      buttonType: "warning",
      confirmText: "Resolve",
    });
  };

  const requestDeleteConfirmation = () => {
    setConfirmDialog({
      isOpen: true,
      actionType: "delete",
      title: "Delete Report",
      message: "Are you sure you want to permanently delete this report? This cannot be undone.",
      buttonType: "danger",
      confirmText: "Delete",
    });
  };

  const handleExecuteConfirmedAction = async () => {
    const { actionType } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    setIsActionPending(true);

    if (actionType === "resolve") {
      try {
        const { data: updatedItem } = await resolveItem(id);
        setItem(updatedItem);
        addToast("Item successfully marked as resolved!", "success");
      } catch {
        addToast("Failed to mark item as resolved. Please try again.", "error");
      } finally {
        setIsActionPending(false);
      }
    } else if (actionType === "delete") {
      try {
        await deleteItem(id);
        addToast("Report deleted successfully.", "success");
        navigate("/", { replace: true });
      } catch {
        addToast("Failed to delete report. Please try again.", "error");
        setIsActionPending(false);
      }
    }
  };

  const handleClaimSubmission = async (event) => {
    event.preventDefault();
    setIsClaimSubmitting(true);
    setClaimErrorMessage("");
    try {
      await createRecoveryRequest({
        itemId: id,
        message: claimNote,
      });
      addToast("Recovery request submitted successfully!", "success");
      setHasSentClaimRequest(true);
      setIsClaimModalOpen(false);
      setClaimNote("");
      fetchUnreadCount();
    } catch (err) {
      setClaimErrorMessage(err.response?.data?.message || "Failed to submit recovery request.");
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div className="spinner spinner-dark" style={{ width: "2.5rem", height: "2.5rem" }} />
      </div>
    );
  }

  if (errorMessage || !item) {
    return (
      <div className="container main-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
        <div className="error-card card" style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
          <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>Report Not Found</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            {errorMessage || "The report you are looking for has been deleted or does not exist."}
          </p>
          <button onClick={() => navigate("/")} className="btn btn-primary" style={{ margin: "0 auto" }}>
            Go to Home Feed
          </button>
        </div>
      </div>
    );
  }

  const isLost = item.type === "lost";
  const incidentDate = isLost ? item.dateLost : item.dateFound;
  const itemOwnerId = item.userId?._id || item.userId;
  const isPostOwner = user && itemOwnerId && user._id.toString() === itemOwnerId.toString();

  return (
    <div className="container main-content">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn btn-outline"
        style={{ alignSelf: "flex-start", marginBottom: "1.5rem", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="detail-layout">
        <ItemMediaPreview image={item.image} title={item.title} isResolved={item.status === "resolved"} />

        <div className="detail-info-section">
          <ItemMetadataSummary item={item} isLost={isLost} incidentDate={incidentDate} />

          {!isPostOwner && user && item.type === "found" && item.status === "active" && (
            <ItemClaimPanel
              hasSentRequest={hasSentClaimRequest}
              onRequestClaim={() => setIsClaimModalOpen(true)}
            />
          )}

          {isPostOwner && (
            <ItemOwnerActions
              itemId={item._id}
              isActive={item.status === "active"}
              isActionPending={isActionPending}
              onResolveClick={requestResolveConfirmation}
              onDeleteClick={requestDeleteConfirmation}
            />
          )}
        </div>
      </div>

      {isPostOwner && (
        <MatchedItemsSection
          matches={autoMatches}
          isLostItem={isLost}
        />
      )}

      <ClaimItemModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSubmit={handleClaimSubmission}
        message={claimNote}
        onMessageChange={setClaimNote}
        isSubmitting={isClaimSubmitting}
        error={claimErrorMessage}
      />

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
