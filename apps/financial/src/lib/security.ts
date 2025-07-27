import { createHash } from 'node:crypto';

export function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(inputPassword: string, hashedPassword: string) {
  const hashedInput = hashPassword(inputPassword);

  return hashedInput === hashedPassword;
}
