const S3 = 'https://documentosbramal.s3.us-east-2.amazonaws.com/pagina-web';

export const site = {
  name: 'Bramal',
  title: 'Bramal - Soluciones Tecnológicas',
  description:
    'Portafolio de proyectos innovadores de Bramal: tecnología para ciudades más seguras, eficientes y conectadas.',
  logo: `${S3}/images/4+LOGO+BRAMAL+mejorando+ciudades+HORIZONTAL.png`,
  aboutImage: `${S3}/images/Carousel/sobre+nosotros.jpg`,
  // Correo de contacto opcional: si queda vacío, la sección de contacto muestra sólo redes sociales.
  contactEmail: 'ventas@bramal.cl',
  contactPhone: '+569 9373 6008',
  website: 'www.bramal.cl',
  social: {
    youtube: 'https://www.youtube.com/@constructorabramal5078',
    instagram: 'https://www.instagram.com/constructorabramal/',
    linkedin: 'https://www.linkedin.com/company/constructora-bramal/',
  },
  stats: [
    { value: '25+', label: 'Proyectos entregados' },
    { value: '15+', label: 'Clientes satisfechos' },
    { value: '10+', label: 'Años de experiencia' },
  ],
  // Descripción de cada área (categoría). Las categorías nuevas usan un texto genérico.
  areas: {
    movilidad: 'Infraestructura inteligente para ciclovías, transporte y desplazamientos sostenibles.',
    'seguridad vial': 'Cruces, señalización y sistemas que protegen a peatones y conductores.',
    'seguridad ciudadana': 'Equipamiento y mobiliario urbano para espacios públicos más seguros.',
    'gestion de transito': 'Control, monitoreo y mantención de la red semafórica y de tránsito.',
  } as Record<string, string>,
  process: [
    { title: 'Diagnóstico', text: 'Levantamos las necesidades del territorio junto al mandante y analizamos los datos disponibles.' },
    { title: 'Diseño', text: 'Desarrollamos la solución técnica a medida, con ingeniería y normativa vigente.' },
    { title: 'Implementación', text: 'Fabricamos, instalamos y ponemos en marcha cada sistema en la vía pública.' },
    { title: 'Soporte', text: 'Acompañamos la operación con monitoreo, mantención y mejora continua.' },
  ],
};

export const LEGACY_MEDIA_BASE = S3;
