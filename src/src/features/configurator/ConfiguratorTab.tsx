/* *file-summary*
PATH: src/features/configurator/ConfiguratorTab.tsx
PURPOSE: The "smart" layout manager for the configurator feature.
SUMMARY: This component (formerly Configurator.tsx) is the main "tab"
 for the configurator. It consumes the ConfiguratorContext and decides
 whether to show the current question or the final result.
 The logic from QuestionDisplay.tsx and ResultCard.tsx has been merged
 into this file. This component renders *only* its content, and its
 parent (in page.tsx) handles the scrolling container.
RELATES TO OTHER FILES:
- This is the "smart" parent for the configurator feature.
- It is imported by `src/app/page.tsx`.
- It consumes state from `src/core/state/ConfiguratorContext.tsx`.
- It imports its "dumb" child `OptionCard.tsx`.
IMPORTS:
- React
- useConfiguratorContext from '@/core/state/ConfiguratorContext'
- BASE_PRODUCT_URL from '@/core/engine/productDatabase'
- OptionCard from '@/features/configurator/ui/OptionCard'
- Image from 'next/image'
- { Card, CardContent } from '@/components/ui/card'
- { Button } from '@/components/ui/button'
- { generateWhatsAppLink } from '@/lib/utils'
- { MessageCircle } from 'lucide-react'
- { type Option, type Product } from '@/core/engine/configuratorEngine'
EXPORTS:
- ConfiguratorTab (React component)
*/

'use client';

import React from 'react';
import Image from 'next/image';
import { useConfiguratorContext } from '@/core/state/ConfiguratorContext';
import { BASE_PRODUCT_URL } from '@/core/engine/productDatabase';
import { OptionCard } from '@/features/configurator/ui/OptionCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateWhatsAppLink } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import { type Option, type Product } from '@/core/engine/configuratorEngine';


// --- SECTION: SUB-COMPONENTS: Logic from deprecated files merged in ---

interface QuestionDisplayProps {
  question: string;
  options: Option[];
  onOptionClick: (option: Option) => void;
}

/**
 * This component (formerly QuestionDisplay.tsx) renders the
 * current question and its grid of options.
 */
const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, options, onOptionClick }) => {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
        {question}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            option={option}
            imageUrl={`${BASE_PRODUCT_URL}${option.picture}`}
            onClick={() => onOptionClick(option)}
          />
        ))}
      </div>
    </div>
  );
};

interface ResultCardProps {
  product: Product;
  productName: string;
}

/**
 * This component (formerly ResultCard.tsx) renders the
 * final product card with the WhatsApp link.
 */
const ResultCard: React.FC<ResultCardProps> = ({ product, productName }) => {
  const whatsAppLink = generateWhatsAppLink({
    productName: productName,
  });

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
        {productName}
      </h2>
      <Card className="w-full max-w-md mx-auto overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full">
            <Image
              src={`${BASE_PRODUCT_URL}${product.picture}`}
              alt={productName}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6 space-y-4">
            <Button asChild size="lg" className="w-full">
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                Ver Preço
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <a href={whatsAppLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat on WhatsApp
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


// --- SECTION: MAIN COMPONENT: The ConfiguratorTab ---

export function ConfiguratorTab() {
  // --- SECTION: STATE: Get state from the global context.
  const {
    currentQuestion,
    finalProducts,
    fullProductName,
    setAttribute,
  } = useConfiguratorContext();

  const handleOptionClick = (option: Option) => {
    if (currentQuestion) {
      setAttribute(currentQuestion.attribute, option.value);
    }
  };

  // --- SECTION: RENDER: Decide what to show.
  return (
    // This container's parent in page.tsx is handling the scrolling.
    // This component just renders its content, which can be as tall as it needs to be.
    <div className="container mx-auto px-4 py-8 md:py-12">
      {finalProducts && finalProducts.length > 0 ? (
        // 1. Show Final Product Card
        <ResultCard
          product={finalProducts[0]}
          productName={fullProductName}
        />
      ) : currentQuestion ? (
        // 2. Show Current Question
        <QuestionDisplay
          question={currentQuestion.question}
          options={currentQuestion.options}
          onOptionClick={handleOptionClick}
        />
