import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import type { ReactNode } from "react";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { name } = useUser();
  const location = useLocation();

  if (!name) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
