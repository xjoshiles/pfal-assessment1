import vine from '@vinejs/vine'

export const RegisterUserValidator = vine.compile(
  vine.object({
    // Despite the column constraint in the table, we check for uniqueness
    // here in the validator (at the application level) to catch potential
    // errors sooner and to return a specific error message as opposed to
    // a generic SQL constraint violation. It is also the validators role
    // to validate the fields completely. The database constraint acts as 
    // a fail-safe to ensure the integrity of the database.
    username: vine.string().trim().minLength(3).maxLength(12).unique(
      async (db, value) => {
        const user = await db
          .from('users')
          .where('username', value)
          .first()
        return !user
      }
    ),
    password: vine.string().trim().minLength(6)
  })
)