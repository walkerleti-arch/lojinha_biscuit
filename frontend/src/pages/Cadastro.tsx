import { useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../services/api';
import { cadastrarUsuario } from '../services/userService';
import {
  formatarCpf,
  somenteDigitos,
  validarCpf,
  validarEmail,
  validarNome,
  validarSenha,
} from '../utils/validators';
import './Auth.css';

type Campo = 'nome' | 'email' | 'cpf' | 'senha' | 'confirmarSenha';
type Formulario = Record<Campo, string>;
type Erros = Partial<Record<Campo, string[]>>;

const CAMPOS: Campo[] = ['nome', 'email', 'cpf', 'senha', 'confirmarSenha'];
const FORMULARIO_INICIAL: Formulario = { nome: '', email: '', cpf: '', senha: '', confirmarSenha: '' };

function validarCampo(campo: Campo, form: Formulario): string[] {
  switch (campo) {
    case 'nome':
      return validarNome(form.nome);
    case 'email':
      return validarEmail(form.email);
    case 'cpf':
      return validarCpf(form.cpf);
    case 'senha':
      return validarSenha(form.senha);
    case 'confirmarSenha':
      if (!form.confirmarSenha) return ['Confirme a senha'];
      return form.senha === form.confirmarSenha ? [] : ['As senhas não coincidem'];
  }
}

interface CampoTextoProps {
  nome: Campo;
  rotulo: string;
  tipo?: string;
  valor: string;
  erros?: string[];
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'email';
  aoAlterar: (e: ChangeEvent<HTMLInputElement>) => void;
  aoSair: (e: FocusEvent<HTMLInputElement>) => void;
}

function CampoTexto({
  nome,
  rotulo,
  tipo = 'text',
  valor,
  erros,
  placeholder,
  autoComplete,
  inputMode,
  aoAlterar,
  aoSair,
}: CampoTextoProps) {
  const temErro = Boolean(erros?.length);
  return (
    <div className="campo">
      <label htmlFor={nome}>{rotulo}</label>
      <input
        id={nome}
        name={nome}
        type={tipo}
        value={valor}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={aoAlterar}
        onBlur={aoSair}
        aria-invalid={temErro}
        aria-describedby={temErro ? `${nome}-erro` : undefined}
        className={temErro ? 'invalido' : undefined}
      />
      {temErro && (
        <ul id={`${nome}-erro`} className="erros-campo">
          {erros!.map((mensagem) => (
            <li key={mensagem}>{mensagem}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Formulario>(FORMULARIO_INICIAL);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  function aoAlterar(e: ChangeEvent<HTMLInputElement>) {
    const campo = e.target.name as Campo;
    const valor = campo === 'cpf' ? formatarCpf(e.target.value) : e.target.value;
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
    setErroGeral('');
  }

  function aoSair(e: FocusEvent<HTMLInputElement>) {
    const campo = e.target.name as Campo;
    const lista = validarCampo(campo, form);
    setErros((atual) => ({ ...atual, [campo]: lista.length ? lista : undefined }));
  }

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 1) Validação no front, antes de chamar a API
    const novosErros: Erros = {};
    for (const campo of CAMPOS) {
      const lista = validarCampo(campo, form);
      if (lista.length) novosErros[campo] = lista;
    }
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    // 2) Chamada à API
    setEnviando(true);
    setErroGeral('');
    try {
      await cadastrarUsuario({
        nome: form.nome.trim(),
        email: form.email.trim(),
        cpf: somenteDigitos(form.cpf),
        senha: form.senha,
      });
      // 3) Sucesso: vai para o login avisando que o cadastro deu certo
      navigate('/login', { state: { cadastroOk: true } });
    } catch (err) {
      if (err instanceof ApiError) {
        // 4) Erros da API: os de campo aparecem embaixo do campo, os demais no topo
        const porCampo: Erros = {};
        const gerais: string[] = [];
        for (const { campo, mensagem } of err.erros) {
          if (CAMPOS.includes(campo as Campo)) {
            const c = campo as Campo;
            porCampo[c] = [...(porCampo[c] ?? []), mensagem];
          } else {
            gerais.push(mensagem);
          }
        }
        setErros(porCampo);
        setErroGeral(gerais.join(' '));
      } else {
        setErroGeral('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  const propsComuns = { aoAlterar, aoSair };

  return (
    <main className="auth-pagina">
      <section className="auth-cartao">
        <h1>Criar conta</h1>
        <p className="subtitulo">Cadastre-se na nossa loja de biscuit</p>

        {erroGeral && (
          <div className="alerta alerta-erro" role="alert">
            {erroGeral}
          </div>
        )}

        <form onSubmit={aoEnviar} noValidate>
          <CampoTexto
            nome="nome"
            rotulo="Nome"
            valor={form.nome}
            erros={erros.nome}
            autoComplete="name"
            placeholder="Seu nome completo"
            {...propsComuns}
          />
          <CampoTexto
            nome="email"
            rotulo="Email"
            tipo="email"
            inputMode="email"
            valor={form.email}
            erros={erros.email}
            autoComplete="email"
            placeholder="voce@exemplo.com"
            {...propsComuns}
          />
          <CampoTexto
            nome="cpf"
            rotulo="CPF"
            inputMode="numeric"
            valor={form.cpf}
            erros={erros.cpf}
            placeholder="000.000.000-00"
            {...propsComuns}
          />
          <CampoTexto
            nome="senha"
            rotulo="Senha"
            tipo="password"
            valor={form.senha}
            erros={erros.senha}
            autoComplete="new-password"
            {...propsComuns}
          />
          <p className="dica">
            Use no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.
          </p>
          <CampoTexto
            nome="confirmarSenha"
            rotulo="Confirmar senha"
            tipo="password"
            valor={form.confirmarSenha}
            erros={erros.confirmarSenha}
            autoComplete="new-password"
            {...propsComuns}
          />

          <button type="submit" disabled={enviando}>
            {enviando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="rodape">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}