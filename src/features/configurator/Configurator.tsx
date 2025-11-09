/* *file-summary*
PATH: src/features/configurator/Configurator.tsx

PURPOSE: The "smart" controller for the Configurator feature (Pillar 1).

SUMMARY: This is the "configurator logic folder." It consumes the
         ConfiguratorContext to get the current state. It then decides
         whether to render the final `ResultCard` (if the flow is finished)
         or the `QuestionDisplay` (if the flow is ongoing).

RELATES TO OTHER FILES:
- It is the "smart" parent for this feature.
- It is imported by `src/app/page.tsx`.
- It consumes state from `src/core/state/ConfiguratorContext.tsx`.
- It imports its "dumb" children from `./ui/QuestionDisplay.tsx` and `./ui/ResultCard.tsx`.
- It imports data from `src/core/engine/productDatabase.ts`.

IMPORTS:
- useConfiguratorContext from '@/core/state/ConfiguratorContext'
- BASE_PRODUCT_URL from '@/core/engine/productDatabase'
- QuestionDisplay from './ui/QuestionDisplay'
- ResultCard from './ui/ResultCard'
*/

'use client';

// --- REFACTOR: Import from new 'core' and 'ui' paths ---
import { useConfiguratorContext } from '@/core/state/ConfiguratorContext';
import { BASE_PRODUCT_URL } from '@/core/engine/productDatabase';
import { QuestionDisplay } from './ui/QuestionDisplay';
import { ResultCard } from './ui/ResultCard';
import { FacetAttribute } from '@/core/engine/configuratorEngine';

export default function Configurator() {
  // 1. Get all state and triggers from the global context
  const {
    currentQuestion,
    finalProducts,
    fullProductName,
    setAttribute, // This will be passed down
  } = useConfiguratorContext();

  // 2. Check if the flow is finished
  const isFinished = finalProducts && finalProducts.length > 0;
  const productToShow = isFinished ? finalProducts[0] : null;

  // 3. Prepare props for the "dumb" ResultCard component
  const productForCard = productToShow
    ? {
        label: fullProductName,
        picture: productToShow.image,
        url: productToShow.slug
          ? `${BASE_PRODUCT_URL}${productToShow.slug}`
          : null,
      }
    : null;

  // 4. Prepare the click handler for the "dumb" QuestionDisplay component
  const handleOptionClick = (attribute: FacetAttribute, value: string) => {
    setAttribute(attribute, value);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {isFinished && productForCard ? (
        // --- RENDER FINAL RESULT ---
        // Pass the prepared product data down
        <ResultCard product={productForCard} />
      ) : currentQuestion ? (
        // --- RENDER CURRENT QUESTION ---
        // Pass all data and the click handler down as props
        <QuestionDisplay
          question={currentQuestion.question}
          options={currentQuestion.options}
          onOptionClick={(value) =>
            handleOptionClick(currentQuestion.attribute, value)
          }
        />
      ) : (
        // Initial load or error state
        <div className="text-center text-muted-foreground">Carregando...</div>
      )}
    </div>
  );
}