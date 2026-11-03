import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Modal from "../common_components/Modal";
import { Search, Building2, Plus, Loader2 } from "lucide-react";
import { useGetCustomersQuery } from "@/redux/api/customerApi";

export interface Client {
  id: string;
  name: string;
  avatar?: string;
  selected?: boolean;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selectedClients: Client[]) => void;
}

export default function AddClientModal({
  isOpen,
  onClose,
  onAdd,
}: AddClientModalProps) {
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualAddress, setManualAddress] = useState("");

  const { data: customerData, isLoading } = useGetCustomersQuery(
    { search: search.trim() || undefined, limit: 20 },
    { skip: !isOpen }
  );

  const fallbackClients: Client[] = useMemo(
    () => [
      {
        id: "1",
        name: "Randy Dorwart",
        company: "Apex Construction",
        avatar: "https://i.pravatar.cc/150?u=1",
        address: "410 Grand Ave, Council Bluffs, IA 51503",
        selected: false,
      },
      {
        id: "2",
        name: "Abram Vaccaro",
        company: "Vaccaro Logistics",
        avatar: "https://i.pravatar.cc/150?u=2",
        address: "720 Elm Street, Omaha, NE 68102",
        selected: false,
      },
      {
        id: "3",
        name: "Kaiya Ekstrom Bothman",
        company: "Bothman Steel Buildings",
        avatar: "https://i.pravatar.cc/150?u=3",
        address: "1024 River Rd, Des Moines, IA 50309",
        selected: false,
      },
      {
        id: "4",
        name: "Hanna Workman",
        company: "Workman Commercial",
        avatar: "https://i.pravatar.cc/150?u=4",
        address: "512 Pinecrest Dr, Lincoln, NE 68508",
        selected: false,
      },
    ],
    []
  );

  const apiCustomers = customerData?.customers;
  const clientList: Client[] = useMemo(() => {
    if (apiCustomers && apiCustomers.length > 0) {
      return apiCustomers.map((c) => ({
        id: c._id || c.customerId,
        name: c.customerName,
        company: c.company || c.customerName,
        email: c.email,
        phone: c.phone,
        avatar:
          c.photo ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            c.customerName
          )}&background=2563EB&color=fff`,
        selected: false,
      }));
    }
    return fallbackClients.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
    );
  }, [apiCustomers, fallbackClients, search]);

  const handleSelectClient = (c: Client) => {
    setSelectedClientId(c.id);
  };

  const handleAdd = () => {
    if (isManualMode) {
      if (!manualName.trim()) return;
      const newClient: Client = {
        id: `client-${Date.now()}`,
        name: manualName.trim(),
        company: manualCompany.trim() || manualName.trim(),
        email: manualEmail.trim(),
        address: manualAddress.trim(),
        selected: true,
      };
      onAdd([newClient]);
      onClose();
      return;
    }

    const found = clientList.find((c) => c.id === selectedClientId);
    if (found) {
      onAdd([{ ...found, selected: true }]);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select or Add Bill-To Client"
      width="max-w-md"
      className="p-0"
    >
      <div className="flex flex-col h-full">
        {/* Toggle between select & manual */}
        <div className="px-5 pt-4 pb-2 flex gap-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setIsManualMode(false)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              !isManualMode
                ? "bg-blue-50 text-blue-600"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Select Existing Client
          </button>
          <button
            type="button"
            onClick={() => setIsManualMode(true)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              isManualMode
                ? "bg-blue-50 text-blue-600"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Client
          </button>
        </div>

        {isManualMode ? (
          <div className="p-5 space-y-3.5 flex-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Client / Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={manualCompany}
                onChange={(e) => setManualCompany(e.target.value)}
                placeholder="e.g. Acme Industrial Corp"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="e.g. john@acme.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Address (Street, City, State ZIP)
              </label>
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="e.g. 100 Main St, Suite 200, Council Bluffs, IA 51503"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-4">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients by name or company..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Client List */}
            <div className="overflow-y-auto max-h-70 space-y-1 pr-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading clients...
                </div>
              ) : clientList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No clients found matching "{search}"
                </div>
              ) : (
                clientList.map((client) => {
                  const isSelected = selectedClientId === client.id;
                  return (
                    <div
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        name="client-select"
                        checked={isSelected}
                        onChange={() => handleSelectClient(client)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {client.name}
                        </div>
                        {client.company && (
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {client.company}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-2.5 bg-slate-50/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs text-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!isManualMode && !selectedClientId}
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs px-5"
          >
            {isManualMode ? "Add Client" : "Select Client"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
