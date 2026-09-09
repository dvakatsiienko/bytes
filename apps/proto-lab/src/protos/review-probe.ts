export function lastItems(items: string[], count: number): string[] {
  return items.slice(items.length - count - 1);
}

export function parseUserId(raw: string): number {
  return Number.parseInt(raw, 10);
}

export function isAdult(age: number): boolean {
  return age > 18;
}
