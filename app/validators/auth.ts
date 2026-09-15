import vine, { SimpleMessagesProvider } from '@vinejs/vine'

/**
 * Nomes dos campos em português, usados para montar as mensagens de erro.
 */
const fields = {
  fullName: 'nome completo',
  email: 'e-mail',
  password: 'senha',
  passwordConfirmation: 'confirmação de senha',
}

/**
 * Cadastro de um novo usuário.
 *
 * O e-mail é normalizado antes da checagem de unicidade, então o valor
 * comparado com a tabela `users` é o mesmo que será gravado.
 * A confirmação de senha é validada aqui e descartada pelo controller:
 * ela nunca chega ao model.
 */
export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(120),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(8).maxLength(180),
    passwordConfirmation: vine.string().sameAs('password'),
  })
)

registerValidator.messagesProvider = new SimpleMessagesProvider(
  {
    'required': 'Informe o campo {{ field }}.',
    'string': 'O campo {{ field }} deve ser um texto.',
    'email': 'Informe um e-mail válido.',
    'database.unique': 'Este e-mail já está cadastrado.',
    'fullName.minLength': 'O nome completo deve ter ao menos 3 caracteres.',
    'fullName.maxLength': 'O nome completo deve ter no máximo 120 caracteres.',
    'password.minLength': 'A senha deve ter ao menos 8 caracteres.',
    'password.maxLength': 'A senha deve ter no máximo 180 caracteres.',
    'passwordConfirmation.sameAs': 'A confirmação não confere com a senha.',
  },
  fields
)

/**
 * Autenticação. Aplica a mesma normalização de e-mail do cadastro para que
 * o valor digitado no login bata com o que foi gravado.
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail(),
    password: vine.string(),
  })
)

loginValidator.messagesProvider = new SimpleMessagesProvider(
  {
    'required': 'Informe o campo {{ field }}.',
    'string': 'O campo {{ field }} deve ser um texto.',
    'email': 'Informe um e-mail válido.',
  },
  fields
)
