export function EpimLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
        className="fill-primary stroke-gray-300 dark:stroke-gray-600"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8V16M8 12H16"
        className="stroke-gray-100 dark:stroke-gray-700"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
