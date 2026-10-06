export default function AddonCard({ children, selected = false, className = '' }) {
  return <div className={`booking-addon-card ${selected ? 'is-selected' : ''} ${className}`.trim()}>{children}</div>;
}
