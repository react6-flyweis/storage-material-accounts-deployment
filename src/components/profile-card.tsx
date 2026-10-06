import { useEffect, useState } from "react";
import {
  CheckCircle,
  Copy,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface ProfileData {
  name: string;
  status: "Active" | "Inactive" | string;
  id: string;
  joined: string;
  phone: string;
  email: string;
  address?: string;
  company?: string;
  photo?: string | null;
}

interface ProfileCardProps {
  profile: ProfileData;
  isLoading?: boolean;
}

export default function ProfileCard({
  profile,
  isLoading = false,
}: ProfileCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  const handleCopyEmail = () => {
    if (!profile.email || profile.email === "-") return;
    navigator.clipboard
      .writeText(profile.email)
      .then(() => setIsCopied(true))
      .catch(() => {});
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-white border border-slate-100 shadow-xs rounded-2xl">
        <CardContent className="flex flex-col md:flex-row gap-8 items-start px-0 pb-0 animate-pulse">
          <div className="flex gap-5 items-start">
            <div className="h-20 w-20 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-3">
              <div className="h-6 w-44 rounded bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-4 w-36 rounded bg-slate-200" />
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1 mt-4 md:mt-0 w-full">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-6">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-4 w-52 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "CU";

  const isActive = profile.status?.toLowerCase() === "active";
  const avatarUrl =
    profile.photo ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";

  return (
    <Card className="p-6 bg-white border border-slate-100 shadow-xs rounded-2xl">
      <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-0 pb-0">
        {/* Left: Avatar & Customer info */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar image */}
          <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-xs">
            {!imgError ? (
              <img
                src={avatarUrl}
                alt={profile.name}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="h-full w-full bg-[#1D51A4] text-white flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {profile.name}
              </h2>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-[#E6F9ED] text-[#16A34A] border border-[#BFF2CE]"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-[#22C55E]" : "bg-red-500"
                  }`}
                />
                {profile.status}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {profile.id?.startsWith("ID-") ? profile.id : `ID-${profile.id}`}
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              Joined {profile.joined}
            </p>
          </div>
        </div>

        {/* Right: Phone, Email, Address */}
        <div className="flex flex-col gap-2.5 text-xs sm:text-sm border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-20 text-slate-400 font-normal">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Phone</span>
            </div>
            <span className="text-slate-900 font-medium">
              {profile.phone || "-"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-20 text-slate-400 font-normal">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Email</span>
            </div>
            <div className="flex items-center gap-1.5">
              <a
                href={`mailto:${profile.email}`}
                className="text-[#2563EB] hover:underline font-medium"
              >
                {profile.email || "-"}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                title={isCopied ? "Copied!" : "Copy email"}
              >
                {isCopied ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-20 text-slate-400 font-normal">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Address</span>
            </div>
            <span className="text-slate-900 font-medium">
              {profile.address || "-"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

