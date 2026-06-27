import "../../styles/AdminDashboard.css";

/**
 * Reusable statistics card with icon, title, and numeric value.
 * Accepts an optional `color` prop that maps to a CSS modifier class.
 */
export default function StatCard({ icon: Icon, title, value, color = "blue" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon stat-icon--${color}`}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value ?? "—"}</span>
      </div>
    </div>
  );
}
