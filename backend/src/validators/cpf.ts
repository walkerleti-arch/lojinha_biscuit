export function limparCpf(cpf: unknown): string {
  return String(cpf ?? '').replace(/\D/g, '');
}

function calcularDigito(base: string): number {
  let soma = 0;
  for (let i = 0; i < base.length; i++) {
    soma += Number(base[i]) * (base.length + 1 - i);
  }
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function validarCpf(cpf: unknown): string[] {
  const c = limparCpf(cpf);
  if (!c) return ['CPF é obrigatório'];
  if (c.length !== 11) return ['CPF deve ter 11 dígitos'];
  if (/^(\d)\1{10}$/.test(c)) return ['CPF inválido'];
  const ok =
    calcularDigito(c.slice(0, 9)) === Number(c[9]) &&
    calcularDigito(c.slice(0, 10)) === Number(c[10]);
  return ok ? [] : ['CPF inválido'];
}