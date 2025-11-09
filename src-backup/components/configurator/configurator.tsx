/* *file-summary*
PATH: src/components/configurator/configurator.tsx

PURPOSE: Renders the primary user interface for the "click-based" guided product configurator, handling either the question flow or the final result.

SUMMARY: This is a core **smart component** that reads its state directly from the 'ConfiguratorContext'. It intelligently decides what to display based on the context's 'finalProducts' and 'currentQuestion' state.
- If the 'finalProducts' array is populated, the flow is considered finished. It takes the first product, constructs a 'productForCard' object (mapping 'image' to 'picture', building a full URL from 'slug', and using 'fullProductName' for the label), and renders the 'ResultProductCard'.
- If 'finalProducts' is empty but 'currentQuestion' exists, it renders the question's text and maps its 'options' array to multiple 'OptionCard' components.
- It wires the 'setAttribute' context function to the 'onClick' prop of each 'OptionCard', making them the "dumb triggers" for the Smarter Brain.

RELATES TO OTHER FILES:
- It is rendered by 'src/app/page.tsx' (for the desktop view) and 'src/components/configurator/configurator-tab.tsx' (for the mobile view).
- It is a primary consumer of state from 'src/context/ConfiguratorContext.tsx' via the 'useConfiguratorContext' hook.
- It imports and renders its "dumb" child components: './option-card.tsx' and './result-product-card.tsx'.
- It imports 'BASE_PRODUCT_URL' from 'src/lib/productDatabase.ts' to construct the final product link passed to the 'ResultProductCard'.

IMPORTS:
- useConfiguratorContext from '@/context/ConfiguratorContext'
- OptionCard from './option-card'
- ResultProductCard from './result-product-card'
- BASE_PRODUCT_URL from '@/lib/productDatabase'

EXPORTS:
- default Configurator (React component)
*/

'use client';

import { useConfiguratorContext } from '@/context/ConfiguratorContext';
import { OptionCard } from './option-card';
import { ResultProductCard } from './result-product-card';
// --- FIX: Import the base URL to construct the final link ---
import { BASE_PRODUCT_URL } from '@/lib/productDatabase';

export default function Configurator() {
  // 1. Destructure the NEW state variables and functions from the context
  const {
    currentQuestion,    // Replaces currentState
    finalProducts,      // Replaces sku and finalProduct
    fullProductName,    // Unchanged
    setAttribute,       // Replaces selectOption
  } = useConfiguratorContext();

  // 2. Check for the NEW final product state (an array)
  const isFinished = finalProducts && finalProducts.length > 0;
  
  // 3. Get the first product (or null) to display in the result card
  const productToShow = isFinished ? finalProducts[0] : null;

  // --- FIX: Create the 'product' prop for the card, constructing the full URL ---
  const productForCard = productToShow ? {
      label: fullProductName,
      picture: productToShow.image, // Map 'image' to 'picture'
      url: productToShow.slug ? `${BASE_PRODUCT_URL}${productToShow.slug}` : null // Construct the full URL
  } : null;
  // --- END FIX ---

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {isFinished && productForCard ? (
        // Render the final result card
        <>
          {/* Pass the newly constructed object */}
          <ResultProductCard product={productForCard} />
        </>
      ) : currentQuestion ? (
        // Render the current question and options
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            {currentQuestion.question}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {currentQuestion.options.map((option, index) => (
              <OptionCard
                key={option.value + index}
                option={option}
                // 4. Use the NEW onClick handler, passing attribute and value
                onClick={() =>
                  setAttribute(currentQuestion.attribute, option.value)
                }
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}