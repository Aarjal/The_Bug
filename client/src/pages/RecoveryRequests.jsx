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
  Inbox
} from "lucide-react";
import { 
  getReceivedRecoveryRequests, 
  getSentRecoveryRequests, 
  acceptRecoveryRequest, 
  rejectRecoveryRequest 
} from "../api/services";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/helpers";
import "../styles/Claims.css";

export default function RecoveryRequests() {
  const [activeTab, setActiveTab] = useState("received"); // "received" | "sent"
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  const { addToast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        getReceivedRecoveryRequests(),
        getSentRecoveryRequests()
      ]);
      setReceivedRequests(receivedRes.data.requests || []);
      setSentRequests(sentRes.data.requests || []);
    } catch (err) {
      console.error("Failed to fetch recovery requests:", err);
      addToast("Failed to load recovery requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, action) => {
    const confirmationMsg = action === "accept" 
      ? "Are you sure you want to approve this recovery claim? This will share your contact information with the claimant." 
      : "Are you sure you want to reject this recovery claim?";
      
    if (!window.confirm(confirmationMsg)) return;

    setActionLoadingId(id);
    try {
      if (action === "accept") {
        const { data } = await acceptRecoveryRequest(id);
        addToast("Claim approved successfully!", "success");
        // Update local state
        setReceivedRequests(prev => 
          prev.map(req => req._id === id ? data.request : req)
        );
      } else {
        const { data } = await rejectRecoveryRequest(id);
        addToast("Claim rejected.", "info");
        // Update local state
        setReceivedRequests(prev => 
          prev.map(req => req._id === id ? data.request : req)
        );
      }
    } catch (err) {
      console.error(`Failed to ${action} claim:`, err);
      addToast(err.response?.data?.message || `Failed to ${action} claim.`, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getContactIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "phone":
        return <Phone size={16} />;
      case "whatsapp":
        return <MessageCircle size={16} />;
      case "email":
        return <Mail size={16} />;
      default:
        return <ExternalLink size={16} />;
    }
  };

  const renderContactInfo = (userObj) => {
    if (!userObj || !userObj.contactMethod) return null;
    return (
      <div className="contact-reveal-box">
        <div className="contact-box-header">
          <strong>Contact Information</strong>
        </div>
        <div className="contact-box-body">
          <div className="contact-item">
            {getContactIcon(userObj.contactMethod)}
            <span className="contact-label">{userObj.contactMethod}:</span>
            <span className="contact-value">{userObj.contactValue}</span>
          </div>
        </div>
      </div>
    );
  };

  const currentRequests = activeTab === "received" ? receivedRequests : sentRequests;

  return (
    <div className="container main-content">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1>Recovery Requests</h1>
        <p className="page-subtitle">Review claims for found items and coordinate handovers.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="claims-tabs">
        <button 
          className={`claims-tab ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Received Claims ({receivedRequests.length})
        </button>
        <button 
          className={`claims-tab ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          Sent Claims ({sentRequests.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div className="spinner" />
        </div>
      ) : currentRequests.length === 0 ? (
        <div className="empty-state" style={{ padding: "4rem" }}>
          <Inbox size={48} className="text-muted" style={{ marginBottom: "1rem" }} />
          <h3>No requests found</h3>
          <p className="text-secondary">
            {activeTab === "received" 
              ? "You haven't received any recovery claims for your found items yet."
              : "You haven't submitted any recovery claims for found items yet."}
          </p>
        </div>
      ) : (
        <div className="claims-grid">
          {currentRequests.map((req) => {
            const isPending = req.status === "pending";
            const isAccepted = req.status === "accepted";
            const isRejected = req.status === "rejected";
            const showButtons = activeTab === "received" && isPending;
            const targetItem = req.item;

            // In received tab, target is the claimant. In sent tab, target is the finder.
            const partnerUser = activeTab === "received" ? req.claimant : req.finder;

            return (
              <div key={req._id} className={`claim-card ${req.status}`}>
                {/* Header: Item & date */}
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
                    <Calendar size={14} />
                    <span>{formatDate(req.createdAt)}</span>
                  </div>
                </div>

                {/* Body: user & message */}
                <div className="claim-card-body">
                  <div className="claim-user-info">
                    <User size={16} />
                    <span>
                      {activeTab === "received" ? "Claimant: " : "Finder: "}
                      <strong>{partnerUser?.username || "Unknown User"}</strong>
                    </span>
                  </div>

                  {req.message && (
                    <div className="claim-message-box">
                      <div className="message-box-header">
                        <MessageSquare size={14} />
                        <span>Message:</span>
                      </div>
                      <p className="claim-message-text">{req.message}</p>
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className="claim-status-row">
                    <span className="status-label">Status:</span>
                    <span className={`status-badge ${req.status}`}>
                      {isPending && <Clock size={12} />}
                      {isAccepted && <CheckCircle size={12} />}
                      {isRejected && <XCircle size={12} />}
                      <span>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                    </span>
                  </div>

                  {/* Contact reveal (only if accepted) */}
                  {isAccepted && partnerUser && renderContactInfo(partnerUser)}

                  {/* Rejected placeholder */}
                  {isRejected && (
                    <div className="claim-rejected-box">
                      <XCircle size={16} />
                      <span>Recovery Request Rejected</span>
                    </div>
                  )}

                  {/* Approved status banner */}
                  {isAccepted && (
                    <div className="claim-approved-box">
                      <CheckCircle size={16} />
                      <span>Recovery Approved</span>
                    </div>
                  )}
                </div>

                {/* Footer action buttons (Only for received pending requests) */}
                {showButtons && (
                  <div className="claim-card-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleStatusUpdate(req._id, "reject")}
                      disabled={actionLoadingId === req._id}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => handleStatusUpdate(req._id, "accept")}
                      disabled={actionLoadingId === req._id}
                    >
                      {actionLoadingId === req._id ? "Processing..." : "Accept"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
