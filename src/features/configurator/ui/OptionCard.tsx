/* *file-summary*
PATH: src/features/configurator/ui/OptionCard.tsx

PURPOSE: A "dumb" visual component for a single clickable configuration option.

SUMMARY: This component receives an `option` object (with label, value, picture)
         and an `onClick` function via props. It renders a clickable Card
         primitive, displaying the option's image and label.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by `src/features/configurator/ui/QuestionDisplay.tsx`.
- It imports the `Option` type from `src/core/engine/configuratorEngine.ts`.
- It imports the `Card` primitive from `src/components/ui/card.tsx`.

IMPORTS:
- Image from 'next/image'
- { Card } from '@/components/ui/card'
- { type Option } from '@/core/engine/configuratorEngine'
*/

'use client';

import Image from 'next/image';
// --- REFACTOR: Import from new 'components/ui' path ---
import { Card } from '@/components/ui/card';
// --- REFACTOR: Import type from new 'core' path ---
import { type Option } from '@/core/engine/configuratorEngine';

interface OptionCardProps {
  option: Option;
  onClick: () => void;
}

export function OptionCard({ option, onClick }: OptionCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer group hover:border-primary transition-colors duration-200"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
        <Image
          src={option.picture || '/assets/placeholder.webp'}
          alt={option.label}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 text-center">
        <h3 className="text-sm font-medium text-foreground">{option.label}</h3>
      </div>
    </Card>
  );
}