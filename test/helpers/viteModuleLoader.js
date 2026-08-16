import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../..', import.meta.url))
let server

/**
 * Uygulama kaynakları Vite'ın uzantısız importlarını kullanır. Bu küçük test
 * yükleyicisi, üretim derlemesinden önce aynı modülleri Vite SSR üzerinden
 * yükleyerek ek test bağımlılığı eklemeden gerçek kaynak kodunu sınar.
 */
export async function loadSourceModule(path) {
  if (!server) {
    server = await createServer({
      root,
      configFile: false,
      appType: 'custom',
      server: { middlewareMode: true, hmr: false }
    })
  }
  return server.ssrLoadModule(path)
}

export async function closeSourceLoader() {
  if (server) {
    await server.close()
    server = null
  }
}
