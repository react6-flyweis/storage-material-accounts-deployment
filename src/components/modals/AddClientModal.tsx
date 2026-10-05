import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "../common_components/Modal";

interface Client {
  id: string;
  name: string;
  avatar: string; // URL or placeholder
  selected: boolean;
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
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      name: "Randy Dorwart",
      avatar: "https://i.pravatar.cc/150?u=1",
      selected: false,
    },
    {
      id: "2",
      name: "Abram Vaccaro",
      avatar: "https://i.pravatar.cc/150?u=2",
      selected: false,
    },
    {
      id: "3",
      name: "Kaiya Ekstrom Bothman",
      avatar: "https://i.pravatar.cc/150?u=3",
      selected: false,
    },
    {
      id: "4",
      name: "Hanna Workman",
      avatar: "https://i.pravatar.cc/150?u=4",
      selected: false,
    },
    {
      id: "5",
      name: "Justin Workman",
      avatar: "https://i.pravatar.cc/150?u=5",
      selected: false,
    },
  ]);

  const toggleClient = (id: string) => {
    setClients(
      clients.map((client) =>
        client.id === id ? { ...client, selected: !client.selected } : client
      )
    );
  };

  const handleAdd = () => {
    onAdd(clients.filter((c) => c.selected));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Client"
      width="max-w-sm"
      className="px-0"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto min-h-[300px] px-6 py-4">
          {/* Search could be added here if needed based on design, currently just list */}
          <div className="space-y-4 max-h-[40vh] overflow-y-auto">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                onClick={() => toggleClient(client.id)}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  <input
                    type="checkbox"
                    checked={client.selected}
                    onChange={() => toggleClient(client.id)}
                    className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <img
                  src={client.avatar}
                  alt={client.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm font-normal text-[#111827]">
                  {client.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-gray-300 flex justify-end flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-32 bg-gray-100 hover:bg-gray-200 text-gray-700 border-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            className="w-32 bg-[#2563EB] hover:bg-blue-700 text-white"
          >
            Add
          </Button>
        </div>
      </div>
    </Modal>
  );
}
