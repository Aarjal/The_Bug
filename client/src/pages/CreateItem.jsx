import { useSearchParams } from "react-router-dom";
import ItemForm from "../components/ItemForm";

function CreateItemHeader({ isLostItem }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>
        {isLostItem ? "Report a Lost Item" : "Report a Found Item"}
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
        {isLostItem
          ? "Provide details about your missing item so the community can help you find it."
          : "Provide details about the item you found so its owner can claim it."}
      </p>
    </div>
  );
}

export default function CreateItem() {
  const [searchParams] = useSearchParams();
  const itemTypeParam = searchParams.get("type");
  const reportType = itemTypeParam === "found" ? "found" : "lost";

  return (
    <div className="container main-content">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
        <CreateItemHeader isLostItem={reportType === "lost"} />
        <ItemForm type={reportType} />
      </div>
    </div>
  );
}
