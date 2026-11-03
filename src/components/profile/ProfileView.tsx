import { Camera, CircleAlert, MoveLeft, Loader2, Eye, EyeOff } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TitleSubtitle from "../common_components/TitleSubtitle";
import SuccessModal from "../common_components/SuccessModal";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  type UpdateProfileRequest,
} from "../../redux/api/profileApi";
import { uploadFileToS3 } from "../../lib/upload";
import { getApiErrorMessage } from "../../redux/utils/apiError";

interface ProfileViewProps {
  onNavigate?: (view: "settings") => void;
}

const DEFAULT_AVATAR_URL =
  "https://imgs.search.brave.com/C6AU3hqShumrOuZaswKHOeZBwOo-XeuuJnf7XZ-5QW4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTAx/Njc0NDAzNC92ZWN0/b3IvcHJvZmlsZS1w/bGFjZWhvbGRlci1p/bWFnZS1ncmF5LXNp/bGhvdWV0dGUtbm8t/cGhvdG8uanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPVJxdGky/NlZRal9mcy1faEwx/NW1KajZiODRGRVpO/YTAwRkpnWlJhRzVQ/RDQ9";

const ProfileView: React.FC<ProfileViewProps> = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const [profilePicture, setProfilePicture] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Populate form with fetched profile
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || "",
        email: profile.email || "",
        mobile: profile.mobile || profile.phone || "",
        role: profile.role || "Accounts",
      }));
      if (profile.avatar) {
        setProfilePicture(profile.avatar);
      }
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (["currentPassword", "newPassword", "confirmPassword"].includes(name)) {
      setPasswordError("");
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be less than 5MB");
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
      setErrorMessage("Only JPG, PNG, WEBP, or GIF files are allowed");
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const uploadedUrl = await uploadFileToS3(file, "avatars");
      setProfilePicture(uploadedUrl);
    } catch {
      // Fallback to local data URL reader
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getChangedPayload = (): UpdateProfileRequest => {
    const payload: UpdateProfileRequest = {};
    const nameTrim = formData.name.trim();
    const mobileTrim = formData.mobile.trim();
    const avatarVal = profilePicture.trim();

    if (nameTrim !== (profile?.name || "").trim()) {
      payload.name = nameTrim;
    }
    const currentMobile = (profile?.mobile || profile?.phone || "").trim();
    if (mobileTrim !== currentMobile) {
      payload.mobile = mobileTrim;
      payload.phone = mobileTrim;
    }
    if (avatarVal !== (profile?.avatar || "").trim()) {
      payload.avatar = avatarVal;
    }

    return payload;
  };

  const handleSaveProfile = async () => {
    setErrorMessage("");
    setInfoMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Full Name is required");
      return;
    }

    const payload = getChangedPayload();
    const hasProfileChanges = Object.keys(payload).length > 0;

    if (!hasProfileChanges) {
      setInfoMessage("No changes detected to save");
      return;
    }

    try {
      await updateProfile(payload).unwrap();
      setModalTitle("Profile saved successfully");
      setIsSuccessModalOpen(true);
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Failed to save profile"));
    }
  };

  const handleSavePassword = async () => {
    setPasswordError("");

    if (!formData.currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }
    if (!formData.newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }
    if (formData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }
    if (!formData.confirmPassword) {
      setPasswordError("Please confirm your new password");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setModalTitle("Password updated successfully");
      setIsSuccessModalOpen(true);
    } catch (err: unknown) {
      setPasswordError(getApiErrorMessage(err, "Failed to update password"));
    }
  };

  const isSavingProfile = isUpdatingProfile || isUploadingAvatar;

  return (
    <div className="xl:px-0 px-2 pb-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:items-center items-start justify-between mt-2 xl:mt-0">
        <div className="flex items-start gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-(--button-bg-primary-color) text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer"
          >
            <MoveLeft className="w-4 h-4" />
            <p className="font-normal">Back</p>
          </button>
          <TitleSubtitle
            title="My Profile"
            subtitle="Update your personal information and security settings"
          />
        </div>
        <button
          type="button"
          disabled={isSavingProfile || isLoading}
          onClick={handleSaveProfile}
          className="md:px-4 ml-auto md:mt-0 mt-4 py-2.5 bg-(--button-bg-primary-color) text-white rounded-lg hover:opacity-90 transition-opacity md:text-sm text-xs font-normal min-w-[128px] w-fit flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSavingProfile ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            "Save Profile"
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {infoMessage && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          {infoMessage}
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 flex flex-wrap items-center gap-6">
        <div className="relative">
          <img
            src={profilePicture || DEFAULT_AVATAR_URL}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-4 border-gray-50"
          />
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="space-y-2 flex flex-col flex-wrap">
          <h3 className="md:text-lg font-semibold text-gray-900">
            Profile Picture
          </h3>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleProfilePictureClick}
              type="button"
              disabled={isUploadingAvatar}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <p className="md:text-sm text-xs">
                {isUploadingAvatar ? "Uploading..." : "Change Picture"}
              </p>
            </button>
            <span className="md:text-sm text-xs text-gray-400">
              JPG, PNG, WEBP or GIF, Max size 5MB.
            </span>
          </div>
        </div>
      </div>

      <h3 className="md:text-lg font-semibold text-gray-900 my-1">
        Basic Information
      </h3>
      {/* Basic Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 focus:outline-none cursor-not-allowed"
            />
            <span className="text-xs text-gray-500">
              Email can not be changed from this interface
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 focus:outline-none cursor-not-allowed capitalize"
            />
            <span className="text-xs text-gray-500">
              Role can not be changed from this interface
            </span>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <h3 className="md:text-lg font-semibold text-gray-900">
        Security Settings
      </h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-6">
        <div>
          <p className="text-sm text-gray-500">
            Leave password fields empty if you don't want to change your
            password.
          </p>
        </div>

        {passwordError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {passwordError}
          </div>
        )}

        <div className="space-y-6">
          <div className="w-full md:w-1/2 pr-0 md:pr-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password (min. 8 characters)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={isChangingPassword}
            onClick={handleSavePassword}
            className="md:px-4 py-2.5 bg-(--button-bg-primary-color) text-white rounded-lg hover:opacity-90 transition-opacity md:text-sm text-xs font-normal min-w-[140px] w-fit flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Password"
            )}
          </button>
        </div>
      </div>

      {/* Password Requirements Info */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-4 text-(--text-color-primary-blue) font-medium md:text-sm text-xs">
          <CircleAlert className="w-5 h-5" />
          Password Requirements:
        </div>
        <ul className="space-y-2 md:text-sm text-xs text-(--text-color-primary-blue)">
          <li>At least 8 characters long</li>
          <li>Include uppercase and lowercase letters</li>
          <li>Include at least one number</li>
          <li>Include at least one special character</li>
        </ul>
      </div>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={modalTitle}
      />
    </div>
  );
};

export default ProfileView;
