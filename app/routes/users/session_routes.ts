import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { authThrottle } from '#start/limiter'

const SessionsController = () => import('#controllers/user/sessions_controller')

router
  .group(() => {
    router.post('/sign-in', [SessionsController, 'signIn']).as('session.signIn').use(authThrottle)

    router.post('/sign-up', [SessionsController, 'signUp']).as('session.signUp').use(authThrottle)

    router
      .post('/logout', [SessionsController, 'logout'])
      .as('session.logout')
      .use(middleware.auth({ guards: ['jwt'] }))

    router.post('/refresh', [SessionsController, 'refresh']).as('session.refresh').use(authThrottle)
  })
  .prefix('/api/v1/sessions')
