import { BookOpen, BookOpenText, ChartCandlestick, ChartNoAxesCombined, Compass, FolderDown, GraduationCap, ListChecks, Radio, Route, Target, Users, type LucideIcon } from 'lucide-react';

export const ICONOS: Record<string, LucideIcon> = {
  grafica: ChartCandlestick, analizar: ChartNoAxesCombined, criterio: Compass, clases: BookOpen, ruta: Route,
  lives: Radio, biblioteca: FolderDown, salon: Users, cursos: GraduationCap, accion: Target, metodo: BookOpenText, proceso: ListChecks,
};

export function Icono({ nombre, size = 24 }: { nombre: string; size?: number }) {
  const I = ICONOS[nombre] ?? ChartCandlestick;
  return <I size={size} aria-hidden="true" />;
}
