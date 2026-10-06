import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Download, FileCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/modules/customers/customer-utils";
import { useGetCustomerDetailQuery } from "@/redux/api/customerApi";

export default function ContractDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id = "", customerId = "", projectId = "" } = useParams<{
    id?: string;
    customerId?: string;
    projectId?: string;
  }>();

  const actualId = projectId || id || "2025001";
  const actualCustomerId = customerId || "CUS-00147";

  const { data: customerDetail } = useGetCustomerDetailQuery(actualCustomerId);

  const state = location.state as {
    projectName?: string;
    amount?: number;
    customerName?: string;
  } | null;

  const matchedProject = customerDetail?.projects?.find(
    (p) => p.projectId === actualId || p.leadId === actualId
  );

  const projectName =
    matchedProject?.projectName || state?.projectName || "ABC Building";
  const amount = matchedProject?.amount || state?.amount || 50000;
  const customerName =
    customerDetail?.profile?.customerName || state?.customerName || "John Doe";
  const customerAddress =
    customerDetail?.profile?.address || "1861 Bayonne Ave, Manchester, NJ, 08759";

  const handleDownload = () => {
    alert(`Downloading signed contract agreement for ${projectName}...`);
  };

  const handleShare = () => {
    alert("Contract link copied to clipboard for client sharing!");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header matching Sales Panel */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <Button
          onClick={() => navigate(-1)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleDownload}
            className="gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
          >
            <Download className="h-4 w-4" />
            Download Agreement
          </Button>
          <Button
            onClick={handleShare}
            className="gap-2 bg-[#1D51A4] hover:bg-[#153e7e] text-white"
          >
            <Share2 className="h-4 w-4" />
            Share to client
          </Button>
        </div>
      </div>

      {/* Contract Viewer / Executed Agreement Document Card */}
      <Card className="border border-slate-100 shadow-sm bg-white rounded-xl overflow-hidden p-8 sm:p-10 space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                Master Agreement
              </span>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                ✓ Executed & Legally Binding
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Commercial Purchase & Supply Agreement
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Contract Identifier: AGR-{actualId}-2024 • Project: {projectName}
            </p>
          </div>
          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-lg">
            <span className="text-xs text-slate-400 block uppercase font-medium">
              Contract Total
            </span>
            <span className="text-3xl font-extrabold text-slate-900">
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        {/* Contract Legal Text Sections */}
        <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <h3 className="font-bold text-sm text-slate-900">1. Parties to the Agreement</h3>
            <p>
              This Pre-Engineered Steel Building Purchase Agreement is entered into by and between:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="font-semibold text-slate-900">SELLER / SUPPLIER:</p>
                <p>Mr. Storage Material & Construction LLC</p>
                <p className="text-slate-500">1995 G Ave, Red Oak, IA 51566</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">BUYER / CLIENT:</p>
                <p>{customerName}</p>
                <p className="text-slate-500">{customerAddress}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">2. Scope of Supply & Specifications</h3>
            <p>
              Seller agrees to fabricate, engineer, and deliver one (1) pre-engineered structural steel building
              measuring 80' W x 140' L x 24' H with 1:12 roof slope, complete with Galvalume 24-gauge standing seam
              roof panels, 26-gauge color wall sheets, trim packages, and structural fasteners in accordance with IBC 2024 design criteria.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">3. Commercial Terms & Milestones</h3>
            <p>
              Buyer agrees to pay the contract price of <strong>{formatCurrency(amount)}</strong> based on the following schedule:
              25% initial retainer upon signing; 50% upon steel fabrication clearance; 25% balance due prior to carrier dispatch.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">4. Structural Warranty</h3>
            <p>
              Seller provides a 25-year structural warranty against manufacturer material perforation or failure on all
              Galvalume coated sheet products, and a 50-year structural integrity warranty on primary steel framing members.
            </p>
          </div>
        </div>

        {/* Digital Signature Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Signed Digitally by Buyer
            </div>
            <p className="font-serif italic text-lg text-slate-900">{customerName}</p>
            <p className="text-[11px] text-slate-500">
              Authorized Representative • Timestamp: {formatDate(new Date().toISOString())}
            </p>
            <p className="text-[10px] font-mono text-slate-400">
              DocuSign Certificate: e849f2b1-049c-482a-9e1b-4927593c9e88
            </p>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
            <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Signed Digitally by Seller
            </div>
            <p className="font-serif italic text-lg text-slate-900">Marcus Vance</p>
            <p className="text-[11px] text-slate-500">
              Managing Director, Storage Materials LLC • Timestamp: {formatDate(new Date().toISOString())}
            </p>
            <p className="text-[10px] font-mono text-slate-400">
              Corporate Seal Verified • Contract In Force
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
