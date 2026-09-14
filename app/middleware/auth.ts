export default defineNuxtRouteMiddleware((to) => {
  const { public: { allowedEmail } } = useRuntimeConfig()
  const user = useSupabaseUser()

  // Public routes — always allow
  const publicRoutes = ['/', '/login', '/confirm']
  if (publicRoutes.includes(to.path)) return

  // Redirect unauthenticated users to login
  if (!user.value) return navigateTo('/login')

  // Email allowlist — only the owner can access the dashboard
  if (allowedEmail && user.value.email !== allowedEmail) return navigateTo('/login')
})
