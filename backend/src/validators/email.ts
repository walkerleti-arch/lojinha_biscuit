export function normalizarEmail(email: unknown): string {
  return String(email ?? '').trim().toLowerCase();
}

export function validarEmail(email: unknown): string[] {
  const e = normalizarEmail(email);
  if (!e) return ['Email é obrigatório'];
  if (e.length > 150) return ['Email deve ter no máximo 150 caracteres'];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return ['Email inválido'];
  return [];
}