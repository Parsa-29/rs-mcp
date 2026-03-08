export function output(data: unknown): void {
  const isPretty = process.env._RS_PRETTY === "1" || process.stdout.isTTY;
  console.log(isPretty ? JSON.stringify(data, null, 2) : JSON.stringify(data));
}

export function outputError(message: string): void {
  console.error(JSON.stringify({ error: message }));
  process.exit(1);
}
