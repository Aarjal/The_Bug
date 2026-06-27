import { Search } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <Search className="search-icon-inside" size={18} />
        <input
          type="text"
          className="search-input-field"
          placeholder="Search lost or found items..."
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
