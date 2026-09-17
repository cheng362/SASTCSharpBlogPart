import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PostView from './views/PostView.vue'
import EditorView from './views/EditorView.vue'
import LoginView from './views/LoginView.vue'
import { user } from './store/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/post/:id', component: PostView },
    { path: '/login', component: LoginView },
    { path: '/new', component: EditorView, meta: { auth: true } },
    { path: '/edit/:id', component: EditorView, meta: { auth: true } },
  ],
})

router.beforeEach(to => {
  if (to.meta.auth && !user.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export default router
