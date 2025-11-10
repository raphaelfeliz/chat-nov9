/* *file-summary*
PATH: src/features/configurator/ui/ResultCard.tsx

PURPOSE: A "dumb" visual component to display the final selected product.

SUMMARY: This component receives a `product` object via props (containing
         label, picture, and url). It renders a large card with the
         product image, its full name, a "Ver Preço" button, and
         a new "Chat on WhatsApp" button.

RELATES TO OTHER FILES:
- This is a "dumb" UI component.
- It is imported and rendered by the "smart" `src/features/configurator/Configurator.tsx`.
- It imports primitives from `src/components/ui/card.tsx` and `src/components/ui/button.tsx`.
- It imports `generateWhatsAppLink` from `src/lib/utils.ts`.

IMPORTS:
- Image from 'next/image'
- { Card, CardContent } from '@/components/ui/card'
- { Button } from '@/components/ui/button'
- { generateWhatsAppLink } from '@/lib/utils'
- { MessageCircle } from 'lucide-react'
*/

'use client';

import Image from 'next/image';
// --- REFACTOR: Import from new 'components/ui' path ---
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// --- NEW (Phase 1) ---
import { generateWhatsAppLink } from '@/lib/utils';
import { MessageCircle } from 'lucide-react'; // For the button icon

// --SECTION: TYPE DEFINITIONS
type ResultProduct = {
  label: string;
  picture: string | null;
  url: string | null;
};

interface ResultProductCardProps {
  product: ResultProduct;
}

// --SECTION: COMPONENT
export function ResultCard({ product }: ResultProductCardProps) {
  
  // --SECTION: EVENT HANDLERS
  /**
   * (Phase 1) Handles the click on the WhatsApp button.
   */
  const handleWhatsAppClick = () => {
    // Generate the link using the product label
    const whatsAppLink = generateWhatsAppLink({
      productName: product.label,
    });
    // Open the link in a new tab
    window.open(whatsAppLink, '_blank', 'noopener,noreferrer');
  };

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
            priority // Added priority as suggested by Next.js warning
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
          <div className="flex flex-col gap-3">
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
            {/* --- NEW (Phase 1) --- */}
            <Button
              variant="outline" // Use 'outline' or 'secondary' for a different look
              className="w-full"
              size="lg"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat on WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}