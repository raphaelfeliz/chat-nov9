/* *file-summary*
PATH: src/features/configurator/ui/ResultCard.tsx

PURPOSE: A "dumb" visual component to display the final selected product.

SUMMARY: This component receives a `product` object via props (containing
         label, picture, and url). It renders a large card with the
         product image, its full name, and a "Ver Preço" (See Price)
         button that links to the final product URL.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by the "smart" `src/features/configurator/Configurator.tsx`.
- It imports primitives from `src/components/ui/card.tsx` and `src/components/ui/button.tsx`.

IMPORTS:
- Image from 'next/image'
- { Card, CardContent } from '@/components/ui/card'
- { Button } from '@/components/ui/button'
*/

'use client';

import Image from 'next/image';
// --- REFACTOR: Import from new 'components/ui' path ---
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define the shape of the product prop
type ResultProduct = {
  label: string;
  picture: string | null;
  url: string | null;
};

interface ResultProductCardProps {
  product: ResultProduct;
}

export function ResultCard({ product }: ResultProductCardProps) {
  return (
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/3] w-full bg-muted">
          <Image
            src={product.picture || '/assets/placeholder.webp'}
            alt={product.label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
            {product.label}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Produto configurado! Você será direcionado para a página do produto
            para finalizar sua compra.
          </p>
          <Button
            asChild
            className="w-full"
            size="lg"
            disabled={!product.url}
          >
            <a
              href={product.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver Preço
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}