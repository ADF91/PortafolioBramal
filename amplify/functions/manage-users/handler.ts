import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import type { Schema } from '../../data/resource';

const cognito = new CognitoIdentityProviderClient();
const UserPoolId = process.env.USER_POOL_ID!;

const ROLES = ['ADMINS', 'EDITORS'] as const;
type Role = (typeof ROLES)[number];
const isRole = (r: unknown): r is Role => ROLES.includes(r as Role);

type ManageHandler = Schema['manageUser']['functionHandler'];

async function groupsOf(Username: string): Promise<string[]> {
  const res = await cognito.send(new AdminListGroupsForUserCommand({ UserPoolId, Username }));
  return (res.Groups ?? []).map((g) => g.GroupName!).filter(Boolean);
}

async function describe(u: UserType) {
  const groups = await groupsOf(u.Username!);
  return {
    username: u.Username,
    email: u.Attributes?.find((a) => a.Name === 'email')?.Value ?? '',
    status: u.UserStatus,
    enabled: u.Enabled ?? true,
    createdAt: u.UserCreateDate?.toISOString() ?? null,
    role: groups.includes('ADMINS') ? 'ADMINS' : groups.includes('EDITORS') ? 'EDITORS' : null,
  };
}

async function listAll() {
  const users: UserType[] = [];
  let PaginationToken: string | undefined;
  do {
    const res = await cognito.send(new ListUsersCommand({ UserPoolId, Limit: 60, PaginationToken }));
    users.push(...(res.Users ?? []));
    PaginationToken = res.PaginationToken;
  } while (PaginationToken);
  return Promise.all(users.map(describe));
}

async function setRole(Username: string, role: Role) {
  for (const other of ROLES) {
    if (other === role) continue;
    await cognito
      .send(new AdminRemoveUserFromGroupCommand({ UserPoolId, Username, GroupName: other }))
      .catch(() => undefined);
  }
  await cognito.send(new AdminAddUserToGroupCommand({ UserPoolId, Username, GroupName: role }));
}

type ManageArgs = Parameters<ManageHandler>[0]['arguments'];
// Amplify entrega fieldName en la raíz del evento; el formato estándar de AppSync lo trae en info.fieldName.
type Event = {
  fieldName?: string;
  info?: { fieldName?: string };
  arguments?: Partial<ManageArgs> | null;
  identity?: { username?: string } | null;
};

/**
 * Punto de entrada único para `listUsers` y `manageUser`; AppSync indica la operación en info.fieldName.
 * Los resultados se devuelven como texto JSON (tipo AWSJSON).
 */
export const handler = async (event: Event): Promise<string> => {
  const field = event.fieldName ?? event.info?.fieldName;
  if (field === 'listUsers') return JSON.stringify(await listAll());

  const { action, email, username, role } = event.arguments ?? {};
  const caller = event.identity?.username;

  if (username && username === caller && action !== 'setRole') {
    throw new Error('No puedes desactivar ni eliminar tu propio usuario.');
  }

  switch (action) {
    case 'create': {
      const address = email?.trim().toLowerCase();
      if (!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Email inválido.');
      if (!isRole(role)) throw new Error('Rol inválido.');
      const res = await cognito.send(
        new AdminCreateUserCommand({
          UserPoolId,
          Username: address,
          UserAttributes: [
            { Name: 'email', Value: address },
            { Name: 'email_verified', Value: 'true' },
          ],
          DesiredDeliveryMediums: ['EMAIL'],
        }),
      );
      await setRole(res.User!.Username!, role);
      return JSON.stringify(await describe(res.User!));
    }
    case 'setRole': {
      if (!username || !isRole(role)) throw new Error('Usuario o rol inválido.');
      if (username === caller && role !== 'ADMINS') throw new Error('No puedes quitarte el rol de administrador.');
      await setRole(username, role);
      return JSON.stringify({ ok: true });
    }
    case 'disable':
    case 'enable': {
      if (!username) throw new Error('Usuario inválido.');
      const Command = action === 'disable' ? AdminDisableUserCommand : AdminEnableUserCommand;
      await cognito.send(new Command({ UserPoolId, Username: username }));
      return JSON.stringify({ ok: true });
    }
    case 'delete': {
      if (!username) throw new Error('Usuario inválido.');
      await cognito.send(new AdminDeleteUserCommand({ UserPoolId, Username: username }));
      return JSON.stringify({ ok: true });
    }
    default:
      throw new Error(`Acción desconocida: ${action}`);
  }
};
