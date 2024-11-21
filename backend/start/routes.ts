/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const UsersController = () => import('#controllers/users_controller')
const FlashcardsController = () => import('#controllers/flashcards_controller')
const AuthController = () => import('#controllers/auth_controller')
const CommentsController = () => import('#controllers/comments_controller')
const CollectionsController = () => import('#controllers/collections_controller')
const UserCollectionsController = () => import('#controllers/user_collections_controller')

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

//router.resource('/users', UsersController).apiOnly().use(['destroy', 'update', 'index'], middleware.auth())
//router.resource('/users', UsersController).apiOnly().use(['destroy', 'update'], middleware.auth())



router.resource('/users', UsersController).use(['index'], middleware.auth())
router.resource('/sets', FlashcardsController).use('*', middleware.auth())
router.post('/login', [AuthController])

router.post('/sets/:id/comment', [CommentsController, 'store'])
  .use(middleware.auth())

router.resource('/collections', CollectionsController)
  .only(['index', 'store'])
  .middleware('*', middleware.auth())

// router.delete('/users/:id', UsersController)


router.get('/users/:id/sets', [FlashcardsController, 'byUser'])
  .use(middleware.auth())


router.get('/sets/:id/cards', [FlashcardsController, 'inSet'])


//router.resource('/users/:id/collections', UserCollectionsController).use('*', middleware.auth())
