/* *file-summary*
PATH: src/features/configurator/ui/QuestionDisplay.tsx

PURPOSE: A "dumb" visual component to display the current question and its options.

SUMMARY: This component receives all its data via props. It renders the
         question title and then maps over the `options` array, rendering
         an `OptionCard` for each one. It attaches the `onOptionClick`
         handler to each card.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by the "smart" `src/features/configurator/Configurator.tsx`.
- It imports and renders its own child, `src/features/configurator/ui/OptionCard.tsx`.
- It uses the `Option` type from the core engine.

IMPORTS:
- OptionCard from './OptionCard'
- type Option from '@/core/engine/configuratorEngine'
*/

'use client';

// --- REFACTOR: Import from new 'ui' path ---
import { OptionCard } from './OptionCard';
// --- REFACTOR: Import type from new 'core' path ---
import { type Option } from '@/core/engine/configuratorEngine';

// Define the props this "dumb" component accepts
interface QuestionDisplayProps {
  question: string;
  options: Option[];
  onOptionClick: (value: string) => void;
}

export function QuestionDisplay({
  question,
  options,
  onOptionClick,
}: QuestionDisplayProps) {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
        {question}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {options.map((option, index) => (
          <OptionCard
            key={option.value + index}
            option={option}
            // Pass the click handler down, providing the option's value
            onClick={() => onOptionClick(option.value)}
          />
        ))}
      </div>
    </>
  );
}