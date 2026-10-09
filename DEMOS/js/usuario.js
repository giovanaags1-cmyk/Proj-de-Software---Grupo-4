const formCadastro = document.querySelector("#form-cadastro");

if (formCadastro) {
    formCadastro.addEventListener("submit", function(event) {
        event.preventDefault();

        const nome = document.querySelector("#nome").value;
        const username = document.querySelector("#username").value;
        const email = document.querySelector("#email").value;
        const senha = document.querySelector("#senha").value;
        const confirmarSenha = document.querySelector("#confirmar_senha").value;

        if (senha !== confirmarSenha) {
            alert("As senhas não são iguais.");
            return;
        }

        const usuario = {
            nome: nome,
            username: username,
            email: email
        };

        localStorage.setItem(
            "demosUsuario",
            JSON.stringify(usuario)
        );

        alert("Conta criada com sucesso!");

        window.location.href = "login.html";
    });
}



// ==============================
// LOGIN
// ==============================

const formLogin = document.querySelector("#form-login");

if (formLogin) {
    formLogin.addEventListener("submit", function(event) {
        event.preventDefault();

        const usuarioSalvo =
            localStorage.getItem("demosUsuario");

        if (!usuarioSalvo) {
            alert("Nenhuma conta cadastrada neste navegador.");
            return;
        }

        localStorage.setItem("demosLogado", "true");

        window.location.href = "editar-usuario.html";
    });
}



// ==============================
// EDITAR PERFIL
// ==============================

const formEditar = document.querySelector("#form-editar");

if (formEditar) {
    const usuarioSalvo =
        localStorage.getItem("demosUsuario");

    if (usuarioSalvo) {
        const usuario = JSON.parse(usuarioSalvo);

        document.querySelector("#nome").value =
            usuario.nome;

        document.querySelector("#username").value =
            usuario.username;

        document.querySelector("#email").value =
            usuario.email;

        const avatar =
            document.querySelector("#avatar-usuario");

        if (avatar && usuario.nome) {
            avatar.textContent =
                usuario.nome.charAt(0).toUpperCase();
        }
    }

    formEditar.addEventListener("submit", function(event) {
        event.preventDefault();

        const usuarioAtualizado = {
            nome: document.querySelector("#nome").value,
            username: document.querySelector("#username").value,
            email: document.querySelector("#email").value
        };

        localStorage.setItem(
            "demosUsuario",
            JSON.stringify(usuarioAtualizado)
        );

        alert("Alterações salvas com sucesso!");
    });
}