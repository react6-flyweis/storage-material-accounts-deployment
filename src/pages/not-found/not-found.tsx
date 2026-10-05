import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button className="mt-4">
          <Link to="/">Go back home</Link>
        </button>
      </div>
    </div>
  );
}
