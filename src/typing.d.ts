// typings.d.ts or router.ts
import 'vue-router'
import { Router } from 'vue-router'

export { }

declare global {

}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    auth?: boolean
  }
}
