import { EyeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

const customers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    phone: "+1 (555) 234-5678",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    phone: "+1 (555) 345-6789",
  },
  {
    id: "4",
    name: "David Thompson",
    email: "david.thompson@company.com",
    phone: "+1 (555) 456-7890",
  },
  {
    id: "5",
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    phone: "+1 (555) 567-8901",
  },
  {
    id: "6",
    name: "James Wilson",
    email: "james.wilson@company.com",
    phone: "+1 (555) 678-9012",
  },
];

export default function CustomerTaxTable() {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800  p-4">
        Default tax profile per customer
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                CLIENT
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                CONTACT
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                TOTAL &amp; TAX
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                PAID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                DUE DATE
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                STATUS
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {customers.map((c, idx) => (
              <tr
                onClick={() => navigate(`/customers/${c.id}`)}
                key={idx}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-600">
                        {c.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined 1/15/2023
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div>{c.email}</div>
                  <div className="text-xs text-gray-500">{c.phone}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  $1,20,000
                  <br />
                  <span className="text-xs text-gray-500">$560</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600">
                  $80,000
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  28 Oct
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-50 text-yellow-800">
                    Partial
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-500">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/customers/${c.id}`)}
                    aria-label={`View ${c.name}`}
                    title={`View ${c.name}`}
                  >
                    <EyeIcon />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
