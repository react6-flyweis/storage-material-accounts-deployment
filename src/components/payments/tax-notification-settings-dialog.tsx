import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Calendar, Check, Loader2 } from "lucide-react";
import {
  useTaxNotificationSettingsQuery,
  useUpdateTaxNotificationSettingsMutation,
} from "@/modules/payments/payments.hooks";

interface TaxNotificationSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export default function TaxNotificationSettingsDialog({
  isOpen,
  onOpenChange,
  onSaved,
}: TaxNotificationSettingsDialogProps) {
  const { data: settingsRes, isLoading } = useTaxNotificationSettingsQuery();
  const updateMutation = useUpdateTaxNotificationSettingsMutation();

  const [emailReminders, setEmailReminders] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [daysBeforeDue, setDaysBeforeDue] = useState<number>(7);
  const [recipientEmail, setRecipientEmail] = useState("accounts@acmeindustries.com");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (settingsRes?.data) {
      if (settingsRes.data.emailReminders !== undefined) {
        setEmailReminders(settingsRes.data.emailReminders);
      }
      if (settingsRes.data.deadlineAlerts !== undefined) {
        setDeadlineAlerts(settingsRes.data.deadlineAlerts);
      }
      if (settingsRes.data.daysBeforeDue !== undefined) {
        setDaysBeforeDue(settingsRes.data.daysBeforeDue);
      }
      if (settingsRes.data.recipientEmail) {
        setRecipientEmail(settingsRes.data.recipientEmail);
      }
    }
  }, [settingsRes]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        emailReminders,
        deadlineAlerts,
        daysBeforeDue: Number(daysBeforeDue) || 7,
        recipientEmail,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
        onSaved?.();
      }, 1200);
    } catch (err) {
      console.error("Failed to update notification settings", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-white">
        <DialogHeader className="p-5 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 m-0">
                Tax Notification Settings
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure filing deadline alerts and payment reminders
              </p>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-sm">Loading notification settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Email Reminders Toggle */}
            <div className="flex items-start justify-between gap-4 p-3.5 bg-gray-50 rounded-lg border border-gray-200/70">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <Label htmlFor="emailReminders" className="font-semibold text-gray-900 cursor-pointer">
                    Email Reminders
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Receive email notifications for upcoming tax filing cycles
                </p>
              </div>
              <button
                type="button"
                id="emailReminders"
                role="switch"
                aria-checked={emailReminders}
                onClick={() => setEmailReminders(!emailReminders)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  emailReminders ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    emailReminders ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Deadline Alerts Toggle */}
            <div className="flex items-start justify-between gap-4 p-3.5 bg-gray-50 rounded-lg border border-gray-200/70">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-600" />
                  <Label htmlFor="deadlineAlerts" className="font-semibold text-gray-900 cursor-pointer">
                    Deadline Alerts
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Show warning banners and notifications when due dates approach
                </p>
              </div>
              <button
                type="button"
                id="deadlineAlerts"
                role="switch"
                aria-checked={deadlineAlerts}
                onClick={() => setDeadlineAlerts(!deadlineAlerts)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  deadlineAlerts ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    deadlineAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Days Before Due Input */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <Label htmlFor="daysBeforeDue" className="text-sm font-semibold text-gray-800">
                  Alert Lead Time (Days Before Due)
                </Label>
              </div>
              <Input
                id="daysBeforeDue"
                type="number"
                min={1}
                max={60}
                value={daysBeforeDue}
                onChange={(e) => setDaysBeforeDue(Number(e.target.value))}
                className="bg-white border-gray-300 h-10"
                required
              />
              <p className="text-xs text-gray-400">
                Number of days prior to filing deadline to trigger alerts
              </p>
            </div>

            {/* Recipient Email */}
            <div className="space-y-1.5">
              <Label htmlFor="recipientEmail" className="text-sm font-semibold text-gray-800">
                Notification Recipient Email
              </Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="accounts@acmeindustries.com"
                className="bg-white border-gray-300 h-10"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm" disabled={updateMutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-28"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-emerald-300" />
                    Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
