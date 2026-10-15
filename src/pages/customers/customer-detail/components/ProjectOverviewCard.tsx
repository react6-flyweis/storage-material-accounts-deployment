import {
  Landmark,
  Building2,
  Calendar,
  MapPin,
  CircleDollarSign,
  Phone,
  Mail,
  User,
  FileText,
  ExternalLink,
} from "lucide-react";
import type {
  ProjectOverview,
  ProjectContact,
  ProjectAssignment,
  ProjectAgreement,
} from "@/redux/api/projectApi";
import {
  formatQuoteValue,
  formatIsoDate,
  formatSignedDate,
  getStatusBadgeStyle,
} from "./project-details-utils";

interface ProjectOverviewCardProps {
  overview?: ProjectOverview;
  contact?: ProjectContact;
  assignment?: ProjectAssignment;
  agreement?: ProjectAgreement;
}

export function ProjectOverviewCard({
  overview,
  contact,
  assignment,
  agreement,
}: ProjectOverviewCardProps) {
  const badgeStyle = getStatusBadgeStyle(
    overview?.statusLabel,
    overview?.status
  );

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
      {/* Top Header inside card */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
            <Landmark className="w-7 h-7 text-[#1D51A4]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {overview?.projectName || "—"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 font-mono">
              {overview?.jobId || overview?.projectId || "—"}
            </p>
          </div>
        </div>
        {(overview?.statusLabel || overview?.status) && (
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border w-fit ${badgeStyle.badge}`}
          >
            <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
            {overview.statusLabel || overview.status}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100" />

      {/* 4 Details Grid (Building Type, Quote Value, Created On, Location) */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-800">Building Type</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {overview?.buildingType || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CircleDollarSign className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-800">Quote Value</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatQuoteValue(overview?.quoteValue)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-800">Created On</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatIsoDate(overview?.createdOn)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-800">Location</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              {overview?.location || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* 3 Sub-Cards: Contact Information, Assignment, Signed Contract */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Contact Information */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            Contact Information
          </h4>
          <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2 border border-slate-100 min-h-[110px]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900">
                {contact?.name || "—"}
              </p>
              {contact?.company && (
                <span className="text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                  {contact.company}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 w-14">Phone</span>
              <span className="text-slate-800 font-medium">
                {contact?.phone || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 w-14">Email</span>
              {contact?.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-[#2563EB] hover:underline font-medium truncate"
                >
                  {contact.email}
                </a>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 w-14">Address</span>
              <span className="text-slate-800 font-medium truncate">
                {contact?.address || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Assignment */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            Assignment
          </h4>
          <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-3.5 border border-slate-100 min-h-[110px]">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Assigned to: {assignment?.name || "Unassigned"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {assignment?.role || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Signed Contract/Agreement */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            Signed Contract/Agreement
          </h4>
          <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-3.5 border border-slate-100 min-h-[110px]">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-[#16A34A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {agreement?.documentName ||
                  (agreement?.signed ? "Signed Contract" : "Not Signed")}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Signed on: {formatSignedDate(agreement?.signedOn)}
              </p>
              {agreement?.url && (
                <a
                  href={agreement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#2563EB] hover:underline font-medium inline-flex items-center gap-1 mt-1"
                >
                  View Document <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
