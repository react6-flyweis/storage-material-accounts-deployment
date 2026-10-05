import { useState } from "react";
import { CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "../common_components/Modal";

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export default function UploadImageModal({
  isOpen,
  onClose,
  onUpload,
}: UploadImageModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      onClose();
      setSelectedFile(null); // Reset after upload
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Image"
      width="max-w-md"
      className="px-0"
    >
      <div className="flex flex-col h-full px-0">
        <div className="flex-1 px-10 py-4">
          <div
            className={`border-2 border-dashed rounded-md flex flex-col mb-15 items-center justify-center gap-2 transition-colors min-h-[200px] ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-[#C5C5C5] bg-white"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 text-xs mt-2 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <CloudUpload className="md:w-8 md:h-8 w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">
                    Drop your Image here
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    id="image-upload-modal"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <Button
                    variant="default"
                    className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-md px-6 font-normal"
                    onClick={() =>
                      document.getElementById("image-upload-modal")?.click()
                    }
                  >
                    Choose file
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-gray-300 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-32 bg-gray-100 hover:bg-gray-200 text-gray-700 border-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="w-32 bg-[#2563EB] hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
}
