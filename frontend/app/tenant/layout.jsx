import './tenantGlobal.css';

export default function TenantLayout({ children }) {
  return (
    <div className="tenant-page">
      {children}
    </div>
  );
}