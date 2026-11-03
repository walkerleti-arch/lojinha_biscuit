// Validações do lado do cliente (a API valida de novo: nunca confie só no front).
// Todas retornam um array de mensagens (vazio = válido).

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

// Máscara: 12345678909 -> 123.456.789-09
export function formatarCpf(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function validarNome(nome: string): string[] {
  const n = nome.trim();
  if (n.length < 3) return ['Nome deve ter pelo menos 3 caracteres'];
  if (n.length > 100) return ['Nome deve ter no máximo 100 caracteres'];
  return [];
}

export function validarEmail(email: string): string[] {
  const e = email.trim();
  if (!e) return ['Email é obrigatório'];
  if (e.length > 150) return ['Email deve ter no máximo 150 caracteres'];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return ['Email inválido'];
  return [];
}

// Calcula um dígito verificador a partir dos dígitos anteriores
function calcularDigito(base: string): number {
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (base.length + 1 - i);
  }
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function validarCpf(cpf: string): string[] {
  const c = somenteDigitos(cpf);
  if (!c) return ['CPF é obrigatório'];
  if (c.length !== 11) return ['CPF deve ter 11 dígitos'];
  if (/^(\d)\1{10}$/.test(c)) return ['CPF inválido'];
  const ok =
    calcularDigito(c.slice(0, 9)) === Number(c[9]) &&
    calcularDigito(c.slice(0, 10)) === Number(c[10]);
  return ok ? [] : ['CPF inválido'];
}

export function validarSenha(senha: string): string[] {
  if (!senha) return ['Senha é obrigatória'];

  const erros: string[] = [];
  if (senha.length < 8) erros.push('A senha deve ter pelo menos 8 caracteres');
  if (senha.length > 72) erros.push('A senha deve ter no máximo 72 caracteres');
  if (!/[A-Z]/.test(senha)) erros.push('A senha deve ter pelo menos uma letra maiúscula');
  if (!/[a-z]/.test(senha)) erros.push('A senha deve ter pelo menos uma letra minúscula');
  if (!/\d/.test(senha)) erros.push('A senha deve ter pelo menos um número');
  if (!/[^A-Za-z0-9]/.test(senha)) erros.push('A senha deve ter pelo menos um símbolo (ex.: !@#$)');
  return erros;
}