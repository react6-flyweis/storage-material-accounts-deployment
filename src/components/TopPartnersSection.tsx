import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/dashboardFormatters";
import type { TopCarrier, TopVendor } from "@/redux/api/dashboardApi";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Truck, Store } from "lucide-react";

interface TopPartnersSectionProps {
  carriers?: TopCarrier[];
  vendors?: TopVendor[];
  isLoading?: boolean;
}

export function TopPartnersSection({
  carriers,
  vendors,
  isLoading,
}: TopPartnersSectionProps) {
  const carrierList = carriers || [];
  const vendorList = vendors || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Carriers */}
      <div className="bg-white rounded-md xl:p-6 p-4 border border-gray-100/50 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 tracking-tight">
                Top Carriers by Spend
              </h3>
              <p className="text-xs text-gray-400">Carrier logistics and delivery count</p>
            </div>
          </div>

          <div className="overflow-x-auto border-t border-gray-200 pt-3">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                  <th className="pb-3">Customer / Carrier</th>
                  <th className="pb-3 text-right">Spend</th>
                  <th className="pb-3 text-right">Deliveries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="h-4 w-12 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : carrierList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-gray-400">
                      No top carriers recorded
                    </td>
                  </tr>
                ) : (
                  carrierList.map((carrier, idx) => (
                    <tr key={carrier.carrierId || idx} className="hover:bg-gray-50/50">
                      <td className="py-3 font-medium text-gray-800">{carrier.name}</td>
                      <td className="py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(carrier.spend)}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {formatNumber(carrier.deliveries)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-md xl:p-6 p-4 border border-gray-100/50 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 tracking-tight">
                Top Vendors
              </h3>
              <p className="text-xs text-gray-400">Vendor master accounts and status</p>
            </div>
          </div>

          <div className="overflow-x-auto border-t border-gray-200 pt-3">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                  <th className="pb-3">Vendor</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </td>
                      <td className="py-3 text-right">
                        <Skeleton className="h-5 w-16 ml-auto rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : vendorList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-gray-400">
                      No top vendors recorded
                    </td>
                  </tr>
                ) : (
                  vendorList.map((vendor, idx) => (
                    <tr key={vendor.vendorId || idx} className="hover:bg-gray-50/50">
                      <td className="py-3 font-medium text-gray-800">{vendor.name}</td>
                      <td className="py-3 text-gray-500 text-xs">{vendor.contactName || "-"}</td>
                      <td className="py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(vendor.amount)}
                      </td>
                      <td className="py-3 text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-2 py-0.5 border font-normal",
                            vendor.status?.toLowerCase() === "active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          )}
                        >
                          {vendor.status || "Active"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
