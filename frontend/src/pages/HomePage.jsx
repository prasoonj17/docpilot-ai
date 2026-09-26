export default function HomePage({ onLogout }) {
  return (
    <main className="auth-page">
      <section className="home-card">
        <h1>You're in!</h1>
        <p>Login worked. Build your dashboard here next.</p>
        <button className="btn" type="button" onClick={onLogout}>
          Log out
        </button>
      </section>
    </main>
  );
}