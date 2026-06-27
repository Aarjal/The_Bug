import { Heart } from "lucide-react";
import "../styles/Layout.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>&copy; {currentYear} Lost &amp; Found. All rights reserved.</p>
        <p style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
          Made with <Heart size={12} fill="var(--danger)" color="var(--danger)" /> for the community.
        </p>
      </div>
    </footer
  );
}
