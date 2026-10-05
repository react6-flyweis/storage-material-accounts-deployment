import React from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import SuccessModalCheckIcon from "../../assets/SuccessModalCheckIcon.svg";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subTitle?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Entry Added",
  subTitle,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-lg" hideHeader={true}>
      <div className="flex flex-col items-center text-center justify-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black mb-1 mx-10">{title}</h2>
       {subTitle && <h2 className="text-2xl font-semibold text-black mb-6">{subTitle}</h2>}

        <div className="md:-mt-6 md:-mb-6">
          <img
            src={SuccessModalCheckIcon}
            alt="Success"
            className="md:w-65 md:h-65 w-40 h-40"
          />
        </div>

        <Button
          onClick={onClose}
          className="w-40 md:w-60 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl py-6 text-lg font-medium"
        >
          Ok
        </Button>
      </div>
    </Modal>
  );
};

export default SuccessModal;