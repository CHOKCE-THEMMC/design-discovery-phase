import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Check = { ok: boolean; latencyMs?: number; error?: string };
type HealthResp = {
  status: "ok" | "degraded";
  checks: { auth: Check; chatbot: Check };
  timestamp: string;
};

const HEALTH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health`;

// Routes where sign-in / chatbot status is critical → poll often.
// Other pages poll less to save requests.
const ACTIVE_POLL_MS = 30_000;
const IDLE_POLL_MS = 300_000; // 5 min

const ACTIVE_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/admin",
  "/my-materials",
  "/bookmarks",
  "/history",
];

const isActiveRoute = (pathname: string) =>
  ACTIVE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

const StatusIndicator = () => {
  const { pathname } = useLocation();
  const [data, setData] = useState<HealthResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [reachable, setReachable] = useState(true);

  const check = async () => {
    try {
      const r = await fetch(HEALTH_URL, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      const json = (await r.json()) as HealthResp;
      setData(json);
      setReachable(true);
    } catch {
      setReachable(false);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
    const interval = isActiveRoute(pathname) ? ACTIVE_POLL_MS : IDLE_POLL_MS;
    const id = setInterval(check, interval);

    // Re-check when tab becomes visible again
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  const overallOk = reachable && data?.status === "ok";
  const overallDegraded = reachable && data?.status === "degraded";

  const color = loading
    ? "bg-muted-foreground"
    : !reachable
      ? "bg-destructive"
      : overallOk
        ? "bg-green-500"
        : "bg-yellow-500";

  const label = loading
    ? "Checking…"
    : !reachable
      ? "Offline"
      : overallOk
        ? "All systems online"
        : "Some services degraded";

  const renderRow = (name: string, c: Check | undefined) => {
    const ok = !!c?.ok;
    return (
      <div className="flex items-center justify-between py-1.5 text-sm">
        <div className="flex items-center gap-2">
          {ok ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          <span className="capitalize">{name}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {ok ? (c?.latencyMs ? `${c.latencyMs}ms` : "online") : (c?.error || "offline")}
        </span>
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`System status: ${label}`}
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-card hover:bg-accent/10 transition-colors"
        >
          <span className="relative flex h-2.5 w-2.5">
            <AnimatePresence>
              {overallOk && (
                <motion.span
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={cn("absolute inline-flex h-full w-full rounded-full", color)}
                />
              )}
            </AnimatePresence>
            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", color)} />
          </span>
          <span className="text-xs font-medium text-foreground hidden sm:inline">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-1">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <p className="text-sm font-semibold">System Status</p>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : overallOk ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          {!reachable && !loading && (
            <p className="text-xs text-destructive py-2">
              Cannot reach backend. Sign-in and chatbot may be unavailable.
            </p>
          )}
          {data && (
            <>
              {renderRow("Sign-in", data.checks.auth)}
              {renderRow("Chatbot", data.checks.chatbot)}
              <p className="pt-2 text-[10px] text-muted-foreground">
                Updated {new Date(data.timestamp).toLocaleTimeString()}
              </p>
            </>
          )}
          <button
            onClick={() => { setLoading(true); check(); }}
            className="w-full mt-2 text-xs py-1.5 rounded-md border border-border hover:bg-accent/10 transition-colors"
          >
            Refresh
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StatusIndicator;