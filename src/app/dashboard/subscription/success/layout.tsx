'use client';

import { useEffect } from 'react';
import { usePageTitle } from '@/contexts/PageTitleContext';

export default function SubscriptionSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setPageTitle } = usePageTitle();

  // Define o título da página
  useEffect(() => {
    setPageTitle('Confirmação de Assinatura');
  }, [setPageTitle]);

  return children;
}
