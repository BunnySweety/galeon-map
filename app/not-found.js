import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page non trouvée</h2>
      <p style={{ fontSize: '1.25rem', color: '#94a3b8' }}>
        La page que vous recherchez n&apos;existe pas.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
