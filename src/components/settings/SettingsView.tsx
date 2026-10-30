import { MoveLeft, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitleSubtitle from "../common_components/TitleSubtitle";
import SuccessModal from "../common_components/SuccessModal";
import {
  useGetProfileQuery,
  useUpdateNotificationSettingsMutation,
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "../../redux/api/profileApi";
import { getApiErrorMessage } from "../../redux/utils/apiError";

interface SettingsViewProps {
  onNavigate?: (view: "profile") => void;
}

const SettingsView: React.FC<SettingsViewProps> = () => {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useGetProfileQuery();
  const [updateNotificationSettings, { isLoading: isSaving }] =
    useUpdateNotificationSettingsMutation();

  const [settings, setSettings] = useState<Required<NotificationSettings>>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Sync state from profile's notificationSettings when loaded from GET /api/profile
  useEffect(() => {
    if (profile?.notificationSettings) {
      const ns = profile.notificationSettings;
      setSettings({
        twoFactorAuth: Boolean(
          ns.twoFactorAuth ?? DEFAULT_NOTIFICATION_SETTINGS.twoFactorAuth
        ),
        emailNotification: Boolean(
          ns.emailNotification ??
            DEFAULT_NOTIFICATION_SETTINGS.emailNotification
        ),
        smsNotification: Boolean(
          ns.smsNotification ?? DEFAULT_NOTIFICATION_SETTINGS.smsNotification
        ),
        dashboardNotifications: Boolean(
          ns.dashboardNotifications ??
            DEFAULT_NOTIFICATION_SETTINGS.dashboardNotifications
        ),
        weeklyEmailReports: Boolean(
          ns.weeklyEmailReports ??
            DEFAULT_NOTIFICATION_SETTINGS.weeklyEmailReports
        ),
        systemAlerts: Boolean(
          ns.systemAlerts ?? DEFAULT_NOTIFICATION_SETTINGS.systemAlerts
        ),
        loginAlertsViaMail: Boolean(
          ns.loginAlertsViaMail ??
            DEFAULT_NOTIFICATION_SETTINGS.loginAlertsViaMail
        ),
      });
    }
  }, [profile]);

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    setErrorMessage("");
    try {
      const payload: NotificationSettings = {
        twoFactorAuth: settings.twoFactorAuth,
        emailNotification: settings.emailNotification,
        smsNotification: settings.smsNotification,
        dashboardNotifications: settings.dashboardNotifications,
        weeklyEmailReports: settings.weeklyEmailReports,
        systemAlerts: settings.systemAlerts,
        loginAlertsViaMail: settings.loginAlertsViaMail,
      };

      await updateNotificationSettings(payload).unwrap();
      setModalTitle("Settings saved successfully");
      setIsSuccessModalOpen(true);
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save settings"));
    }
  };

  return (
    <div className="xl:px-0 px-2 pb-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:items-center items-start justify-between">
        <div className="flex items-start gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-(--button-bg-primary-color) text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer"
          >
            <MoveLeft className="w-4 h-4" />
            <p className="font-normal md:text-sm text-xs">Back</p>
          </button>
          <TitleSubtitle
            title="Settings"
            subtitle="Manage your account preferences and system configuration"
          />
        </div>
        <button
          type="button"
          disabled={isSaving || isLoading}
          onClick={handleSaveSettings}
          className="md:px-4 ml-auto md:mt-0 mt-4 py-2.5 bg-(--button-bg-primary-color) text-white rounded-lg hover:opacity-90 transition-opacity md:text-sm text-xs font-normal min-w-[128px] w-fit flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            "Save All Settings"
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Account Settings */}
      <h3 className="md:text-lg font-semibold text-gray-900 my-1">
        Account Settings
      </h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-6">
        {/* Two Factor Authentication */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Two Factor Authentication
            </h4>
            <p className="text-xs text-gray-500">
              Add an extra layer to your account
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSetting("twoFactorAuth")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.twoFactorAuth ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.twoFactorAuth ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Email Notifications
            </h4>
            <p className="text-xs text-gray-500">
              Receive notification via email
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSetting("emailNotification")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.emailNotification ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailNotification ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              SMS Notifications
            </h4>
            <p className="text-xs text-gray-500">
              Receive notification via SMS
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSetting("smsNotification")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.smsNotification ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.smsNotification ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <h3 className="md:text-lg font-semibold text-gray-900 my-1">
        Notification Settings
      </h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-6">
        {/* Dashboard Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Dashboard Notifications
            </h4>
            <p className="text-xs text-gray-500">
              Show notifications in the dashboard
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSetting("dashboardNotifications")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.dashboardNotifications ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.dashboardNotifications
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Weekly Email Reports */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Weekly Email Reports
            </h4>
            <p className="text-xs text-gray-500">
              Receive weekly summary reports via email
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSetting("weeklyEmailReports")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.weeklyEmailReports ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.weeklyEmailReports ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* System Alerts */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              System Alerts
            </h4>
            <p className="text-xs text-gray-500">
              Receive critical system alerts
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSetting("systemAlerts")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.systemAlerts ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.systemAlerts ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Login Alerts via Mail */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Login Alerts via Mail
            </h4>
            <p className="text-xs text-gray-500">
              Get notified when new Login register
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSetting("loginAlertsViaMail")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              settings.loginAlertsViaMail ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.loginAlertsViaMail ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle}
      />
    </div>
  );
};

export default SettingsView;
