'use client';

import { useConfiguratorContext } from '@/context/ConfiguratorContext';
import { OptionCard } from './option-card';
import { ResultProductCard } from './result-product-card';

export function Configurator() {
  const { currentState, sku, selectOption, finalProduct, fullProductName } =
    useConfiguratorContext();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {sku && finalProduct ? (
        <>
          <ResultProductCard product={{...finalProduct, label: fullProductName}} />
        </>
      ) : currentState ? (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            <span className="text-primary font-bold">Encontre Fácil:</span>{" "}
            {currentState.question}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {currentState.options.map((option, index) => (
              <OptionCard
                key={option.value + index}
                option={option}
                onClick={() => selectOption(index)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
