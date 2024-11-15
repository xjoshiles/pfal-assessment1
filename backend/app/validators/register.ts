import vine, { SimpleMessagesProvider } from '@vinejs/vine'



const RegisterValidator = vine.compile(
    vine.object({
        username: vine.string().trim().minLength(3).maxLength(12).unique(async (db, value) => {
            const user = await db
                .from('users')
                .where('username', value)
                .first()
                return !user
            }),
        password: vine.string().trim().minLength(6),
    })
)

RegisterValidator.messagesProvider = new SimpleMessagesProvider({
    'unique': 'This {{ field }} is already taken'
})


export { RegisterValidator }