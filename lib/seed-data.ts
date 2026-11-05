import { LEGACY_MEDIA_BASE as S3 } from './site';

const img = (p: string) => `${S3}/images/${p}`;
const vid = (p: string) => `${S3}/videos/${p}`;
const CAM = '/presentaciones/camara-ia-audio';

type SeedMedia = { kind: 'image' | 'video'; src: string; poster?: string; caption?: string };
type SeedSpec = { group: string | null; label: string; value: string };

export type SeedProject = {
  slug: string;
  title: string;
  tagline?: string;
  summary: string;
  description?: string;
  category: string;
  tags: string[];
  highlights?: string[];
  applications?: string[];
  model?: string;
  location?: string;
  specs?: SeedSpec[];
  presentationUrl?: string;
  coverImage: string;
  media: SeedMedia[];
  featured?: boolean;
};

/** Convierte bloques "Grupo → [[etiqueta, valor], …]" en filas de especificación. */
function specs(groups: Record<string, [string, string][]>): SeedSpec[] {
  return Object.entries(groups).flatMap(([group, rows]) => rows.map(([label, value]) => ({ group, label, value })));
}

/**
 * Proyectos para la importación inicial: los publicados en portafolio.bramal.cl,
 * complementados con las fichas técnicas de Bramal (2026).
 */
export const seedProjects: SeedProject[] = [
  {
    slug: 'bicicla-totem',
    title: 'BICICLA TOTEM',
    tagline: 'Contador inteligente de bicicletas',
    model: 'TF · Tótem contador de ciclistas',
    summary:
      'Tótem inteligente que contabiliza bicicletas en circulación y entrega información útil a los usuarios. Permite obtener datos sobre el uso de ciclovías.',
    description:
      'Sistema inteligente de monitoreo de movilidad sostenible que registra y visualiza en tiempo real el flujo de ciclistas en vías urbanas, mediante espira inductiva con detección de sentido de paso.\n\nLos datos se transmiten automáticamente a la nube. Ante una pérdida de conectividad el equipo sigue operando de forma autónoma y sincroniza los eventos pendientes al restablecerse la conexión. Toda la información puede consultarse en el portal web bicicla.bramal.cl, con conteos históricos, comparativas entre ubicaciones y descarga de reportes.\n\nDe forma opcional, el sistema incorpora una cámara IP con video analítica basada en IA para contar y clasificar ciclistas, peatones y scooters.',
    category: 'Movilidad',
    tags: ['Ciclovías', 'Datos', 'Smart city', 'IoT'],
    highlights: [
      'Conteo por espira inductiva con detección de sentido de paso',
      'Pantalla con conteos diarios, mensuales y anuales, temperatura, fecha y hora',
      'Transmisión a la nube con respaldo local y sincronización automática',
      'Portal web con históricos, comparativas y descarga de reportes',
      'Módulo opcional de video analítica con IA',
    ],
    applications: [
      'Monitoreo de flujo de ciclistas en ciclovías urbanas',
      'Planificación de infraestructura de movilidad sostenible',
      'Evaluación del impacto de políticas públicas de movilidad',
      'Promoción del uso de la bicicleta con información ciudadana',
    ],
    specs: specs({
      Estructura: [
        ['Dimensiones', '1979 × 600 × 200 mm'],
        ['Material', 'Acrílico antivandálico de 8 mm'],
        ['Protección', 'IP55, resistente a rayos UV'],
        ['Ventilación', 'Control térmico con ventiladores internos'],
      ],
      'Sistema de conteo': [
        ['Sensor', 'Espira inductiva con microcontrolador'],
        ['Detección', 'Sentido de paso (entrada / salida)'],
        ['Sensibilidad', 'Ajustable según entorno y tráfico'],
        ['Almacenamiento', 'Memoria local redundante'],
      ],
      'Operación y datos': [
        ['Procesamiento', 'PC industrial para entornos exigentes'],
        ['Operación', '24/7 con bajo consumo energético'],
        ['Plataforma', 'bicicla.bramal.cl'],
      ],
    }),
    coverImage: img('Proyectos/bicicla.jpg'),
    featured: true,
    media: [
      { kind: 'video', src: vid('Bicicla/20250610_162726.mp4'), poster: img('Proyectos/Bicicla/20250610_162726.png') },
      { kind: 'video', src: vid('Bicicla/20250610_162850.mp4'), poster: img('Proyectos/Bicicla/20250610_162850.png') },
    ],
  },
  {
    slug: 'cruce-peatonal-bricks-iluminados',
    title: 'Cruce Peatonal Inteligente con Bricks Iluminados',
    tagline: 'Luces LED tipo ladrillo empotradas en el pavimento',
    model: 'Brick Light ST-BRK-05',
    location: 'Lo Barnechea',
    summary:
      'Sistema de paso peatonal con bricks LED programables. Mejoran la visibilidad y seguridad de los cruces peatonales, logrando incluso reemplazar un semáforo tradicional.',
    description:
      'Luminarias LED tipo ladrillo, empotradas en el pavimento, que delimitan el cruce y lo hacen visible en todas las condiciones climáticas. Están diseñadas para soportar tráfico vehicular pesado, con superficie antideslizante y alta resistencia al impacto.\n\nSe configuran en cadenas de 5 o 10 unidades y están disponibles en blanco, bicolor rojo-blanco y amarillo. Proyecto de referencia: paso peatonal en la comuna de Lo Barnechea.',
    category: 'Seguridad vial',
    tags: ['LED', 'Peatones', 'Pavimento'],
    highlights: [
      'Instalación empotrada, resistente a tráfico vehicular pesado',
      'Superficie antideslizante y resistencia al impacto IK10',
      'Visible en todas las condiciones climáticas',
      'Configuraciones de 5 o 10 unidades, precableadas',
      'Versiones blanco, rojo-blanco y amarillo',
    ],
    applications: [
      'Cruces peatonales urbanos',
      'Pasos de cebra con o sin semáforos',
      'Líneas de detención peatonal y vehicular',
      'Áreas de espera peatonal',
    ],
    specs: specs({
      Eléctricas: [
        ['Alimentación', 'DC 24 V'],
        ['Consumo', '≤ 6 W por unidad'],
        ['Aislamiento', 'Clase III'],
      ],
      Físicas: [
        ['Dimensiones', '400 × 130 × 60 mm'],
        ['Con base metálica', '465 × 180 × 68 mm'],
        ['Peso', '4,5 kg (≈ 10 kg con base)'],
        ['Carcasa', 'Policarbonato resistente UV'],
        ['Base', 'Acero galvanizado en caliente, 3 mm'],
      ],
      'Ópticas y durabilidad': [
        ['LEDs', '126 por unidad'],
        ['Vida útil', '80.000 horas'],
        ['Carga estática', '50 tN'],
        ['Protección', 'IP65 / IP68 · IK10'],
        ['Antideslizante', '≥ SRV 55 (EN 16165)'],
      ],
      Certificaciones: [['Normas', 'CE-LVD, CE-EMC, LM-79, ISO 9001']],
    }),
    coverImage: img('Proyectos/Bricks/Bricks.png'),
    featured: true,
    media: [
      { kind: 'video', src: vid('Bricks/bricks.mp4'), poster: img('Proyectos/Bricks/Bricks.png') },
      { kind: 'video', src: vid('Bricks/bricks1.mp4'), poster: img('Proyectos/Bricks/Bricks1.png') },
    ],
  },
  {
    slug: 'cruce-peatonal-zonas-de-riesgo',
    title: 'Cruce Peatonal para Colegios, Hospitales y Zonas de Riesgo',
    summary:
      'Cruce diseñado para áreas de alta vulnerabilidad o alto tránsito peatonal. Aumenta la visibilidad y reduce accidentes, generando una mayor sensación de seguridad.',
    category: 'Seguridad vial',
    tags: ['Peatones', 'Colegios', 'Hospitales'],
    coverImage: img('Proyectos/cruce+peatonal.png'),
    media: [{ kind: 'video', src: vid('cruce+peatonal.mp4'), poster: img('Proyectos/cruce+peatonal.png') }],
  },
  {
    slug: 'luces-led-postes-semaforos',
    title: 'Luces LED en Postes de Semáforos',
    tagline: 'Repetidor de estado de semáforo con cinta LED',
    model: 'Repetidor Cinta LED',
    summary:
      'Incorporación de iluminación LED en postes de semáforos para mejorar la visibilidad y seguridad vial. Solución eficiente y de bajo consumo energético.',
    description:
      'Sistema de iluminación lineal con tira LED encapsulada (IP68) y controlador electrónico (IP65), diseñado para operación continua en exteriores. Se instala sobre postes metálicos o elementos estructurales y replica en color rojo, amarillo o verde el estado del semáforo.\n\nEl controlador permite regulación de brillo (PWM) para atenuación nocturna y secuencias programables de refuerzo de visibilidad, configurables según cada proyecto y la normativa local.',
    category: 'Gestión de tránsito',
    tags: ['LED', 'Semáforos', 'Eficiencia energética'],
    highlights: [
      'Replica los estados rojo, amarillo y verde del semáforo',
      'Regulación de brillo PWM y secuencias programables',
      'Tira encapsulada IP68, resistente a impacto y vibración',
      'Bajo consumo: ≤ 6 W por metro',
    ],
    applications: [
      'Repetidor de estado de semáforo en postes y soportes',
      'Guía luminosa en entornos urbanos y pasos peatonales',
      'Señalización de advertencia en cruces y accesos controlados',
    ],
    specs: specs({
      'Tira LED': [
        ['Tipo de LED', 'SMD 5050 (opcional SMD 2835)'],
        ['Colores', 'Rojo / Amarillo / Verde'],
        ['Flujo luminoso', '≈ 708 lm por metro'],
        ['Tensión', '24 Vcc'],
        ['Consumo', '≤ 6 W/m'],
        ['Ángulo de apertura', '≈ 120°'],
        ['Protección', 'IP68, gel de sílice'],
        ['Vida útil', 'Hasta 50.000 h'],
        ['Longitud nominal', '6 m'],
      ],
      Controlador: [
        ['Entrada', '110–220 Vac, 50/60 Hz'],
        ['Salida', '24 Vcc regulada'],
        ['Control', 'On/Off + PWM, secuencias programables'],
        ['Protección', 'IP65'],
        ['Temperatura', '–20 °C a +60 °C'],
      ],
      Cumplimiento: [['Normas', 'CE, RoHS · fabricación ISO 9001']],
    }),
    coverImage: img('Proyectos/semaforo_led.jpg'),
    media: [{ kind: 'video', src: vid('LED+Sem%C3%A1foros.mp4'), poster: img('Proyectos/semaforo_led.jpg') }],
  },
  {
    slug: 'hurry-call',
    title: 'Hurry Call',
    tagline: 'Prioridad para servicios de emergencia',
    summary:
      'Sistema que prioriza el paso de vehículos de emergencia. Al recibir una alerta, los semáforos cambian a rojo y las pantallas informativas advierten a los conductores.',
    category: 'Gestión de tránsito',
    tags: ['Emergencias', 'Semáforos'],
    coverImage: img('Proyectos/Hurry+Call.png'),
    featured: true,
    media: [{ kind: 'video', src: vid('Hurry+Call/20250724_154901_1_1.mp4'), poster: img('Proyectos/Hurry+Call.png') }],
  },
  {
    slug: 'bramal-vision',
    title: 'Bramal Vision',
    tagline: 'Tránsito inteligente para su comuna',
    summary:
      'Solución que integra cámaras con inteligencia artificial en los semáforos, una plataforma central en la nube y un panel web de fácil uso, para entregar a la comuna información de tránsito en tiempo real con la cual fiscalizar, planificar y tomar mejores decisiones.',
    description:
      'En terreno, la inteligencia funciona junto a las cámaras: cuenta vehículos, peatones y ciclistas, detecta infracciones de velocidad y luz roja, y sigue operando sin internet, almacenando los registros para enviarlos después.\n\nLa plataforma central reúne todos los datos en un solo lugar: recibe y confirma cada registro, guarda el historial en la nube, incorpora un asistente de IA para hacer consultas en lenguaje natural y permite controlar y configurar los equipos a distancia.\n\nDesde la plataforma web, la comuna opera con un panel en tiempo real, filtros de conteo y análisis, informes ejecutivos en PDF y CSV, y la revisión de infracciones con evidencia fotográfica. La solución se integra con la UOCT mediante el envío automático y seguro de eventos, con información trazable y reintentos, lista para la operación municipal.',
    category: 'Gestión de tránsito',
    tags: ['Inteligencia artificial', 'Semáforos', 'Fiscalización', 'UOCT', 'Datos'],
    highlights: [
      'Conocer el flujo real de vehículos, peatones y ciclistas',
      'Fiscalizar con evidencia: velocidad y luz roja',
      'Decidir con datos de hoy, en un panel en tiempo real',
      'Informar a la UOCT y a los vecinos con reportes y alertas',
      'Crecer sin rehacer: se agregan nuevas ubicaciones',
    ],
    applications: [
      'Fiscalización de velocidad y luz roja con evidencia fotográfica',
      'Planificación de tránsito con conteos de vehículos, peatones y ciclistas',
      'Reportes y alertas para la UOCT y los vecinos',
      'Operación municipal de tránsito con datos en tiempo real',
    ],
    specs: specs({
      'Equipo en terreno': [
        ['Conteo', 'Vehículos, peatones y ciclistas'],
        ['Infracciones', 'Velocidad y luz roja'],
        ['Sin conexión', 'Almacena los registros y los envía luego'],
      ],
      'Plataforma central': [
        ['Registros', 'Recibe y confirma cada registro'],
        ['Historial', 'Almacenado en la nube'],
        ['Asistente de IA', 'Consultas en lenguaje natural'],
        ['Gestión remota', 'Control y configuración de equipos'],
      ],
      'Plataforma web': [
        ['Panel', 'Tiempo real'],
        ['Análisis', 'Filtros de conteo y análisis'],
        ['Informes', 'Ejecutivos en PDF y CSV'],
        ['Infracciones', 'Revisión con evidencia fotográfica'],
      ],
      'Integración UOCT': [
        ['Envío de eventos', 'Automático y seguro'],
        ['Trazabilidad', 'Información trazable y con reintentos'],
      ],
    }),
    coverImage: '/media/bramal-vision/semaforos.jpg',
    featured: true,
    media: [
      { kind: 'image', src: '/media/bramal-vision/semaforos.jpg', caption: 'Semáforos con cámara de inteligencia artificial integrada' },
      { kind: 'image', src: '/media/bramal-vision/que-obtiene-la-comuna.jpg', caption: 'Qué obtiene la comuna' },
      { kind: 'image', src: '/media/bramal-vision/como-lo-logramos.jpg', caption: 'Cómo lo logramos: equipo en terreno, plataforma central, plataforma web e integración con la UOCT' },
      { kind: 'image', src: '/media/bramal-vision/infografia-bramal-vision.jpg', caption: 'Infografía completa' },
    ],
  },
  {
    slug: 'camara-ia-deteccion-acustica',
    title: 'Cámara IA de Detección Acústica',
    tagline: 'Fiscalización inteligente del ruido vehicular',
    model: 'iDS-TCI903-FIV',
    summary:
      'Cámara inteligente que detecta eventos acústicos vehiculares —bocinas y ruido de motor o escape—, localiza su origen en la vía, lo asocia al vehículo y lee su patente, generando evidencia audiovisual en tiempo real.',
    description:
      'El uso indebido de la bocina y el ruido anormal de motor o escape son fuentes relevantes de contaminación acústica urbana, pero su fiscalización manual depende de un inspector presente en el momento exacto del evento.\n\nLa cámara combina un sensor de imagen de 9 MP con un módulo de análisis acústico: calcula el origen del sonido dentro de la escena, lo representa como una nube acústica sobre el vehículo, lo sigue con un recuadro de seguimiento y reconoce su patente. Cada evento genera video, imágenes y metadata (fecha, hora, patente y carril) para revisión posterior.\n\nLa medición certificada en dB(A) y su uso para fiscalización normativa requieren validación metrológica y jurídica. Proponemos una prueba piloto en terreno para validar la solución con cada cliente.',
    category: 'Gestión de tránsito',
    tags: ['Inteligencia artificial', 'Ruido urbano', 'LPR', 'Fiscalización'],
    highlights: [
      'Detección de bocinas y de ruido de motor o escape',
      'Localización acústica del evento sobre la imagen',
      'Asociación automática al vehículo y lectura de patente (LPR)',
      'Evidencia en video, imagen y metadata por evento',
      'Monitoreo simultáneo de hasta 3 carriles',
      'Integración ONVIF, ISAPI y SDK con plataformas de terceros',
    ],
    applications: [
      'Control del uso indebido de bocina (Ley N.º 18.290, art. 74)',
      'Focalización de controles de ruido de motor y escape',
      'Programas municipales de prevención de ruidos molestos',
      'Datos objetivos para la gestión ambiental urbana',
    ],
    specs: specs({
      Imagen: [
        ['Sensor', '9 MP, 1"'],
        ['Lente', '25 mm, F1.4, enfoque automático'],
        ['Resolución de video', 'Hasta 4K (4096 × 2160)'],
        ['Compresión', 'H.265 / H.264'],
        ['WDR', '60 dB'],
      ],
      Instalación: [
        ['Altura de poste', '6 m (referencia)'],
        ['Rango de detección', '10 a 50 m desde el poste'],
        ['Carriles', 'Hasta 3 por equipo'],
      ],
      Físicas: [
        ['Dimensiones', '369 × 138 × 383 mm'],
        ['Peso', '≈ 6 kg'],
        ['Material', 'Aleación de aluminio'],
        ['Protección', 'IP55, contra sobretensiones'],
        ['Temperatura', '–30 °C a 60 °C'],
      ],
      Conectividad: [
        ['Red', 'Ethernet RJ45 10/100/1000 Mbps'],
        ['Integración', 'ONVIF (S y G), ISAPI, SDK'],
        ['Serial / alarmas', 'RS-485, RS-232 · 1 entrada / 6 salidas'],
      ],
    }),
    presentationUrl: `${CAM}/index.html`,
    coverImage: `${CAM}/Screen1.jpeg`,
    featured: true,
    media: [
      { kind: 'video', src: `${CAM}/Video.mp4`, poster: `${CAM}/Screen1.jpeg`, caption: 'Demostración del sistema' },
      { kind: 'image', src: `${CAM}/Screen1.jpeg`, caption: 'Evidencia generada: localización acústica, seguimiento y patente' },
      { kind: 'image', src: `${CAM}/iDS-TCI903-FIV_Dimensionsimage_1.png`, caption: 'Dimensiones del equipo' },
    ],
  },
  {
    slug: 'radar-pedagogico-velocidad',
    title: 'Radar Pedagógico de Velocidad',
    summary:
      'Permite visualizar si un conductor excede el límite de velocidad. Busca crear conciencia en los conductores y ayuda a obtener datos relevantes para justificar medidas como la instalación de un semáforo.',
    category: 'Seguridad vial',
    tags: ['Velocidad', 'Datos'],
    coverImage: img('Proyectos/Radar+Pedag%C3%B3gico.png'),
    media: [{ kind: 'video', src: vid('Radar+Pedag%C3%B3gico.mp4'), poster: img('Proyectos/Radar+Pedag%C3%B3gico.png') }],
  },
  {
    slug: 'control-velocidad-ppu',
    title: 'Control de Velocidad y Reconocimiento de PPU',
    tagline: 'Radar de 77 GHz, lectura de patentes y display LED',
    model: 'iDS-TCM403-GIR · YJP7681-188-NR',
    summary:
      'Cámara ANPR asistida por radar que mide la velocidad, reconoce la PPU y registra la imagen del vehículo, junto a un display LED exterior que informa al conductor su velocidad y patente: verde dentro del límite y rojo al excederlo.',
    description:
      'La cámara mide la velocidad con un radar integrado de 77 GHz, reconoce la placa patente única (PPU) con un motor de IA compatible con patentes chilenas y captura la imagen del vehículo, de día y de noche gracias a su iluminación infrarroja.\n\nEl software de gestión recibe y asocia velocidad, PPU, fecha, hora, ubicación e imagen; aplica los límites y reglas configurados, almacena la evidencia y permite su consulta, exportación y trazabilidad. El display exterior entrega información preventiva inmediata al conductor.\n\nUna detección automática no equivale por sí sola a una sanción: la entidad responsable valida la evidencia y aplica el procedimiento vigente. Conectividad, obra civil, soportes, energía e integración se dimensionan para cada proyecto.',
    category: 'Seguridad vial',
    tags: ['Radar', 'ANPR', 'Velocidad', 'Fiscalización'],
    highlights: [
      'Medición de velocidad con radar integrado de 77 GHz',
      'Reconocimiento automático de PPU, compatible con patentes chilenas',
      'Display LED con velocidad y PPU: verde dentro del límite, rojo al excederlo',
      'Operación diurna y nocturna con iluminación infrarroja',
      'Evidencia con velocidad, PPU, fecha, hora, ubicación e imagen',
      'Cobertura de hasta 3 pistas',
    ],
    applications: [
      'Control de velocidad en vías urbanas y accesos controlados',
      'Zonas escolares, condominios, campus y parques industriales',
      'Puertos y recintos privados',
      'Registro de evidencia para revisión y eventual sanción',
    ],
    specs: specs({
      'Cámara ANPR con radar': [
        ['Resolución', '4 MP (2688 × 1520), CMOS 1/1,8"'],
        ['Radar', '77 GHz, FMCW, detección hasta 50 m'],
        ['Rango de captura', '5 a 120 km/h'],
        ['Cobertura', 'Hasta 3 pistas'],
        ['Iluminación IR', '3 iluminadores 850 nm, hasta 50 m'],
        ['Óptica', '2,8–12 mm u 8–32 mm, autofoco'],
        ['WDR / compresión', '140 dB · H.264, H.265, MJPEG'],
        ['Protección', 'IP67 · IK10'],
        ['Alimentación', '12–24 VDC (máx. 15 W) o PoE 802.3at'],
      ],
      'Display LED': [
        ['Contenido', 'Velocidad, PPU e iconografía de advertencia'],
        ['Visibilidad', 'Hasta 100 m'],
        ['Intensidad', '≥ 3.000 cd/m², ángulo > 100°'],
        ['Vida útil LED', '≥ 100.000 horas'],
        ['Red', 'Ethernet 10/100, Wi-Fi 2,4 GHz'],
        ['Protección', 'IP66'],
        ['Dimensiones', '759 × 96 × 810 mm, ≈ 15,2 kg'],
      ],
      Operación: [
        ['Temperatura', '–30 °C a 70 °C'],
        ['Garantía', '1 año'],
      ],
    }),
    coverImage: '/media/control-velocidad/instalacion.jpg',
    media: [
      { kind: 'image', src: '/media/control-velocidad/instalacion.jpg', caption: 'Cámara ANPR con radar y display LED instalados' },
      { kind: 'image', src: '/media/control-velocidad/portada.svg', caption: 'Cámara ANPR con radar iDS-TCM403-GIR y display LED YJP7681-188-NR' },
    ],
  },
  {
    slug: 'escudo-opti-acustico',
    title: 'Escudo Optoacústico de Protección',
    tagline: 'Protección, advertencia y dispersión',
    model: 'Bramal SL10C',
    summary:
      'Escudo portátil de policarbonato de alto impacto con módulo optoacústico integrado: sonido direccional de alta intensidad y luces de deslumbramiento para advertencia y dispersión, operado por una sola persona.',
    description:
      'El módulo SL10C se integra en el sector inferior de un escudo transparente de policarbonato de alto impacto, que mantiene la visibilidad frontal del operador. Su emisión sonora es altamente direccional, lo que reduce la incidencia sobre personas fuera del frente de emisión.\n\nEl equipo fue sometido a pruebas de lluvia, temperaturas extremas, calor húmedo, vibración, impacto y punción. Su operación requiere protección auditiva y seguir las instrucciones de seguridad del fabricante.',
    category: 'Seguridad ciudadana',
    tags: ['Seguridad', 'Protección personal', 'Optoacústico'],
    highlights: [
      'Escudo transparente de policarbonato de alto impacto',
      'Sonido direccional ≥ 133 dB y luces de ≥ 2.200 lm',
      'Operación manual por una sola persona',
      'Autonomía ≥ 30 minutos con sonido y luz simultáneos',
    ],
    applications: [
      'Protección individual, advertencia y dispersión',
      'Apoyo a instituciones de seguridad y manejo de eventos',
      'Protección de instalaciones u objetivos críticos',
      'Disuasión de animales peligrosos y fauna silvestre',
    ],
    specs: specs({
      Desempeño: [
        ['Presión sonora máx.', '≥ 133 dB ±2 dB @ 1 m'],
        ['Luces de deslumbramiento', '≥ 2.200 lm'],
        ['Haz sonoro', '±15° @ –3 dB'],
        ['Distancia de dispersión', '> 5 m'],
      ],
      Energía: [
        ['Batería', 'Ion-litio 3.000 mAh, 12,6 V'],
        ['Autonomía', '≥ 30 min (sonido + luz)'],
      ],
      Construcción: [
        ['Módulo SL10C', '445 × 200 × 100 mm, 1,9 kg'],
        ['Material del módulo', 'Aleación de aluminio'],
        ['Escudo', 'Policarbonato de alto impacto'],
        ['Garantía', '1 año'],
      ],
    }),
    coverImage: img('Proyectos/Escudo/escudo.jpg'),
    media: [{ kind: 'image', src: img('Proyectos/Escudo/escudo.jpg') }],
  },
  {
    slug: 'busan-paradero-inteligente',
    title: 'BUSAN Paradero Inteligente',
    summary:
      'Proyecto que busca integrar soluciones de seguridad, tránsito y transporte público. Incluye un botón de pánico (SOS) cuyas luces alertan si es presionado, e información de la hora de los recorridos en una pantalla LED. Puede autofinanciarse con publicidad.',
    category: 'Seguridad ciudadana',
    tags: ['Transporte público', 'SOS', 'Pantallas LED'],
    coverImage: img('Proyectos/BUSAN+Paradero+Inteligente.png'),
    media: [{ kind: 'image', src: img('Proyectos/BUSAN+Paradero+Inteligente.png') }],
  },
  {
    slug: 'mantencion-avanzada-semaforos',
    title: 'Sistema de Mantención Avanzada de Semáforos',
    summary:
      'Sistema de monitoreo y gestión remota de las señales de tránsito que permite realizar mantenciones preventivas, correctivas y predictivas.',
    category: 'Gestión de tránsito',
    tags: ['Monitoreo remoto', 'Mantención predictiva'],
    coverImage: img('Proyectos/Sistema+de+Mantenci%C3%B3n+Avanzada+de+Sem%C3%A1foros.png'),
    media: [{ kind: 'image', src: img('Proyectos/Sistema+de+Mantenci%C3%B3n+Avanzada+de+Sem%C3%A1foros.png') }],
  },
];
