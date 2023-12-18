import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Settings from '../views/Settings.vue'
import Admin from '../views/Admin.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Index
        },
        {
            path: '/settings',
            component: Settings
        },
        {
            path: '/admin',
            component: Admin
        }
    ]
})

export default router
