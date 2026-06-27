import { Tag } from "lucide-react";
import { capitalize } from "../../utils/helpers";
import "../../styles/AdminDashboard.css";

/**
 * Displays item categories in a responsive grid.
 * Each card shows category name + count.
 */
export default function CategoryGrid({ categories }) {
  const entries = Object.entries(categories || {});

  if (entries.length === 0) {
    return <p className="admin-empty-text">No category data available.</p>;
  }

  return (
    <div className="category-grid">
      {entries.map(([name, count]) => (
        <div key={name} className="category-card">
          <div className="category-icon">
            <Tag size={16} />
          </div>
          <div className="category-info">
            <span className="category-name">{capitalize(name)}</span>
            <span className="category-count">{count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
