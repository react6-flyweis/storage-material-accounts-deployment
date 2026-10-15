import { useState, useTransition } from "react";
import { useSelector } from "react-redux";
import {
  FlaskConical,
  Play,
  RotateCw,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectActionLinks } from "@/redux/api/projectApi";
import type { RootState } from "@/redux/store";

interface ActionLinksTesterModalProps {
  actionLinks?: ProjectActionLinks;
  projectId?: string;
}

interface TestResult {
  status: "idle" | "loading" | "success" | "error";
  statusCode?: number;
  statusText?: string;
  durationMs?: number;
  data?: unknown;
  error?: string;
  timestamp?: string;
  fullUrl?: string;
}

async function fetchEndpoint(targetUrl: string, token: string | null): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(targetUrl, {
      method: "GET",
      headers,
    });

    const durationMs = Math.max(1, Date.now() - startTime);
    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");

    let data: unknown;
    if (isJson) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      status: res.ok ? "success" : "error",
      statusCode: res.status,
      statusText: res.statusText || (res.ok ? "OK" : "Error"),
      durationMs,
      data,
      error: res.ok ? undefined : `HTTP ${res.status}: ${res.statusText}`,
      timestamp: new Date().toLocaleTimeString(),
      fullUrl: targetUrl,
    };
  } catch (err: unknown) {
    const durationMs = Math.max(1, Date.now() - startTime);
    const errorMessage =
      err instanceof Error ? err.message : "Network / Fetch error";
    return {
      status: "error",
      statusCode: 0,
      statusText: "Network Failed",
      durationMs,
      error: errorMessage,
      timestamp: new Date().toLocaleTimeString(),
      fullUrl: targetUrl,
    };
  }
}

export function ActionLinksTesterModal({
  actionLinks,
  projectId,
}: ActionLinksTesterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const token = useSelector((state: RootState) => state.auth?.accessToken);
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  // Build full list of link targets based on actionLinks or fallback known project routes
  const availableLinks = [
    {
      key: "invoices",
      label: "Invoices",
      url:
        actionLinks?.invoices ||
        (projectId ? `/api/account/projects/${projectId}/invoices` : ""),
    },
    {
      key: "projectInvoicesBreakdown",
      label: "Invoices Breakdown",
      url:
        actionLinks?.projectInvoicesBreakdown ||
        (projectId
          ? `/api/account/projects/${projectId}/invoices-breakdown`
          : ""),
    },
    {
      key: "payments",
      label: "Payments",
      url:
        actionLinks?.payments ||
        (projectId ? `/api/account/projects/${projectId}/payments` : ""),
    },
    {
      key: "agreement",
      label: "Agreement / Contract",
      url:
        actionLinks?.agreement ||
        (projectId ? `/api/account/projects/${projectId}/agreement` : ""),
    },
    {
      key: "quotation",
      label: "Quotation",
      url:
        actionLinks?.quotation ||
        (projectId ? `/api/account/projects/${projectId}/quotation` : ""),
    },
    {
      key: "bom",
      label: "Bill of Materials (BOM)",
      url:
        actionLinks?.bom ||
        (projectId ? `/api/account/projects/${projectId}/bom` : ""),
    },
  ];

  const [selectedKey, setSelectedKey] = useState<string>(
    availableLinks[0].key
  );

  const [results, setResults] = useState<Record<string, TestResult>>({});

  const resolveFullUrl = (pathOrUrl: string) => {
    if (!pathOrUrl) return "";
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
      return pathOrUrl;
    }
    const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    return `${apiBaseUrl}${cleanPath}`;
  };

  const executeTest = async (key: string, urlPath: string) => {
    if (!urlPath) {
      setResults((prev) => ({
        ...prev,
        [key]: {
          status: "error",
          error: "No endpoint URL configured for this action link.",
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
      return;
    }

    const targetUrl = resolveFullUrl(urlPath);
    setResults((prev) => ({
      ...prev,
      [key]: {
        status: "loading",
        fullUrl: targetUrl,
      },
    }));

    const result = await fetchEndpoint(targetUrl, token);
    setResults((prev) => ({
      ...prev,
      [key]: result,
    }));
  };

  const handleTestAll = async () => {
    for (const link of availableLinks) {
      if (link.url) {
        executeTest(link.key, link.url);
      }
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentLink =
    availableLinks.find((l) => l.key === selectedKey) || availableLinks[0];
  const currentResult = results[currentLink.key];

  const testedCount = Object.keys(results).length;
  const successCount = Object.values(results).filter(
    (r) => r.status === "success"
  ).length;

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            startTransition(() => {
              setIsOpen(true);
            });
          }}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#1D51A4] to-[#2563EB] hover:from-[#153E7E] hover:to-[#1D4ED8] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-blue-400/30"
          title="Test Action Links Responses"
        >
          <div className="relative">
            <FlaskConical className="w-5 h-5 text-white animate-pulse" />
            {testedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#1D51A4]" />
            )}
          </div>
          <span className="text-xs font-semibold tracking-wide pr-1">
            Test Action Links
          </span>
          <span className="bg-white/20 text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white">
            {availableLinks.filter((l) => !!l.url).length}
          </span>
        </button>
      </div>

      {/* Floating Modal Console */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Top Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Action Links API Tester
                    </h3>
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                      Live Console
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Test live API responses for action links on project{" "}
                    <span className="text-blue-300 font-mono font-medium">
                      {projectId || "Active"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleTestAll}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 h-8 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  Test All Links
                </Button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Modal Body (2 Columns: Link List & Response Viewer) */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Left Column: Link Endpoints List (4 cols) */}
              <div className="md:col-span-4 bg-slate-50/80 p-3 sm:p-4 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1 mb-1 font-semibold">
                  <span>Endpoints ({availableLinks.length})</span>
                  {testedCount > 0 && (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {successCount}/{testedCount} passed
                    </span>
                  )}
                </div>

                {availableLinks.map((item) => {
                  const res = results[item.key];
                  const isSelected = selectedKey === item.key;
                  const isConfigured = Boolean(item.url);

                  return (
                    <div
                      key={item.key}
                      onClick={() => setSelectedKey(item.key)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-white border-[#2563EB] shadow-xs ring-1 ring-blue-500/30"
                          : "bg-white hover:bg-slate-100/70 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.label}
                          </p>
                          <p
                            className="text-[10px] font-mono text-slate-500 truncate mt-0.5"
                            title={item.url || "Not configured"}
                          >
                            {item.url || "No URL provided"}
                          </p>
                        </div>

                        {/* Status Icon / Badge */}
                        <div className="shrink-0 flex items-center gap-1">
                          {res?.status === "loading" && (
                            <RotateCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                          )}
                          {res?.status === "success" && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {res.statusCode}
                            </span>
                          )}
                          {res?.status === "error" && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              <XCircle className="w-2.5 h-2.5" />
                              {res.statusCode || "ERR"}
                            </span>
                          )}
                          {!res && isConfigured && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              Idle
                            </span>
                          )}
                          {!isConfigured && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              Missing
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Response Inspector (8 cols) */}
              <div className="md:col-span-8 flex flex-col min-h-0 bg-white">
                {/* Active Link Details Bar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {currentLink.label}
                      </span>
                      <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        GET
                      </span>
                    </div>
                    <p
                      className="text-xs font-mono text-slate-600 truncate mt-1"
                      title={resolveFullUrl(currentLink.url)}
                    >
                      {resolveFullUrl(currentLink.url) || "No URL configured"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => executeTest(currentLink.key, currentLink.url)}
                      disabled={!currentLink.url || currentResult?.status === "loading"}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs px-3 py-1.5 h-8 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {currentResult?.status === "loading" ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      Send Request
                    </Button>

                    {currentResult?.data !== undefined && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(currentResult.data, null, 2),
                            currentLink.key
                          )
                        }
                        className="text-xs h-8 px-2.5 cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-100"
                        title="Copy JSON response"
                      >
                        {copiedKey === currentLink.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status Bar for the Active Test */}
                {currentResult && (
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-100/50 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Status:</span>
                      <span
                        className={`font-bold ${
                          currentResult.status === "success"
                            ? "text-emerald-600"
                            : currentResult.status === "error"
                              ? "text-rose-600"
                              : "text-blue-600"
                        }`}
                      >
                        {currentResult.statusCode
                          ? `${currentResult.statusCode} ${currentResult.statusText || ""}`
                          : currentResult.status === "loading"
                            ? "Sending..."
                            : currentResult.statusText || "Failed"}
                      </span>
                    </div>

                    {currentResult.durationMs !== undefined && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{currentResult.durationMs} ms</span>
                      </div>
                    )}

                    {currentResult.timestamp && (
                      <span className="text-slate-400 text-[11px] ml-auto">
                        Tested at {currentResult.timestamp}
                      </span>
                    )}
                  </div>
                )}

                {/* Response Body Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs">
                  {currentResult?.status === "loading" && (
                    <div className="h-full min-h-[220px] flex flex-col items-center justify-center gap-2 text-slate-400">
                      <RotateCw className="w-6 h-6 animate-spin text-blue-400" />
                      <p className="text-xs">Fetching response from {resolveFullUrl(currentLink.url)}...</p>
                    </div>
                  )}

                  {currentResult?.status === "error" && !currentResult?.data && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-400 font-sans font-semibold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Request Failed</span>
                      </div>
                      <p className="text-rose-300 bg-rose-950/50 border border-rose-800/40 p-3 rounded-lg text-xs leading-relaxed">
                        {currentResult.error || "Failed to fetch response."}
                      </p>
                      <p className="text-slate-400 text-[11px] font-sans">
                        Target endpoint: {currentResult.fullUrl || resolveFullUrl(currentLink.url)}
                      </p>
                    </div>
                  )}

                  {currentResult?.data !== undefined && (
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                        <span>Response Body</span>
                        <span>JSON</span>
                      </div>
                      <pre className="whitespace-pre-wrap break-all leading-relaxed text-[12px] text-emerald-300">
                        {typeof currentResult.data === "string"
                          ? currentResult.data
                          : JSON.stringify(currentResult.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {!currentResult && (
                    <div className="h-full min-h-[220px] flex flex-col items-center justify-center gap-2 text-slate-500 font-sans">
                      <Code className="w-8 h-8 text-slate-700" />
                      <p className="text-xs font-medium">
                        No request sent yet for{" "}
                        <strong className="text-slate-400">{currentLink.label}</strong>
                      </p>
                      <p className="text-[11px] text-slate-600 max-w-sm text-center">
                        Click "Send Request" or "Test All Links" to inspect the live response returned by the server.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 px-5 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                Base URL: {apiBaseUrl || "Default Host (relative)"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs h-7 px-3 cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
