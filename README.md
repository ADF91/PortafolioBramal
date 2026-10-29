# Portafolio Bramal

Portafolio web dinámico de proyectos innovadores de Bramal. Next.js 15 (App Router) desplegado en **AWS Amplify Hosting** con backend **Amplify Gen 2**.

## Arquitectura

| Pieza | Servicio AWS | Archivo |
|---|---|---|
| Sitio público (SSR + ISR, se regenera cada 60 s o al guardar en el admin) | Amplify Hosting | `app/(site)/` |
| Panel de administración `/admin` | Amplify Hosting | `app/admin/`, `components/admin/` |
| Login de administradores (grupo `ADMINS`, sin auto-registro) | Cognito | `amplify/auth/resource.ts` |
| Proyectos (modelo `Project`) | AppSync + DynamoDB | `amplify/data/resource.ts` |
| Imágenes y videos subidos | S3 + CloudFront | `amplify/storage/resource.ts`, `amplify/backend.ts` |

Los 9 proyectos actuales siguen apuntando a sus archivos en el bucket `documentosbramal`; los archivos nuevos se suben al bucket de Amplify y se sirven por CloudFront.

## Despliegue (primera vez)

1. Subir este proyecto a un repositorio Git (GitHub, GitLab, Bitbucket o CodeCommit).
2. En la consola de AWS → **Amplify** → *Create new app* → conectar el repositorio y la rama `main`. Amplify detecta `amplify.yml` y despliega backend y frontend juntos.
3. Cuando termine, ir a **Amplify → la app → Authentication → User management**:
   - *Create user* con el email del administrador (Cognito envía una contraseña temporal por correo).
   - Agregar el usuario al grupo **ADMINS**.
4. Entrar a `https://<dominio>/admin`, iniciar sesión y presionar **"Importar proyectos del sitio actual"** para cargar los 9 proyectos existentes.
5. Dominio: **Amplify → Hosting → Custom domains** → agregar `portafolio.bramal.cl` (Amplify entrega los registros DNS y el certificado SSL).

Cada `git push` a la rama vuelve a desplegar automáticamente.

## Uso del administrador

- **Nuevo proyecto**: título, categoría, resumen, descripción, características, etiquetas, cliente, ubicación y año.
- **Ficha técnica**: modelo, especificaciones (formato `# Sección` / `Etiqueta: Valor`, una por línea), aplicaciones, PDF descargable y enlace a una presentación detallada.
- **Presentaciones detalladas en HTML**: se guardan en `public/presentaciones/<nombre>/` y se enlazan como `/presentaciones/<nombre>/index.html` (ej. la Cámara IA de Detección Acústica).
- **Galería**: arrastrar imágenes y videos (se suben directo a S3 con barra de progreso), o pegar una URL. Cada video puede tener póster; cualquier imagen puede marcarse como portada.
- **Listado**: ordenar con ↑ ↓, destacar con ★ (aparece en el carrusel de portada), publicar u ocultar (borrador) y eliminar (también borra sus archivos subidos).
- Los cambios se ven en el sitio inmediatamente.

## Modo presentación (`/presentacion`)

Presentación tipo PPT del portafolio para reuniones con clientes: portada, agenda, una diapositiva por proyecto (con video) y cierre con contacto. El lienzo es de 16:9 y se adapta a cualquier pantalla o proyector.

- **Teclas**: `←` `→` / `Espacio` / `RePág` `AvPág` (compatible con punteros de presentación), `F` pantalla completa, `O` vista general, `Inicio` / `Fin`.
- **Configurar**: elegir qué proyectos mostrar (todos, por categoría o uno a uno) y el nombre del cliente que aparece en la portada. **Copiar enlace** genera un link listo para esa reunión, por ejemplo `/presentacion?cliente=Municipalidad%20de%20Providencia&p=hurry-call,radar-pedagogico-velocidad`.
- Los proyectos con especificaciones o aplicaciones agregan automáticamente una diapositiva de **Ficha técnica** (se puede desactivar en Configurar, o con `?fichas=0`).
- Desde la ficha de cada proyecto, **"Presentar este proyecto"** abre la presentación en esa diapositiva (`?s=<slug>`). También `?slide=N` abre la diapositiva N.

## Desarrollo local

```bash
npm install
npx ampx sandbox        # requiere credenciales AWS (aws configure); crea un backend personal y genera amplify_outputs.json
npm run dev             # http://localhost:3000
```

Sin backend se puede usar un `amplify_outputs.json` de relleno: en modo desarrollo el sitio muestra los proyectos de `lib/seed-data.ts`. Para apuntar al backend ya desplegado: `npx ampx generate outputs --app-id <APP_ID> --branch main`.

## Mantención

- **API key pública**: la lectura pública usa una API key de 365 días (`amplify/data/resource.ts`). Para renovarla antes de que venza, cambiar `expiresInDays` (por ejemplo 365 → 364) y hacer push.
- Los proyectos ocultos no se muestran en el sitio, pero sus datos siguen siendo legibles a través de la API pública. No guardar información confidencial en ellos.
- Textos fijos (logo, redes sociales, estadísticas, correo de contacto): `lib/site.ts`.
