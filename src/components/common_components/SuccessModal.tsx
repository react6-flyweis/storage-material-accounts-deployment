import React from "react";
import { Button } from "@/components/ui/button";
import SuccessModalCheckIcon from "../../assets/SuccessModalCheckIcon.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subTitle?: string;
  message?: string;
  description?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Entry Added",
  subTitle,
  message,
  description,
}) => {
  const displaySub = subTitle || message || description;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-full max-w-lg rounded-2xl p-6 md:p-8 bg-white border border-slate-100 shadow-2xl focus:outline-none"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          {displaySub ? (
            <DialogDescription>{displaySub}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">Success modal</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col items-center text-center justify-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black mb-1 mx-4">
            {title}
          </h2>
          {displaySub && (
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 mb-6">
              {displaySub}
            </h3>
          )}

          <div className="md:-mt-4 md:-mb-4 my-2">
            <img
              src={SuccessModalCheckIcon}
              alt="Success"
              className="md:w-60 md:h-60 w-36 h-36 object-contain"
            />
          </div>

          <Button
            onClick={onClose}
            className="w-40 md:w-60 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl py-6 text-lg font-medium cursor-pointer"
          >
            Ok
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;