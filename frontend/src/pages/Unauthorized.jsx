import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="auth-page">
      <div className="home-card">
        <h1>Not allowed</h1>
        <p>You don't have permission to view that page.</p>
        <Link to="/" className="btn btn--block">Go home</Link>
      </div>
    </div>
  );
}