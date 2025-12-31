import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export function DateInput({ value, onChange, label, placeholder }: DateInputProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}