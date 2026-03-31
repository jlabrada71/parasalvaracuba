export default defineEventHandler(async (event) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  }
})