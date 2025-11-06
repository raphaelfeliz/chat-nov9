'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/chat/card';
import { Button } from '@/components/global/button';
import { MessageSquare } from 'lucide-react';
import type { Option } from '@/lib/triage';
import { generateWhatsAppLink } from '@/lib/whatsapp';

type ResultProductCardProps = {
  product: Option;
};

export function ResultProductCard({ product }: ResultProductCardProps) {
  const handleWhatsAppClick = () => {
    const link = generateWhatsAppLink(product.label);
    window.open(link, '_blank');
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
        Produto encontrado
      </h2>
      <Card className="w-full max-w-sm overflow-hidden shadow-xl bg-card border-border">
        <CardContent className="p-0">
          <div className="relative aspect-square w-full bg-white">
            <Image
              src={product.picture}
              alt={product.label}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardContent>
        <div className="p-4 bg-card-foreground/5">
            <p className="text-base font-semibold text-card-foreground text-center">
              {product.label}
            </p>
        </div>
        <CardFooter className="grid grid-cols-1 gap-2 p-4">
          {product.url && (
            <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
              <Link href={product.url}>Ver Preço</Link>
            </Button>
          )}
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleWhatsAppClick}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Negociar no WhatsApp
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
