export function validarNome(nome: unknown): string[] {
  const n = String(nome ?? '').trim();
  if (n.length < 3) return ['Nome deve ter pelo menos 3 caracteres'];
  if (n.length > 100) return ['Nome deve ter no máximo 100 caracteres'];
  return [];
}