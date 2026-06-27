import { capitalize, formatDate } from "../../utils/helpers";
import "../../styles/AdminDashboard.css";

/**
 * Displays the 10 most recent items in a table (desktop) or stacked cards (mobile).
 */
export default function ActivityTable({ items }) {
  if (!items || items.length === 0) {
    return <p className="admin-empty-text">No recent activity found.</p>;
  }

  return (
    <div className="activity-table-wrapper">
      <table className="activity-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td data-label="Title" className="activity-title">
                {item.title}
              </td>
              <td data-label="Type">
                <span className={`badge badge-${item.type}`}>
                  {capitalize(item.type)}
                </span>
              </td>
              <td data-label="Status">
                <span
                  className={`badge ${item.status === "resolved" ? "badge-resolved" : "badge-active"}`}
                >
                  {capitalize(item.status)}
                </span>
              </td>
              <td data-label="Owner" className="activity-owner">
                {item.ownerUsername}
              </td>
              <td data-label="Created" className="activity-date">
                {formatDate(item.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
