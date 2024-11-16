import vine, { SimpleMessagesProvider } from '@vinejs/vine'



const RegisterValidator = vine.compile(
    vine.object({
        username: vine.string().trim().minLength(3).maxLength(12).unique(
            async (db, value) => !(await db.from('users').where('username', value).first())),
        password: vine.string().trim().minLength(6),
    })
)

// RegisterValidator.messagesProvider = new SimpleMessagesProvider({
//     'username.unique': 'This {{ field }} is already taken'
// })


export { RegisterValidator }