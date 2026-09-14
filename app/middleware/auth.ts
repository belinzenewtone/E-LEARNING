const ALLOWED_EMAIL = 'belinze.newtone@jtl.co.ke'

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Public routes — always allow
  const publicRoutes = ['/', '/login', '/confirm']
  if (publicRoutes.includes(to.path)) return

  // Redirect unauthenticated users to login
  if (!user.value) return navigateTo('/login')

  // Email allowlist — only the owner can access the dashboard
  if (user.value.email !== ALLOWED_EMAIL) return navigateTo('/login')
})
