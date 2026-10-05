const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 20.25a7.5 7.5 0 0 1 15 0"
    />
  </svg>
);

export default UserIcon;
