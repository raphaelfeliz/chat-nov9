/*
*file-summary*
PATH: src/components/configurator/option-card.tsx
PURPOSE: Render a selectable option card for each configurator choice within the TriageMachine flow.
SUMMARY: Displays an image and label inside a styled Card component with hover and focus feedback.
         Calls an onClick handler when selected, driving the configurator’s state transition.
IMPORTS: React, Next.js Image, Card components, cn (utility), Option (from lib/triage)
EXPORTS: OptionCard (React functional component)
*/


'use client';
import type { Option } from "@/lib/triage";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/configurator/card";
import { cn } from "@/lib/utils";

type OptionCardProps = {
  option: Option;
  onClick: () => void;
};

export function OptionCard({ option, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group text-left rounded-lg overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-opacity-75"
      )}
    >
      <Card className="h-full transition-all duration-200 ease-in-out bg-card border-border group-hover:bg-primary/20 group-hover:border-primary focus:bg-primary/20 focus:border-primary">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full bg-white rounded-t-lg overflow-hidden">
            <Image
              src={option.picture}
              alt={option.label}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        </CardContent>
        <CardFooter className="p-3 md:p-4">
          <h3 className="text-sm md:text-base font-semibold text-card-foreground">
            {option.label}
          </h3>
        </CardFooter>
      </Card>
    </button>
  );
}
