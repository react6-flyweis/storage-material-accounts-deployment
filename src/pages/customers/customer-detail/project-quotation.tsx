import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/modules/customers/customer-utils";
import { useGetCustomerDetailQuery } from "@/redux/api/customerApi";

export default function ProjectQuotationPage() {
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

  const buildingSpecs = [
    { label: "Width", value: "80 ft" },
    { label: "Length", value: "140 ft" },
    { label: "Left Eave Height", value: "24 ft" },
    { label: "Right Eave Height", value: "24 ft" },
    { label: "Roof Slope", value: "1:12 Pitch" },
    { label: "Total Area", value: "11,200 sq ft" },
  ];

  const designLoads = [
    { label: "Roof Live Load", value: "20 psf" },
    { label: "Roof Snow Load", value: "30 psf" },
    { label: "Dead Load", value: "15 psf" },
    { label: "Wind Velocity", value: "115 mph" },
    { label: "Exposure Category", value: "Category C" },
    { label: "Seismic Design Category", value: "Zone D" },
  ];

  const pricingBreakdown = [
    { item: "Primary Framing (Rigid I-Beam Frames)", rate: "$1.85 / lb", amount: amount * 0.42 },
    { item: "Secondary Framing (Galvanized Purlins & Girts)", rate: "$1.40 / lb", amount: amount * 0.22 },
    { item: "Roof & Wall Sheeting (24-Ga Galvalume)", rate: "$3.20 / sq ft", amount: amount * 0.18 },
    { item: "Trim, Flashing & Standard Accessories", rate: "Package", amount: amount * 0.08 },
    { item: "Engineered Calculations & Foundation Anchor Plans", rate: "Certified", amount: amount * 0.04 },
    { item: "Dedicated Freight Delivery to Jobsite", rate: "Flat Rate", amount: amount * 0.06 },
  ];

  const handleDownloadPdf = () => {
    alert(`Downloading official Quotation PDF for ${projectName}...`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header matching Sales Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="px-4 bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white gap-1 font-sans"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] font-sans">
            {projectName} - Quotation
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Quotation Slide Presentation Stack */}
      <div className="space-y-6">
        {/* Slide 1: Proposal Cover & Header */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-xl overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white text-xs px-2.5 py-0.5">
                  Official Proposal
                </Badge>
                <span className="text-xs font-mono text-slate-500">
                  Ref: QT-{actualId}-REV3
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                Pre-Engineered Commercial Steel Building
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Issued by Mr. Storage Material & Construction LLC • Valid for 30 days
              </p>
            </div>
            <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-lg">
              <span className="text-xs text-slate-500 block uppercase font-medium">
                Total Project Investment
              </span>
              <span className="text-3xl font-extrabold text-emerald-600">
                {formatCurrency(amount)}
              </span>
            </div>
          </div>

          {/* Customer & Location Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Prepared For:
              </span>
              <p className="font-semibold text-slate-900 text-sm">{customerName}</p>
              <p className="text-slate-500">Account ID: {actualCustomerId}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Project Location:
              </span>
              <p className="font-semibold text-slate-900 text-sm">Manchester, NJ</p>
              <p className="text-slate-500">Commercial Warehouse Depot</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Proposal Date:
              </span>
              <p className="font-semibold text-slate-900 text-sm">{formatDate(new Date().toISOString())}</p>
              <p className="text-slate-500">Lead Time: 6–8 Weeks from stamp approval</p>
            </div>
          </div>
        </Card>

        {/* Slide 2: Building Specifications & Design Loads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-[#1D51A4]" />
              <h3 className="font-bold text-slate-900 text-base">
                Building Dimensions & Geometry
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {buildingSpecs.map((spec) => (
                <div key={spec.label} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">{spec.label}</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{spec.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Engineering Design Loads (IBC 2024)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {designLoads.map((load) => (
                <div key={load.label} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block">{load.label}</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{load.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Slide 3: Pricing Summary Table */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pricing & Deliverables Summary
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed cost schedule of manufactured components and certifications
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Deliverable / Component Description</th>
                  <th className="py-3 px-6 text-center">Unit / Basis</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pricingBreakdown.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900">{row.item}</td>
                    <td className="py-3.5 px-6 text-center text-slate-500 text-xs">{row.rate}</td>
                    <td className="py-3.5 px-6 text-right font-semibold text-slate-900">
                      {formatCurrency(row.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                  <td className="py-4 px-6 text-slate-900 text-base" colSpan={2}>
                    Total Contract Quotation (F.O.B. Jobsite)
                  </td>
                  <td className="py-4 px-6 text-right text-emerald-600 text-lg font-extrabold">
                    {formatCurrency(amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Slide 4: Terms & Conditions and Payment Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-xl p-6 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Standard Milestone Payment Schedule
            </h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-800">1. Initial Retainer (25%)</span>
                <span className="font-bold text-slate-900">{formatCurrency(amount * 0.25)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-800">2. Fabrication Release (50%)</span>
                <span className="font-bold text-slate-900">{formatCurrency(amount * 0.5)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-800">3. Jobsite Dispatch (25%)</span>
                <span className="font-bold text-slate-900">{formatCurrency(amount * 0.25)}</span>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-xl p-6 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1D51A4]" />
              Commercial Inclusions & Warranty
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>25-Year Galvalume roof panel rust-through warranty</li>
              <li>Complete anchor bolt layout plans with PE certified engineering stamps</li>
              <li>Dedicated carrier freight delivery with offloading notice included</li>
              <li>Full hardware, closure strips, butyl tape, and color fasteners provided</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
