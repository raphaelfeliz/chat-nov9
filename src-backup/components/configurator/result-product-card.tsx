/*
*file-summary*
PATH: src/components/configurator/result-product-card.tsx
PURPOSE: Display the final selected product with image, label, and actions.
SUMMARY: Presents a two-row card layout. Now safe against missing images
         and configures the product URL button to open in a new browser tab.
IMPORTS: React, Next.js Image/Link, Card components, Button, MessageSquare, generateWhatsAppLink
EXPORTS: ResultProductCard (React functional component)
*/

'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/configurator/card';
import { Button } from '@/components/global/button';
import { MessageSquare } from 'lucide-react';
// We rely on the parent component passing the correct product shape
import { generateWhatsAppLink } from '@/lib/whatsapp';

// --- Local Prop Type Definition ---
type ResultProductCardProps = {
  product: {
    label: string;
    picture: string | null | undefined; // Mapped from Product.image
    url?: string | null | undefined;    // Mapped from Product.slug (constructed URL)
    sku?: string;
  };
};

export function ResultProductCard({ product }: ResultProductCardProps) {
  const handleWhatsAppClick = () => {
    // The WhatsApp link construction is handled in a library function
    const link = generateWhatsAppLink(product.label);
    window.open(link, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center">

      <Card className="w-full max-w-2xl overflow-hidden shadow-xl bg-card border-border flex flex-col">
        {/* --- ROW 1: IMAGE + BUTTONS --- */}
        <div className="grid grid-cols-2">
          {/* --- IMAGE --- */}
          <CardContent className="p-0">
            <div className="relative aspect-square w-full bg-white">
              {/* Only render Image if product.picture is a valid string */}
              {product.picture ? (
                <Image
                  src={product.picture}
                  alt={product.label}
                  fill
                  className="object-contain p-2"
                  sizes="50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  (Imagem indisponível)
                </div>
              )}
            </div>
          </CardContent>

          {/* --- BUTTONS --- */}
          <div className="flex items-center justify-center bg-white/90">
            <CardFooter className="grid grid-cols-1 gap-2 p-4 md:p-6">
              {/* --- FIX: Added target="_blank" and rel="noopener noreferrer" --- */}
              {product.url && (
                <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                  <Link href={product.url} target="_blank" rel="noopener noreferrer">
                    Ver Preço
                  </Link>
                </Button>
              )}
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleWhatsAppClick}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Negociar
              </Button>
            </CardFooter>
          </div>
        </div>

        {/* --- ROW 2: PRODUCT NAME --- */}
        <div className="p-4 text-center">
          <p className="text-base font-semibold text-card-foreground md:text-lg">
            {product.label}
          </p>
        </div>
      </Card>
    </div>
  );
}