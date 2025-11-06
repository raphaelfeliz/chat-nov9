import { Button } from "../global/button";
import { RefreshCw, ChevronRight } from "lucide-react";

type ProgressTrackerProps = {
  history: string[];
  onReset: () => void;
};

export function ProgressTracker({ history, onReset }: ProgressTrackerProps) {
  return (
    <div
      className="flex items-center justify-between flex-wrap gap-2 md:gap-4"
    >
      <Button variant="outline" size="sm" onClick={onReset} className="text-xs sm:text-sm">
        <RefreshCw className="w-3 h-3 mr-1.5" />
        Recomeçar
      </Button>
      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
        {history.length > 0 &&
          history.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              <span
                className={
                  index === history.length - 1
                    ? "font-medium text-foreground"
                    : ""
                }
              >
                {item}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
