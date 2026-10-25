import { BookOpenText, ChartCandlestick, FolderDown, ListChecks, Radio, Target } from 'lucide-react';
import type { SeccionRuta } from '@/data/academia';

const icons = { grafica: ChartCandlestick, accion: Target, metodo: BookOpenText, proceso: ListChecks, lives: Radio, biblioteca: FolderDown };

export default function RouteIcon({ name, size = 26 }: { name: SeccionRuta['icon']; size?: number }) {
  const Icon = icons[name];
  return <Icon size={size} aria-hidden="true" />;
}
