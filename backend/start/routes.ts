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
const ReviewsController = () => import('#controllers/reviews_controller')
const CollectionsController = () => import('#controllers/collections_controller')
const UserCollectionsController = () => import('#controllers/user_collections_controller')
const LimitsController = () => import('#controllers/limits_controller')


import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})


// node ace db:seed --files "database/seeders/AdminUser.ts"

//router.resource('/users', UsersController).apiOnly().use(['destroy', 'update', 'index'], middleware.auth())
//router.resource('/users', UsersController).apiOnly().use(['destroy', 'update'], middleware.auth())


//query gives me { oh: '2', adonis: [ 'sets', '3' ] }


router.resource('/users', UsersController).use(['index', 'show', 'update', 'destroy'], middleware.auth())
router.resource('/sets', FlashcardsController).use(['index', 'show', 'store', 'update', 'destroy'], middleware.auth())
router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
router.get('/auth/me', [AuthController, 'authorised'])

router.put('/users/:id/admin', [UsersController, 'updateAdmin']).use(middleware.auth())

router.post('/sets/:id/review', [ReviewsController, 'store']).use(middleware.auth())
router.get('/sets/:id/review', [ReviewsController, 'show']).use(middleware.auth())
router.delete('/sets/:id/review/:reviewId', [ReviewsController, 'destroy']).use(middleware.auth())

router.post('/limits/sets', [LimitsController, 'updateDailyLimit']).use(middleware.auth())
router.get('/limits/sets', [LimitsController, 'getDailyLimitInfo']).use(middleware.auth())



router.resource('/collections', CollectionsController)
  .only(['index', 'store'])
  .middleware('*', middleware.auth())

// router.delete('/users/:id', UsersController)


router.get('/users/:id/sets', [FlashcardsController, 'byUser'])
  .use(middleware.auth())


router.get('/sets/:id/cards', [FlashcardsController, 'inSet'])


//router.resource('/users/:id/collections', UserCollectionsController).use('*', middleware.auth())
