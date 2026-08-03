// Same creatorMarket logo mark, rendered inline (instead of an <img>) so the
// wordmark can pick up `currentColor` and blend cleanly into the navbar in
// both light and dark mode, instead of a hard-coded/broken fill color.
const Logo = ({ className = '', ...rest }) => (
  <svg
    viewBox="0 0 680 160"
    role="img"
    aria-label="creatorMarket"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <rect x="60" y="30" width="100" height="100" rx="22" fill="#5b4fe0" />
    <path
      d="M88 55 L98 55 L108 90 L138 90 L146 65 L102 65"
      fill="none"
      stroke="#ffffff"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="114" cy="104" r="6" fill="#ffffff" />
    <circle cx="134" cy="104" r="6" fill="#ffffff" />
    <text
      x="335"
      y="98"
      textAnchor="middle"
      fontWeight="500"
      fontSize="46"
      letterSpacing="-1.5"
      fill="currentColor"
      className="text-gray-900 dark:text-white"
    >
      creator
      <tspan fill="#7c72ea">Market</tspan>
      <tspan fill="#7c72ea" letterSpacing="0">.</tspan>
    </text>
  </svg>
)

export default Logo
