import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { getItem } from "../api/services";
import { useAuth } from "../context/AuthContext";
import ItemForm from "../components/ItemForm";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await getItem(id);
        setItem(data);
      } catch (err) {
        setError("Failed to load item information.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="container main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div className="spinner spinner-dark" style={{ width: "2rem", height: "2rem" }} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container main-content" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div className="alert alert-error" style={{ maxWidth: "480px", margin: "0 auto 1.5rem" }}>{error || "Item not found"}</div>
        <button onClick={() => navigate("/")} className="btn btn-primary">Go to Home Feed</button>
      </div>
    );
  }

  // Double-check ownership: if not user's item, redirect home
  const ownerId = item.userId?._id || item.userId;
  if (ownerId && user?._id && ownerId.toString() !== user._id.toString()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container main-content">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>
            Edit Report Details
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Modify the details of your reported item below.
          </p>
        </div>

        {/* Form mounted in Edit Mode */}
        <ItemForm type={item.type} itemToEdit={item} />
      </div>
    </div>
  );
}
