import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const FoldersController = () => import('#controllers/folders/folders_controller')

router
  .group(() => {
    // Folder statistics
    router.get('/stats', [FoldersController, 'stats'])

    // CNJ validation utility
    router.post('/validate-cnj', [FoldersController, 'validateCnj'])

    // Get favorite folders
    router.get('/favorites', [FoldersController, 'getFavorites'])

    // List folders with filters and pagination
    router.get('/', [FoldersController, 'index'])

    // Create new folder
    router.post('/', [FoldersController, 'store'])

    // Toggle folder favorite status
    router.patch('/:id/favorite', [FoldersController, 'toggleFavorite'])

    // Get single folder
    router.get('/:id', [FoldersController, 'show'])

    // Update folder
    router.put('/:id', [FoldersController, 'update'])

    // Soft delete folder
    router.delete('/:id', [FoldersController, 'destroy'])

    // Restore soft deleted folder
    router.post('/:id/restore', [FoldersController, 'restore'])
  })
  .prefix('/api/v1/folders')
  .use(middleware.auth({ guards: ['jwt'] }))
