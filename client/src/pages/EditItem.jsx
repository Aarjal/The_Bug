import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { getItem } from "../api/services";
import { useAuth } from "../context/AuthContext";
import ItemForm from "../components/ItemForm";

function EditItemSkeleton() {
  return (
    <div className="container main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
      <div className="spinner spinner-dark" style={{ width: "2.5rem", height: "2.5rem" }} />
    </div>
  );
}

function EditItemErrorCard({ errorMessage, onNavigateHome }) {
  return (
    <div className="container main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
      <div className="error-card card" style={{ maxWidth: "480px", padding: "2rem", textAlign: "center" }}>
        <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} aria-hidden="true" />
        <h3 style={{ marginBottom: "0.5rem" }}>Failed to load item</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          {errorMessage || "Item not found or has been deleted."}
        </p>
        <button onClick={onNavigateHome} className="btn btn-primary">
          Go to Home Feed
        </button>
      </div>
    </div>
  );
}

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadItemForEdit() {
      try {
        const { data } = await getItem(id);
        if (!isCancelled) {
          setItem(data);
        }
      } catch {
        if (!isCancelled) {
          setErrorMessage("Failed to load item information.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadItemForEdit();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return <EditItemSkeleton />;
  }

  if (errorMessage || !item) {
    return (
      <EditItemErrorCard
        errorMessage={errorMessage}
        onNavigateHome={() => navigate("/")}
      />
    );
  }

  const postAuthorId = item.userId?._id || item.userId;
  const isAuthor = user?._id && postAuthorId && postAuthorId.toString() === user._id.toString();

  if (!isAuthor) {
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

        <ItemForm key={item._id} type={item.type} itemToEdit={item} />
      </div>
    </div>
  );
}
