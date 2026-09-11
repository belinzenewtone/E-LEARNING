export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  // Public routes that don't need auth
  const publicRoutes = ['/', '/login', '/confirm']
  if (publicRoutes.includes(to.path)) return
  // Redirect unauthenticated users to login
  if (!user.value) {
    return navigateTo('/login')
  }
})
