import { useSearchParams, Navigate } from "react-router-dom";
import ItemForm from "../components/ItemForm";

export default function CreateItem() {
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get("type");

  // Ensure type is valid, fallback to lost
  const type = rawType === "lost" || rawType === "found" ? rawType : "lost";

  const isLost = type === "lost";

  return (
    <div className="container main-content">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>
            {isLost ? "Report a Lost Item" : "Report a Found Item"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {isLost
              ? "Provide details about your missing item so the community can help you find it."
              : "Provide details about the item you found so its owner can claim it."}
          </p>
        </div>

        {/* Reusable Item Form */}
        <ItemForm type={type} />
      </div>
    </div>
  );
}
