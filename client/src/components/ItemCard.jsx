import { Link } from "react-router-dom";
import { MapPin, Calendar, Compass, ChevronRight } from "lucide-react";
import { formatRelativeTime } from "../utils/helpers";

function getUserInitials(name) {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

function ItemCardThumbnail({ image, title, isLost, type }) {
  return (
    <div className="item-image-wrapper">
      <span className={`badge item-badge-type ${isLost ? "badge-lost" : "badge-found"}`}>
        {type}
      </span>
      {image ? (
        <img src={image} alt={title} className="item-image" loading="lazy" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
          <Compass size={32} strokeWidth={1.5} aria-hidden="true" />
          <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>No Image Preview</span>
        </div>
      )}
    </div>
  );
}

function ReporterAvatar({ reporter }) {
  const hasPhoto = Boolean(reporter?.profilePicture);
  const username = reporter?.username || "Community User";

  return (
    <div className="item-user">
      <div className="avatar item-avatar-mini">
        {hasPhoto ? (
          <img src={reporter.profilePicture} alt={username} />
        ) : (
          <span>{getUserInitials(username)}</span>
        )}
      </div>
      <span className="item-username">{username}</span>
    </div>
  );
}

export default function ItemCard({ item }) {
  const {
    _id,
    type,
    title,
    category,
    description,
    image,
    location,
    dateLost,
    dateFound,
    status,
    userId: reporter,
    createdAt,
  } = item;

  const isLost = type === "lost";
  const incidentDate = isLost ? dateLost : dateFound;
  const isResolved = status === "resolved";

  return (
    <div className={`card item-card ${status} ${isResolved ? "resolved" : ""}`}>
      <ItemCardThumbnail image={image} title={title} isLost={isLost} type={type} />

      <div className="item-card-body">
        <div className="item-meta-top">
          <span className="item-category-pill">{category}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <Calendar size={12} aria-hidden="true" />
            {formatRelativeTime(incidentDate || createdAt)}
          </span>
        </div>

        <h3 className="item-card-title">{title}</h3>
        <p className="item-card-desc">{description}</p>

        <div className="item-location">
          <MapPin size={14} aria-hidden="true" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {location}
          </span>
        </div>
      </div>

      <div className="item-card-footer">
        <ReporterAvatar reporter={reporter} />

        <Link
          to={`/item/${_id}`}
          className="btn btn-outline btn-sm"
          style={{ padding: "0.35rem 0.75rem", gap: "0.25rem", fontSize: "0.8rem" }}
        >
          <span>Details</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
