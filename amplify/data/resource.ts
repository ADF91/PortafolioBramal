import { a, defineData, type ClientSchema } from '@aws-amplify/backend';
import { manageUsers } from '../functions/manage-users/resource';
import { migrateMedia } from '../functions/migrate-media/resource';

const schema = a.schema({
  /** Imagen o video de un proyecto. `src` es una URL absoluta o una ruta del bucket (proyectos/<slug>/...). */
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
      allow.groups(['ADMINS', 'EDITORS']),
    ]),

  /** Usuarios del panel (sólo administradores). Devuelve una lista en JSON. */
  listUsers: a
    .query()
    .returns(a.json())
    .authorization((allow) => [allow.group('ADMINS')])
    .handler(a.handler.function(manageUsers)),

  /** action: create | setRole | disable | enable | delete. role: ADMINS | EDITORS. */
  manageUser: a
    .mutation()
    .arguments({
      action: a.string().required(),
      email: a.string(),
      username: a.string(),
      role: a.string(),
    })
    .returns(a.json())
    .authorization((allow) => [allow.group('ADMINS')])
    .handler(a.handler.function(manageUsers)),

  /** Copia archivos externos al bucket. items: [{ url, path }] con path bajo proyectos/<slug>/. */
  importMedia: a
    .mutation()
    .arguments({ items: a.json().required() })
    .returns(a.json())
    .authorization((allow) => [allow.groups(['ADMINS', 'EDITORS'])])
    .handler(a.handler.function(migrateMedia)),
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
