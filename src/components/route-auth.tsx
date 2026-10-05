import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getAuthRedirectPath } from "@/lib/authRedirect";
import { logout } from "@/redux/slices/authSlice";

function hasAuthSession(authState: {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}) {
  return Boolean(
    authState.isAuthenticated ||
    authState.accessToken ||
    authState.refreshToken,
  );
}

export function RequireAuth() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  if (!hasAuthSession(authState)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Validate allowed role for this panel
  const userRole = (authState.role || authState.user?.role || "").toLowerCase();
  const configuredRole = (import.meta.env.VITE_APP_ROLE || "account").toLowerCase();
  const allowedRoles = [configuredRole, "account", "accounts", "admin"];

  if (userRole && !allowedRoles.includes(userRole)) {
    dispatch(logout());
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const location = useLocation();
  const authState = useAppSelector((state) => state.auth);

  if (hasAuthSession(authState)) {
    return <Navigate to={getAuthRedirectPath(location)} replace />;
  }

  return <Outlet />;
}

export function RootRedirect() {
  const authState = useAppSelector((state) => state.auth);

  return (
    <Navigate
      to={hasAuthSession(authState) ? "/dashboard" : "/login"}
      replace
    />
  );
}
