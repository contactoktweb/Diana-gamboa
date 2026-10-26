import RevealOnScroll from '@/components/RevealOnScroll';

/* Se vuelve a montar en cada cambio de página: aplica la transición de entrada. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition"><RevealOnScroll />{children}</div>;
}
