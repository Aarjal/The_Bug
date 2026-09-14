import { capitalize, formatDate } from "../../utils/helpers";
import "../../styles/AdminDashboard.css";

function ActivityRow({ report }) {
  const isResolved = report.status === "resolved";

  return (
    <tr>
      <td data-label="Title" className="activity-title">
        {report.title}
      </td>
      <td data-label="Type">
        <span className={`badge badge-${report.type}`}>
          {capitalize(report.type)}
        </span>
      </td>
      <td data-label="Status">
        <span className={`badge ${isResolved ? "badge-resolved" : "badge-active"}`}>
          {capitalize(report.status)}
        </span>
      </td>
      <td data-label="Owner" className="activity-owner">
        {report.ownerUsername}
      </td>
      <td data-label="Created" className="activity-date">
        {formatDate(report.createdAt)}
      </td>
    </tr>
  );
}

export default function ActivityTable({ items = [] }) {
  if (items.length === 0) {
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
          {items.map((report, index) => (
            <ActivityRow
              key={report._id || report.id || `${report.title}-${index}`}
              report={report}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
