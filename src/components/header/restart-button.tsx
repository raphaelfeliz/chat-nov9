import { Button } from "../global/button";
import { RefreshCw } from "lucide-react";

type ResetButtonProps = {
  onReset: () => void;
};

export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={onReset} className="text-xs sm:text-sm">
      <RefreshCw className="w-3 h-3 mr-1.5" />
      Recomeçar
    </Button>
  );
}
