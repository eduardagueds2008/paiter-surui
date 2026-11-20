
const formularioLogin = document.getElementById("form-login");
const campoUsuario = document.getElementById("usuario");
const campoSenha = document.getElementById("senha");

async function autenticarAdministrador(email, senha) {
    const resposta = await fetch(
        SUPABASE_URL + "/auth/v1/token?grant_type=password",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_PUBLISHABLE_KEY
            },
            body: JSON.stringify({
                email: email,
                password: senha
            })
        }
    );

    const dados = await resposta.json();

    if (!resposta.ok || !dados.access_token) {
        throw new Error("E-mail ou senha inválidos.");
    }

    const verificacao = await fetch(
        SUPABASE_URL +
        "/rest/v1/administradores?select=id&id=eq." +
        encodeURIComponent(dados.user.id),
        {
            headers: {
                "apikey": SUPABASE_PUBLISHABLE_KEY,
                "Authorization": "Bearer " + dados.access_token
            }
        }
    );

    if (!verificacao.ok) {
        throw new Error("Não foi possível verificar a autorização.");
    }

    const administradores = await verificacao.json();

    if (!Array.isArray(administradores) ||
        administradores.length !== 1) {
        throw new Error("Usuário sem permissão administrativa.");
    }

    return dados;
}

formularioLogin.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const email = campoUsuario.value.trim();
    const senha = campoSenha.value;

    const botao = formularioLogin.querySelector(
        'button[type="submit"]'
    );

    botao.disabled = true;
    botao.textContent = "Verificando acesso...";

    try {
        const dados = await autenticarAdministrador(email, senha);

        sessionStorage.setItem(
            "paiterAdminSessao",
            JSON.stringify({
                access_token: dados.access_token,
                refresh_token: dados.refresh_token,
                expires_at: Date.now() + dados.expires_in * 1000
            })
        );

        window.location.href = "admin.html";

    } catch (erro) {
        alert(erro.message);
        botao.disabled = false;
        botao.textContent = "Entrar";
    }
});
