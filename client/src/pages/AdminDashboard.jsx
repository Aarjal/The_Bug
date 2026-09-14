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
  RefreshCw,
} from "lucide-react";
import { getAdminDashboard } from "../api/services";
import { getErrorMessage } from "../utils/helpers";
import StatCard from "../components/admin/StatCard";
import CategoryGrid from "../components/admin/CategoryGrid";
import ActivityTable from "../components/admin/ActivityTable";
import "../styles/AdminDashboard.css";

function AdminDashboardHeader() {
  return (
    <div className="admin-header">
      <h1>
        <LayoutDashboard size={28} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} aria-hidden="true" />
        Admin Dashboard
      </h1>
      <p>Platform overview and analytics at a glance.</p>
    </div>
  );
}

function AdminSectionHeader({ icon: Icon, title }) {
  return (
    <h2 className="admin-section-title">
      <Icon size={18} aria-hidden="true" /> {title}
    </h2>
  );
}

function AdminDashboardSkeleton() {
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

function AdminDashboardError({ message, onRetry }) {
  return (
    <div className="container main-content">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
      </div>
      <div className="error-card card" style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
        <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} aria-hidden="true" />
        <h3 style={{ marginBottom: "0.5rem" }}>Failed to load dashboard</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-primary"
          style={{ display: "inline-flex", margin: "0 auto", gap: "0.5rem" }}
        >
          <RefreshCw size={16} aria-hidden="true" />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      try {
        const { data } = await getAdminDashboard();
        if (isMounted) {
          setDashboardData(data);
          setErrorMessage("");
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(getErrorMessage(err));
          setIsLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handleRetry = () => {
    setIsLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (errorMessage) {
    return <AdminDashboardError message={errorMessage} onRetry={handleRetry} />;
  }

  if (!dashboardData) {
    return (
      <div className="container main-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="empty-state" style={{ padding: "4rem" }}>
          <ClipboardList size={32} className="text-muted" style={{ marginBottom: "1rem" }} aria-hidden="true" />
          <h3>No data available</h3>
          <p className="text-secondary">Please check back later or contact database support.</p>
        </div>
      </div>
    );
  }

  const { users, items, recovery, notifications, categories, recentActivity } = dashboardData;

  return (
    <div className="container main-content">
      <AdminDashboardHeader />

      <div className="admin-section">
        <AdminSectionHeader icon={Users} title="Users" />
        <div className="stat-grid">
          <StatCard icon={Users} title="Total Users" value={users.total} color="blue" />
          <StatCard icon={ShieldCheck} title="Admins" value={users.admins} color="purple" />
        </div>
      </div>

      <div className="admin-section">
        <AdminSectionHeader icon={Layers} title="Items" />
        <div className="stat-grid">
          <StatCard icon={Search} title="Lost Reports" value={items.totalLost} color="red" />
          <StatCard icon={PackageCheck} title="Found Reports" value={items.totalFound} color="green" />
          <StatCard icon={CircleDot} title="Active Items" value={items.totalActive} color="teal" />
          <StatCard icon={CheckCircle2} title="Resolved Items" value={items.totalResolved} color="indigo" />
        </div>
      </div>

      <div className="admin-section">
        <AdminSectionHeader icon={ClipboardList} title="Recovery Requests" />
        <div className="stat-grid">
          <StatCard icon={ClipboardList} title="Total Requests" value={recovery.total} color="blue" />
          <StatCard icon={Clock} title="Pending" value={recovery.pending} color="amber" />
          <StatCard icon={ThumbsUp} title="Accepted" value={recovery.accepted} color="green" />
          <StatCard icon={ThumbsDown} title="Rejected" value={recovery.rejected} color="red" />
        </div>
      </div>

      <div className="admin-section">
        <AdminSectionHeader icon={Bell} title="Notifications" />
        <div className="stat-grid">
          <StatCard icon={Bell} title="Total Notifications" value={notifications.total} color="indigo" />
        </div>
      </div>

      <div className="admin-section">
        <AdminSectionHeader icon={Layers} title="Categories" />
        <CategoryGrid categories={categories} />
      </div>

      <div className="admin-section">
        <AdminSectionHeader icon={Activity} title="Recent Activity" />
        <ActivityTable items={recentActivity} />
      </div>
    </div>
  );
}
