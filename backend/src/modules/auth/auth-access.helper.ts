export function hasRole(user: any, roleNames: string[]): boolean {
  const normalizedRoleNames = roleNames.map((roleName) =>
    roleName.toLowerCase(),
  );

  return (user?.roles ?? []).some((role: any) =>
    normalizedRoleNames.includes((role?.name ?? '').toLowerCase()),
  );
}

export function isDirector(user: any): boolean {
  const level = (user?.employee?.jobTitle?.level ?? '').toLowerCase();
  const title = (user?.employee?.jobTitle?.title ?? '').toLowerCase();

  if (hasRole(user, ['admin', 'director'])) {
    return true;
  }

  return (
    level === 'director' ||
    level === 'c-level' ||
    title.includes('director') ||
    title.includes('chief') ||
    title === 'ceo' ||
    title === 'cto'
  );
}

export function getEmployeeIdFromUser(user: any): string | null {
  return user?.employee?.id ?? null;
}
