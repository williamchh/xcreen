import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    64: 'img/logo-64.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  devtools_page: 'devtools.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/index.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        'img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-64.png', 'img/logo-128.png',
        'tesseract/*', 'src/offscreen.html', 'src/offscreen.js',
      ],
      matches: ["<all_urls>"],
    },
  ],
  permissions: ['sidePanel', 'storage', 'tabs', 'activeTab', 'scripting', 'offscreen'],
  host_permissions: [
    'http://*/*',
    'https://*/*',
    '<all_urls>'
  ],

})
