import "../../styles/AdminDashboard.css";

export default function StatCard({ icon: Icon, title, value, color = "blue" }) {
  const displayValue = value !== undefined && value !== null ? value : "—";

  return (
    <div className="stat-card">
      <div className={`stat-icon stat-icon--${color}`}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{displayValue}</span>
      </div>
    </div>
  );
}
