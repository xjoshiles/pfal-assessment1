/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const UsersController = () => import('#controllers/users_controller')
const FlashcardController = () => import('#controllers/flashcards_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

//router.resource('/users', UsersController).apiOnly().use(['destroy', 'update', 'index'], middleware.auth())
//router.resource('/users', UsersController).apiOnly().use(['destroy', 'update'], middleware.auth())




router.resource('/users', UsersController)
router.resource('/sets', FlashcardController)



// router.delete('/users/:id', UsersController)