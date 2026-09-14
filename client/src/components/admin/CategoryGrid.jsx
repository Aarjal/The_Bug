import { Tag } from "lucide-react";
import { capitalize } from "../../utils/helpers";
import "../../styles/AdminDashboard.css";

export default function CategoryGrid({ categories = {} }) {
  const categoryEntries = Object.entries(categories);

  if (categoryEntries.length === 0) {
    return <p className="admin-empty-text">No category data available.</p>;
  }

  return (
    <div className="category-grid">
      {categoryEntries.map(([categoryName, itemCount]) => (
        <div key={categoryName} className="category-card">
          <div className="category-icon">
            <Tag size={16} aria-hidden="true" />
          </div>
          <div className="category-info">
            <span className="category-name">{capitalize(categoryName)}</span>
            <span className="category-count">{itemCount}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
