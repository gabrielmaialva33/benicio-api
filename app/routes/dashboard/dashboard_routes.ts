import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const DashboardController = () => import('#controllers/dashboard/dashboard_controller')

// Dashboard routes without /v1 prefix to match frontend expectations
router
  .group(() => {
    router.get('/dashboard/active-folders', [DashboardController, 'activeFolders'])
    router.get('/dashboard/favorite-folders', [DashboardController, 'favoriteFolders'])
    router.post('/dashboard/favorite-folders/:folderId', [DashboardController, 'addFavorite'])
    router.delete('/dashboard/favorite-folders/:folderId', [DashboardController, 'removeFavorite'])
    router.get('/area-division', [DashboardController, 'areaDivision'])
    router.get('/folder-activity', [DashboardController, 'folderActivity'])
    router.get('/tasks', [DashboardController, 'tasks'])
    router.get('/requests', [DashboardController, 'requests'])
    router.get('/hearings', [DashboardController, 'hearings'])
    router.get('/birthdays', [DashboardController, 'birthdays'])
  })
  .prefix('/api')
  .use(middleware.auth({ guards: ['jwt'] }))
