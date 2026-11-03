import { Link, useLocation } from 'react-router-dom';
import './Auth.css';

interface EstadoLogin {
  cadastroOk?: boolean;
}

// Página provisória: a tela existe para o redirecionamento do cadastro,
// mas o login em si (API de autenticação) ainda não foi implementado.
export default function Login() {
  const location = useLocation();
  const cadastroOk = (location.state as EstadoLogin | null)?.cadastroOk === true;

  return (
    <main className="auth-pagina">
      <section className="auth-cartao">
        <h1>Entrar</h1>
        <p className="subtitulo">Acesse sua conta</p>

        {cadastroOk && (
          <div className="alerta alerta-sucesso" role="status">
            Cadastro realizado com sucesso! Faça login para continuar.
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="campo">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" autoComplete="email" />
          </div>
          <div className="campo">
            <label htmlFor="login-senha">Senha</label>
            <input id="login-senha" type="password" autoComplete="current-password" />
          </div>
          <button type="submit" disabled title="O login ainda não foi implementado">
            Entrar
          </button>
        </form>

        <p className="rodape">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </section>
    </main>
  );
}