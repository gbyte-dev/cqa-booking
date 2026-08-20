import './superadmin.css';

export default function SuperAdminLayout({ children }) {
  return (
    <div className="superadmin-page">
      {children}
    </div>
  );
}