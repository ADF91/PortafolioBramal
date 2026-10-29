const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const paths: Record<string, string> = {
  // Bicicleta
  movilidad:
    'M5.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm13 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5.5 14l4-7h5m-2 0 6 7M9.5 7 12 14h-2m4.5-9H17',
  // Peatón en cruce
  'seguridad vial': 'M12 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-2 3 2-1 2 3 2.5 1M12 7.5 11 13l-2.5 4M11 13l2.5 2 1 3.5M3 21h18M5 21l1-2m4 2 1-2m3 2 1-2m3 2 1-2',
  // Escudo
  'seguridad ciudadana': 'M12 3 5 6v5c0 4.5 3 8.3 7 9.5 4-1.2 7-5 7-9.5V6l-7-3Zm-3 9 2 2 4-4',
  // Semáforo
  'gestion de transito':
    'M9 3h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 14v4m-3 0h6M12 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
};

// Cuadrícula urbana para categorías nuevas
const fallback = 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z';

export default function AreaIcon({ category }: { category: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[normalize(category)] ?? fallback} />
    </svg>
  );
}
