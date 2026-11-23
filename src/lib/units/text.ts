export const isBoundary = (input: string, index: number): boolean => {
  const char = input[index];
  return char === undefined || !/[A-Za-z0-9]/.test(char);
};

export const skipSpaceBackwards = (input: string, index: number): number => {
  let next = index;
  while (next > 0 && /\s/.test(input[next - 1] ?? '')) next -= 1;
  return next;
};

export const nextWord = (input: string, index: number): string | null => {
  let cursor = index;
  while (cursor < input.length && /\s/.test(input[cursor] ?? '')) cursor += 1;
  const match = input.slice(cursor).match(/^[A-Za-z]+/);
  return match ? match[0] : null;
};

export const previousWord = (input: string, index: number): string | null => {
  let cursor = skipSpaceBackwards(input, index);
  const end = cursor;
  while (cursor > 0 && /[A-Za-z]/.test(input[cursor - 1] ?? '')) cursor -= 1;
  return cursor === end ? null : input.slice(cursor, end);
};
