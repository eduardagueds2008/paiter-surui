
(async function protegerPainel() {
    const painel = document.getElementById("area-administrativa");

    function negarAcesso() {
        sessionStorage.removeItem("paiterAdminSessao");
        window.location.replace("login.html");
    }

    try {
        const sessao = JSON.parse(
            sessionStorage.getItem("paiterAdminSessao") || "null"
        );

        if (!sessao || !sessao.access_token) {
            negarAcesso();
            return;
        }

        const respostaUsuario = await fetch(
            SUPABASE_URL + "/auth/v1/user",
            {
                headers: {
                    "apikey": SUPABASE_PUBLISHABLE_KEY,
                    "Authorization": "Bearer " + sessao.access_token
                }
            }
        );

        if (!respostaUsuario.ok) {
            negarAcesso();
            return;
        }

        const usuario = await respostaUsuario.json();

        const respostaAdmin = await fetch(
            SUPABASE_URL +
            "/rest/v1/administradores?select=id&id=eq." +
            encodeURIComponent(usuario.id),
            {
                headers: {
                    "apikey": SUPABASE_PUBLISHABLE_KEY,
                    "Authorization": "Bearer " + sessao.access_token
                }
            }
        );

        if (!respostaAdmin.ok) {
            negarAcesso();
            return;
        }

        const administradores = await respostaAdmin.json();

        if (!Array.isArray(administradores) ||
            administradores.length !== 1) {
            negarAcesso();
            return;
        }

      if (painel) {
    painel.hidden = false;
} else {
    document.body.hidden = false;
}

    } catch (erro) {
        console.error("Falha na verificação administrativa:", erro);
        negarAcesso();
    }
})();
