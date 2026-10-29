import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  /** Imagen o video de un proyecto. `src` es una URL absoluta o una ruta del bucket (projects/...). */
  MediaItem: a.customType({
    kind: a.string().required(), // 'image' | 'video'
    src: a.string().required(),
    poster: a.string(),
    caption: a.string(),
  }),

  /** Fila de la ficha técnica, agrupada por sección (ej. "Dimensiones"). */
  Spec: a.customType({
    group: a.string(),
    label: a.string().required(),
    value: a.string().required(),
  }),

  Project: a
    .model({
      slug: a.string().required(),
      title: a.string().required(),
      tagline: a.string(),
      summary: a.string().required(),
      description: a.string(),
      category: a.string(),
      tags: a.string().array(),
      highlights: a.string().array(),
      applications: a.string().array(),
      model: a.string(),
      specs: a.ref('Spec').array(),
      datasheet: a.string(), // PDF de la ficha técnica (URL o ruta del bucket)
      presentationUrl: a.string(), // presentación detallada externa o en /presentaciones
      coverImage: a.string(),
      media: a.ref('MediaItem').array(),
      published: a.boolean().default(true),
      featured: a.boolean().default(false),
      sortOrder: a.integer().default(0),
      year: a.integer(),
      location: a.string(),
      client: a.string(),
    })
    .secondaryIndexes((index) => [index('slug')])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.group('ADMINS'),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      // Lectura pública del portafolio. Renovar antes de que expire (ver README).
      expiresInDays: 365,
    },
  },
});
