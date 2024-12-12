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
    "version": "1.0.0"
  }
})

// Routes for managing authentication
router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
router.get('/auth/me', [AuthController, 'authorised']).use(middleware.auth())


// Routes for users
router.resource('/users', UsersController).use(['index', 'show', 'update', 'destroy'], middleware.auth())
router.put('/users/:id/admin', [UsersController, 'updateAdmin']).use(middleware.auth())


// Routes for sets
router.resource('/sets', FlashcardsController).use(['index', 'show', 'store', 'update', 'destroy'], middleware.auth())

router.get('/users/:id/sets', [FlashcardsController, 'byUser'])
  .use(middleware.auth())

router.get('/sets/:id/cards', [FlashcardsController, 'inSet'])

router.post('/sets/:id/reviews', [SetReviewsController, 'store']).use(middleware.auth())
router.get('/sets/:id/reviews', [SetReviewsController, 'show']).use(middleware.auth())
router.delete('/sets/:id/reviews/:reviewId', [SetReviewsController, 'destroy']).use(middleware.auth())


// Set limits
router.post('/limits/sets', [LimitsController, 'updateDailyLimit']).use(middleware.auth())
router.get('/limits/sets', [LimitsController, 'getDailyLimitInfo']).use(middleware.auth())


// Routes for collections
router.post('/collections/:id/reviews', [CollectionReviewsController, 'store']).use(middleware.auth())
router.get('/collections/:id/reviews', [CollectionReviewsController, 'show']).use(middleware.auth())
router.delete('/collections/:id/reviews/:reviewId', [CollectionReviewsController, 'destroy']).use(middleware.auth())

router.resource('/collections', CollectionsController)
  .only(['index', 'store', 'show', 'update', 'destroy'])
  .middleware('*', middleware.auth())

router.get('/collections/random', [CollectionsController, 'random']).use(middleware.auth())

router.get('/users/:id/collections', [CollectionsController, 'byUser'])
  .use(middleware.auth())
