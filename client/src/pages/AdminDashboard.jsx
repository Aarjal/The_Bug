import { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Search,
  PackageCheck,
  CircleDot,
  CheckCircle2,
  ClipboardList,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Bell,
  LayoutDashboard,
  Activity,
  Layers,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { getAdminDashboard } from "../api/services";
import { getErrorMessage } from "../utils/helpers";
import StatCard from "../components/admin/StatCard";
import CategoryGrid from "../components/admin/CategoryGrid";
import ActivityTable from "../components/admin/ActivityTable";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAdminDashboard();
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ── Loading State (Modern Dashboard Skeleton) ──────────────────────────────
  if (loading) {
    return (
      <div className="container main-content">
        <div className="admin-header">
          <div className="skeleton-line" style={{ width: "250px", height: "32px", marginBottom: "0.5rem" }} />
          <div className="skeleton-line" style={{ width: "180px", height: "16px" }} />
        </div>
        
        <div className="admin-section" style={{ marginTop: "2rem" }}>
          <div className="skeleton-line" style={{ width: "120px", height: "20px", marginBottom: "1rem" }} />
          <div className="stat-grid">
            <div className="skeleton-card" style={{ height: "100px", borderRadius: "var(--radius-md)" }} />
            <div className="skeleton-card" style={{ height: "100px", borderRadius: "var(--radius-md)" }} />
          </div>
        </div>

        <div className="admin-section" style={{ marginTop: "2rem" }}>
          <div className="skeleton-line" style={{ width: "120px", height: "20px", marginBottom: "1rem" }} />
          <div className="stat-grid">
            <div className="skeleton-card" style={{ height: "100px", borderRadius: "var(--radius-md)" }} />
            <div className="skeleton-card" style={{ height: "100px", borderRadius: "var(--radius-md)" }} />
            <div className="skeleton-card" style={{ height: "100px", borderRadius: "var(--radius-md)" }} />
            <div className="skeleton-card" style={{ height: "100px", borderRadius: "var(--radius-md)" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────
  if (error) {
    return (
      <div className="container main-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="error-card card" style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
          <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>Failed to load dashboard</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error}</p>
          <button
            onClick={fetchDashboard}
            className="btn btn-primary"
            style={{ display: "inline-flex", margin: "0 auto", gap: "0.5rem" }}
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Empty State ────────────────────────────────
  if (!data) {
    return (
      <div className="container main-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="empty-state" style={{ padding: "4rem" }}>
          <ClipboardList size={32} className="text-muted" style={{ marginBottom: "1rem" }} />
          <h3>No data available</h3>
          <p className="text-secondary">Please check back later or contact database support.</p>
        </div>
      </div>
    );
  }

  const { users, items, recovery, notifications, categories, recentActivity } = data;

  return (
    <div className="container main-content">
      {/* Page Header */}
      <div className="admin-header">
        <h1>
          <LayoutDashboard
            size={28}
            style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
          />
          Admin Dashboard
        </h1>
        <p>Platform overview and analytics at a glance.</p>
      </div>

      {/* ── Users Section ─────────────────────────── */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          <Users size={18} /> Users
        </h2>
        <div className="stat-grid">
          <StatCard
            icon={Users}
            title="Total Users"
            value={users.total}
            color="blue"
          />
          <StatCard
            icon={ShieldCheck}
            title="Admins"
            value={users.admins}
            color="purple"
          />
        </div>
      </div>

      {/* ── Items Section ─────────────────────────── */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          <Layers size={18} /> Items
        </h2>
        <div className="stat-grid">
          <StatCard
            icon={Search}
            title="Lost Reports"
            value={items.totalLost}
            color="red"
          />
          <StatCard
            icon={PackageCheck}
            title="Found Reports"
            value={items.totalFound}
            color="green"
          />
          <StatCard
            icon={CircleDot}
            title="Active Items"
            value={items.totalActive}
            color="teal"
          />
          <StatCard
            icon={CheckCircle2}
            title="Resolved Items"
            value={items.totalResolved}
            color="indigo"
          />
        </div>
      </div>

      {/* ── Recovery Requests Section ─────────────── */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          <ClipboardList size={18} /> Recovery Requests
        </h2>
        <div className="stat-grid">
          <StatCard
            icon={ClipboardList}
            title="Total Requests"
            value={recovery.total}
            color="blue"
          />
          <StatCard
            icon={Clock}
            title="Pending"
            value={recovery.pending}
            color="amber"
          />
          <StatCard
            icon={ThumbsUp}
            title="Accepted"
            value={recovery.accepted}
            color="green"
          />
          <StatCard
            icon={ThumbsDown}
            title="Rejected"
            value={recovery.rejected}
            color="red"
          />
        </div>
      </div>

      {/* ── Notifications Section ─────────────────── */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          <Bell size={18} /> Notifications
        </h2>
        <div className="stat-grid">
          <StatCard
            icon={Bell}
            title="Total Notifications"
            value={notifications.total}
            color="indigo"
          />
        </div>
      </div>

      {/* ── Categories Section ────────────────────── */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          <Layers size={18} /> Categories
        </h2>
        <CategoryGrid categories={categories} />
      </div>

      {/* ── Recent Activity Section ───────────────── */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          <Activity size={18} /> Recent Activity
        </h2>
        <ActivityTable items={recentActivity} />
      </div>
    </div>
  );
}
