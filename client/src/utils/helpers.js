// Categories available for item posts
export const CATEGORIES = [
  { value: "wallet", label: "Wallet" },
  { value: "phone", label: "Phone" },
  { value: "keys", label: "Keys" },
  { value: "bag", label: "Bag" },
  { value: "documents", label: "Documents" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "other", label: "Other" },
];

// Format a date string to a readable format
export function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format date to relative time string ("2 hours ago", "Yesterday", etc.)
export function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 6000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  // Hours calculation fix (divide by 60 instead of 6000)
  const trueHours = Math.floor(diffMins / 60);
  if (trueHours < 24) return `${trueHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return formatDate(dateString);
}

// Extract error message from axios error
export function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong"
  );
}

// Capitalize first letter
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
