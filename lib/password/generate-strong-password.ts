const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()-_=+[]{}";

function randomIndex(max: number): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]! % max;
}

function randomChar(pool: string): string {
  return pool[randomIndex(pool.length)]!;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Generates a password that satisfies checkout strength rules (8+ chars, mixed case, digit, symbol). */
export function generateStrongPassword(length = 16): string {
  const size = Math.max(length, 8);
  const all = LOWER + UPPER + DIGITS + SPECIAL;
  const required = [
    randomChar(LOWER),
    randomChar(UPPER),
    randomChar(DIGITS),
    randomChar(SPECIAL),
  ];
  const rest = Array.from({ length: size - required.length }, () => randomChar(all));
  return shuffle([...required, ...rest]).join("");
}

export function downloadPasswordBackup(password: string): void {
  const body = [
    "DigiStart - генерирана парола",
    "",
    password,
    "",
    "Съхранете този файл на сигурно място и изтрийте го след като запаметите паролата.",
  ].join("\n");
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "digistart-parola.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}
