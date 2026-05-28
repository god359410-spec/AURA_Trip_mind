export default function SkeletonCard({ height = 200 }: { height?: number }) {
  return (
    <div className="card" style={{ padding: 20, overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, width: '75%', marginBottom: 20 }} />
      <div className="skeleton" style={{ height: height - 100, width: '100%' }} />
    </div>
  );
}
