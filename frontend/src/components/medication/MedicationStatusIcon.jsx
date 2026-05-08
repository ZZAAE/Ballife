export default function MedicationStatusIcon({ status }) {
  if (status === "done") {
    return (
      <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#2563EB" />
        <path
          d="M6 10.5L9 13.5L14 7.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "miss") {
    return (
      <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#E11D48" />
        <path
          d="M7 7L13 13M13 7L7 13"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#D1D5DB" strokeWidth="1.5" />
    </svg>
  );
}