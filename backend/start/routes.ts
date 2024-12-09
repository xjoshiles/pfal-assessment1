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
const SetReviewsController = () => import('#controllers/set_reviews_controller')
const CollectionReviewsController = () => import('#controllers/collection_reviews_controller')
const CollectionsController = () => import('#controllers/collections_controller')
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


// Routes for users and managing authentication
router.resource('/users', UsersController).use(['index', 'show', 'update', 'destroy'], middleware.auth())
router.put('/users/:id/admin', [UsersController, 'updateAdmin']).use(middleware.auth())
router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout']).use(middleware.auth())

router.resource('/sets', FlashcardsController).use(['index', 'show', 'store', 'update', 'destroy'], middleware.auth())
router.get('/auth/me', [AuthController, 'authorised'])

router.post('/sets/:id/review', [SetReviewsController, 'store']).use(middleware.auth())
router.get('/sets/:id/review', [SetReviewsController, 'show']).use(middleware.auth())
router.delete('/sets/:id/review/:reviewId', [SetReviewsController, 'destroy']).use(middleware.auth())

router.post('/collections/:id/review', [CollectionReviewsController, 'store']).use(middleware.auth())
router.get('/collections/:id/review', [CollectionReviewsController, 'show']).use(middleware.auth())
router.delete('/collections/:id/review/:reviewId', [CollectionReviewsController, 'destroy']).use(middleware.auth())




router.post('/limits/sets', [LimitsController, 'updateDailyLimit']).use(middleware.auth())
router.get('/limits/sets', [LimitsController, 'getDailyLimitInfo']).use(middleware.auth())



router.resource('/collections', CollectionsController)
  .only(['index', 'store', 'show', 'update', 'destroy'])
  .middleware('*', middleware.auth())

// router.delete('/users/:id', UsersController)


router.get('/users/:id/sets', [FlashcardsController, 'byUser'])
  .use(middleware.auth())

router.get('/sets/:id/cards', [FlashcardsController, 'inSet'])


router.get('/users/:id/collections', [CollectionsController, 'byUser'])
  .use(middleware.auth())


//router.resource('/users/:id/collections', UserCollectionsController).use('*', middleware.auth())
