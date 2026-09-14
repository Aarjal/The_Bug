import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
  Inbox,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  getReceivedRecoveryRequests,
  getSentRecoveryRequests,
  acceptRecoveryRequest,
  rejectRecoveryRequest,
  markClaimsRead,
} from "../api/services";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import { formatDate } from "../utils/helpers";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/Claims.css";

function ContactMethodIcon({ method }) {
  switch (method?.toLowerCase()) {
    case "phone":
      return <Phone size={16} aria-hidden="true" />;
    case "whatsapp":
      return <MessageCircle size={16} aria-hidden="true" />;
    case "email":
      return <Mail size={16} aria-hidden="true" />;
    default:
      return <ExternalLink size={16} aria-hidden="true" />;
  }
}

function ContactRevealBox({ user }) {
  if (!user || !user.contactMethod) return null;

  return (
    <div className="contact-reveal-box">
      <div className="contact-box-header">
        <strong>Contact Information</strong>
      </div>
      <div className="contact-box-body">
        <div className="contact-item">
          <ContactMethodIcon method={user.contactMethod} />
          <span className="contact-label">{user.contactMethod}:</span>
          <span className="contact-value">{user.contactValue}</span>
        </div>
      </div>
    </div>
  );
}

function ClaimStatusBadge({ status }) {
  const isPending = status === "pending";
  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";

  return (
    <div className="claim-status-row">
      <span className="status-label">Status:</span>
      <span className={`status-badge ${status}`}>
        {isPending && <Clock size={12} />}
        {isAccepted && <CheckCircle size={12} />}
        {isRejected && <XCircle size={12} />}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    </div>
  );
}

function RecoveryRequestCard({
  request,
  activeTab,
  actionLoadingId,
  onRequestDecision,
}) {
  const isPending = request.status === "pending";
  const isAccepted = request.status === "accepted";
  const isRejected = request.status === "rejected";
  const canRespond = activeTab === "received" && isPending;
  const targetItem = request.item;
  const partnerUser = activeTab === "received" ? request.claimant : request.finder;
  const isProcessing = actionLoadingId === request._id;

  return (
    <div className={`claim-card ${request.status}`}>
      <div className="claim-card-header">
        <div className="claim-item-details">
          <span className="claim-item-tag">Found Item</span>
          {targetItem ? (
            <Link to={`/item/${targetItem._id}`} className="claim-item-title-link">
              {targetItem.title}
            </Link>
          ) : (
            <span className="claim-item-title-deleted">[Deleted Item]</span>
          )}
        </div>
        <div className="claim-date">
          <Calendar size={14} aria-hidden="true" />
          <span>{formatDate(request.createdAt)}</span>
        </div>
      </div>

      <div className="claim-card-body">
        <div className="claim-user-info">
          <User size={16} aria-hidden="true" />
          <span>
            {activeTab === "received" ? "Claimant: " : "Finder: "}
            <strong>{partnerUser?.username || "Unknown User"}</strong>
          </span>
        </div>

        {request.message && (
          <div className="claim-message-box">
            <div className="message-box-header">
              <MessageSquare size={14} aria-hidden="true" />
              <span>Message:</span>
            </div>
            <p className="claim-message-text">{request.message}</p>
          </div>
        )}

        <ClaimStatusBadge status={request.status} />

        {isAccepted && partnerUser && <ContactRevealBox user={partnerUser} />}

        {isRejected && (
          <div className="claim-rejected-box">
            <XCircle size={16} aria-hidden="true" />
            <span>Recovery Request Rejected</span>
          </div>
        )}

        {isAccepted && (
          <div className="claim-approved-box">
            <CheckCircle size={16} aria-hidden="true" />
            <span>Recovery Approved</span>
          </div>
        )}
      </div>

      {canRespond && (
        <div className="claim-card-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onRequestDecision(request._id, "reject")}
            disabled={isProcessing}
          >
            Reject
          </button>
          <button
            type="button"
            className="btn btn-accent btn-sm"
            onClick={() => onRequestDecision(request._id, "accept")}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Accept"}
          </button>
        </div>
      )}
    </div>
  );
}

function ClaimsTabsNavigation({
  activeTab,
  onTabChange,
  receivedCount,
  sentCount,
  unreadReceivedCount,
  unreadSentCount,
}) {
  return (
    <div className="claims-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "received"}
        className={`claims-tab ${activeTab === "received" ? "active" : ""}`}
        onClick={() => onTabChange("received")}
        style={{ position: "relative" }}
      >
        Received Claims ({receivedCount})
        {unreadReceivedCount > 0 && (
          <span
            style={{
              marginLeft: "0.5rem",
              background: "var(--danger)",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: "bold",
              borderRadius: "50%",
              minWidth: "16px",
              height: "16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {unreadReceivedCount}
          </span>
        )}
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "sent"}
        className={`claims-tab ${activeTab === "sent" ? "active" : ""}`}
        onClick={() => onTabChange("sent")}
        style={{ position: "relative" }}
      >
        Sent Claims ({sentCount})
        {unreadSentCount > 0 && (
          <span
            style={{
              marginLeft: "0.5rem",
              background: "var(--danger)",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: "bold",
              borderRadius: "50%",
              minWidth: "16px",
              height: "16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {unreadSentCount}
          </span>
        )}
      </button>
    </div>
  );
}

function ClaimsSkeletonGrid() {
  return (
    <div className="claims-grid">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton-card"
          style={{ height: "200px", padding: "1.5rem", borderRadius: "var(--radius-md)" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="skeleton-line" style={{ width: "25%" }} />
              <div className="skeleton-line" style={{ width: "35%" }} />
            </div>
            <div className="skeleton-line" style={{ width: "50%", height: "22px" }} />
            <div className="skeleton-line" style={{ width: "80%" }} />
            <div className="skeleton-line" style={{ width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ClaimsEmptyState({ activeTab }) {
  return (
    <div className="empty-state" style={{ padding: "4rem" }}>
      <Inbox size={48} className="text-muted" style={{ marginBottom: "1rem" }} />
      <h3>No recovery requests</h3>
      <p className="text-secondary">
        {activeTab === "received"
          ? "You haven't received any recovery claims for your found items yet."
          : "You haven't submitted any recovery claims for found items yet."}
      </p>
    </div>
  );
}

export default function RecoveryRequests() {
  const { fetchUnreadCount } = useNotifications();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("received");
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    requestId: "",
    actionType: "",
    title: "",
    message: "",
    buttonType: "warning",
    confirmText: "Confirm",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchClaims() {
      try {
        const [receivedRes, sentRes] = await Promise.all([
          getReceivedRecoveryRequests(),
          getSentRecoveryRequests(),
        ]);
        if (!isMounted) return;
        setReceivedRequests(receivedRes.data.requests || []);
        setSentRequests(sentRes.data.requests || []);
        setError("");

        const currentRole = activeTab === "received" ? "finder" : "claimant";
        await markClaimsRead(currentRole);
        if (isMounted) {
          fetchUnreadCount();
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load claims:", err);
        if (isMounted) {
          setError("Failed to load recovery requests.");
          setLoading(false);
        }
      }
    }

    fetchClaims();

    return () => {
      isMounted = false;
    };
  }, [activeTab, fetchUnreadCount, reloadTrigger]);

  const handlePromptDecision = (requestId, decision) => {
    const isApproving = decision === "accept";

    setConfirmationDialog({
      isOpen: true,
      requestId,
      actionType: decision,
      title: isApproving ? "Approve Claim" : "Reject Claim",
      message: isApproving
        ? "Are you sure you want to approve this recovery claim? This will share your contact information with the claimant."
        : "Are you sure you want to reject this recovery claim?",
      buttonType: isApproving ? "warning" : "danger",
      confirmText: isApproving ? "Approve" : "Reject",
    });
  };

  const handleExecuteDecision = async () => {
    const { requestId, actionType } = confirmationDialog;
    setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
    setActionLoadingId(requestId);

    try {
      if (actionType === "accept") {
        const { data } = await acceptRecoveryRequest(requestId);
        addToast("Claim approved successfully!", "success");
        setReceivedRequests((prev) =>
          prev.map((req) => (req._id === requestId ? data.request : req))
        );
      } else {
        const { data } = await rejectRecoveryRequest(requestId);
        addToast("Claim rejected.", "info");
        setReceivedRequests((prev) =>
          prev.map((req) => (req._id === requestId ? data.request : req))
        );
      }
    } catch (err) {
      console.error(`Failed to ${actionType} claim:`, err);
      addToast(err.response?.data?.message || `Failed to ${actionType} claim.`, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setReloadTrigger((prev) => prev + 1);
  };

  const unreadReceivedCount = receivedRequests.filter((r) => r.readByFinder === false).length;
  const unreadSentCount = sentRequests.filter((r) => r.readByClaimant === false).length;
  const visibleRequests = activeTab === "received" ? receivedRequests : sentRequests;

  return (
    <div className="container main-content">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1>Recovery Requests</h1>
        <p className="page-subtitle">Review claims for found items and coordinate handovers.</p>
      </div>

      <ClaimsTabsNavigation
        activeTab={activeTab}
        onTabChange={(nextTab) => {
          setLoading(true);
          setActiveTab(nextTab);
        }}
        receivedCount={receivedRequests.length}
        sentCount={sentRequests.length}
        unreadReceivedCount={unreadReceivedCount}
        unreadSentCount={unreadSentCount}
      />

      {loading ? (
        <ClaimsSkeletonGrid />
      ) : error ? (
        <div className="error-card card" style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
          <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>Failed to load requests</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="btn btn-primary"
            style={{ display: "inline-flex", margin: "0 auto", gap: "0.5rem" }}
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : visibleRequests.length === 0 ? (
        <ClaimsEmptyState activeTab={activeTab} />
      ) : (
        <div className="claims-grid">
          {visibleRequests.map((request) => (
            <RecoveryRequestCard
              key={request._id}
              request={request}
              activeTab={activeTab}
              actionLoadingId={actionLoadingId}
              onRequestDecision={handlePromptDecision}
            />
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        confirmText={confirmationDialog.confirmText}
        cancelText="Cancel"
        type={confirmationDialog.buttonType}
        onConfirm={handleExecuteDecision}
        onCancel={() => setConfirmationDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
