import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SuccessDialog from "@/components/success-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const frequencyOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
  { label: "Local only", value: "local" },
];

interface AddNewTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = {
  state: string;
  frequency: string | null;
  dueDate: string;
  threshold: string;
  website: string;
};

export default function AddNewTaxModal({
  isOpen,
  onClose,
}: AddNewTaxModalProps) {
  const [successOpen, setSuccessOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      state: "",
      frequency: null,
      dueDate: "",
      threshold: "",
      website: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // TODO: replace with real save logic
    console.log("New Tax:", data);
    reset();
    onClose();
    setSuccessOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="p-0">
          <div className="p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle className="text-lg font-semibold">
                Add New Tax
              </DialogTitle>
              <div className="sr-only">Add a new tax rate with details</div>
            </DialogHeader>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2 max-h-[60vh] overflow-y-auto pr-2">
                <div className="flex flex-col gap-1.5">
                  <Label>State</Label>
                  <Input
                    className="h-12 rounded-lg"
                    {...register("state", { required: "State is required" })}
                    placeholder="Enter State"
                  />
                  {errors.state && (
                    <p className="text-xs text-red-500">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Filing Frequency</Label>
                  <Controller
                    control={control}
                    name="frequency"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger className="h-12 rounded-lg">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    rules={{ required: "Filing frequency is required" }}
                  />
                  {errors.frequency && (
                    <p className="text-xs text-red-500">
                      {errors.frequency.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Due Date</Label>
                  <Input
                    className="h-12 rounded-lg"
                    type="date"
                    {...register("dueDate")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Threshold / Parameters</Label>
                  <Input
                    className="h-12 rounded-lg"
                    {...register("threshold")}
                    placeholder=">$100/mo"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-full">
                  <Label>Website Link</Label>
                  <Input
                    className="h-12 rounded-lg"
                    {...register("website")}
                    placeholder="https://example.gov"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
            <div>
              <Button
                type="button"
                className="rounded-lg  bg-gray-100 hover:bg-gray-200 text-gray-800"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Cancel
              </Button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="rounded-full"
              disabled={isSubmitting}
            >
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <SuccessDialog
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Tax added"
        okLabel="Done"
      />
    </Dialog>
  );
}
