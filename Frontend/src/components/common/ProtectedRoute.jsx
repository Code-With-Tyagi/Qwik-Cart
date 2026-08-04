import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { toast, Zoom } from "react-toastify";
import { clearProtectedToastSuppression } from "../../features/auth.slice";

const ProtectedRoute = ({ adminOnly = false }) => {
  const {
    isAuthenticated,
    hasCheckedAuth,
    loading,
    skipProtectedToast,
    user,
  } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const hasRedirected = useRef(false);

  useEffect(() => {
    // Not authenticated
    if (
      hasCheckedAuth &&
      !loading &&
      !isAuthenticated &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;

      navigate("/login", {
        state: { from: location },
        replace: true,
      });

      if (!skipProtectedToast) {
        setTimeout(() => {
          toast.error("Please sign in to access this page.", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
            transition: Zoom,
          });
        }, 150);
      }

      dispatch(clearProtectedToastSuppression());
      return;
    }

    // Authenticated but not admin
    if (
      hasCheckedAuth &&
      !loading &&
      isAuthenticated &&
      adminOnly &&
      user?.role?.toLowerCase() !== "admin" &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;

      navigate("/", { replace: true });

      setTimeout(() => {
        toast.error("You don't have access to this page.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
          transition: Zoom,
        });
      }, 150);
    }
  }, [
    hasCheckedAuth,
    loading,
    isAuthenticated,
    adminOnly,
    user,
    navigate,
    location,
    dispatch,
    skipProtectedToast,
  ]);

  // Loading screen
  if (loading || !hasCheckedAuth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <div className="fixed inset-0 z-50 bg-white"></div>;
  }

  // Logged in but not admin
  if (adminOnly && user?.role?.toLowerCase() !== "admin") {
    return <div className="fixed inset-0 z-50 bg-white"></div>;
  }

  return <Outlet />;
};

export default ProtectedRoute;