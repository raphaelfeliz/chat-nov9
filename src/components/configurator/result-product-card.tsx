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
     
      <Card className="w-2/3 overflow-hidden shadow-xl bg-card border-border md:grid md:grid-cols-2">
        {/* --- IMAGE --- */}
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

        {/* --- DETAILS --- */}
        <div className="flex flex-col justify-between">
          <div className="p-4 bg-card-foreground/5 md:bg-transparent md:p-6">
              <p className="text-base font-semibold text-card-foreground text-center md:text-left md:text-lg">
                {product.label}
              </p>
          </div>
          <CardFooter className="grid grid-cols-1 gap-2 p-4 md:p-6">
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
        </div>
      </Card>
    </div>
  );
}
