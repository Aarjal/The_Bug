import { Link } from "react-router-dom";
import { MapPin, Calendar, Compass, ChevronRight } from "lucide-react";
import { formatRelativeTime } from "../utils/helpers";

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
    userId,
    createdAt,
  } = item;

  const isLost = type === "lost";
  const itemDate = isLost ? dateLost : dateFound;

  const getInitials = (name) => {
    if (!name) return "?";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`card item-card ${status} ${status === "resolved" ? "resolved" : ""}`}>
      {/* Image Preview Block */}
      <div className="item-image-wrapper">
        <span className={`badge item-badge-type ${isLost ? "badge-lost" : "badge-found"}`}>
          {type}
        </span>
        {image ? (
          <img src={image} alt={title} className="item-image" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
            <Compass size={32} strokeWidth={1.5} />
            <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>No Image Preview</span>
          </div>
        )}
      </div>

      {/* Card Info Body */}
      <div className="item-card-body">
        <div className="item-meta-top">
          <span className="item-category-pill">{category}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <Calendar size={12} />
            {formatRelativeTime(itemDate || createdAt)}
          </span>
        </div>

        <h3 className="item-card-title">{title}</h3>
        <p className="item-card-desc">{description}</p>

        <div className="item-location">
          <MapPin size={14} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {location}
          </span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="item-card-footer">
        <div className="item-user">
          <div className="avatar item-avatar-mini">
            {userId?.profilePicture ? (
              <img src={userId.profilePicture} alt={userId.username} />
            ) : (
              <span>{getInitials(userId?.username)}</span>
            )}
          </div>
          <span className="item-username">{userId?.username || "Community User"}</span>
        </div>

        <Link to={`/item/${_id}`} className="btn btn-outline btn-sm" style={{ padding: "0.35rem 0.75rem", gap: "0.25rem", fontSize: "0.8rem" }}>
          <span>Details</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
