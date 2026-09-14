import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search lost or found items...",
  id = "feed-search-input",
}) {
  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <Search className="search-icon-inside" size={18} aria-hidden="true" />
        <input
          id={id}
          type="search"
          className="search-input-field"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={placeholder}
        />
      </div>
    </div>
  );
}
