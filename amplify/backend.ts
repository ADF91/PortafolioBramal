import { defineBackend } from '@aws-amplify/backend';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { manageUsers } from './functions/manage-users/resource';
import { migrateMedia } from './functions/migrate-media/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  manageUsers,
  migrateMedia,
});

// Sólo un administrador puede crear usuarios (sin auto-registro público).
// La invitación llega por email con una contraseña temporal.
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
  inviteMessageTemplate: {
    emailSubject: 'Tu acceso al portafolio de Bramal',
    emailMessage:
      'Hola,<br><br>Se creó tu acceso al panel de administración del portafolio de Bramal.<br><br>' +
      'Usuario: <b>{username}</b><br>Contraseña temporal: <b>{####}</b><br><br>' +
      'Ingresa en https://portafolio.bramal.cl/admin y define tu nueva contraseña.<br><br>Equipo Bramal',
  },
};

// Gestión de usuarios: la función administra el user pool directamente.
const userPool = backend.auth.resources.userPool;
backend.manageUsers.addEnvironment('USER_POOL_ID', userPool.userPoolId);
backend.manageUsers.resources.lambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: [
      'cognito-idp:ListUsers',
      'cognito-idp:AdminListGroupsForUser',
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminAddUserToGroup',
      'cognito-idp:AdminRemoveUserFromGroup',
      'cognito-idp:AdminDisableUser',
      'cognito-idp:AdminEnableUser',
      'cognito-idp:AdminDeleteUser',
    ],
    resources: [userPool.userPoolArn],
  }),
);

// Organización de medios: la función copia archivos externos al bucket.
const bucket = backend.storage.resources.bucket;
backend.migrateMedia.addEnvironment('MEDIA_BUCKET', bucket.bucketName);
bucket.grantReadWrite(backend.migrateMedia.resources.lambda);

// CDN pública para imágenes y videos.
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
