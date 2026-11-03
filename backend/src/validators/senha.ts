export function validarSenha(senha: unknown): string[] {
  const s = String(senha ?? '');
  if (!s) return ['Senha é obrigatória'];

  const erros: string[] = [];
  if (s.length < 8) erros.push('A senha deve ter pelo menos 8 caracteres');
  if (s.length > 72) erros.push('A senha deve ter no máximo 72 caracteres');
  if (!/[A-Z]/.test(s)) erros.push('A senha deve ter pelo menos uma letra maiúscula');
  if (!/[a-z]/.test(s)) erros.push('A senha deve ter pelo menos uma letra minúscula');
  if (!/\d/.test(s)) erros.push('A senha deve ter pelo menos um número');
  if (!/[^A-Za-z0-9]/.test(s)) erros.push('A senha deve ter pelo menos um símbolo (ex.: !@#$)');
  return erros;
}