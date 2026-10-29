import { defineBackend } from '@aws-amplify/backend';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
});

// Sólo un administrador puede crear usuarios (sin auto-registro público).
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};

// CDN pública para imágenes y videos subidos desde el panel de administración.
const bucket = backend.storage.resources.bucket;
const mediaCdn = new cloudfront.Distribution(backend.storage.stack, 'MediaCdn', {
  comment: 'Bramal portafolio - media',
  defaultBehavior: {
    origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
  },
});

backend.addOutput({
  custom: {
    mediaBaseUrl: `https://${mediaCdn.distributionDomainName}`,
  },
});
