from django import forms


class ExcluirContaForm(forms.Form):
    senha = forms.CharField(
        label="Sua senha",
        widget=forms.PasswordInput(attrs={"autocomplete": "current-password"}),
    )
    confirmo = forms.BooleanField(
        label="Entendo que a exclusão é permanente e não pode ser desfeita.",
        error_messages={"required": "Marque a caixa para confirmar."},
    )

    def __init__(self, *args, usuario=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.usuario = usuario

    def clean_senha(self):
        senha = self.cleaned_data["senha"]
        if not self.usuario.check_password(senha):
            raise forms.ValidationError("Senha incorreta.")
        return senha
