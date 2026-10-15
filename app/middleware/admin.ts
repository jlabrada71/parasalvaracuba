export default defineNuxtRouteMiddleware(async () => {
  const localePath = useLocalePath()
  const user = useUserStore()
  if (!user.loaded) await user.fetchMe()
  if (!user.isAdmin) return navigateTo(localePath('/login'))
})
