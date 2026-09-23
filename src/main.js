import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';
import App from './App.vue';
import './assets/main.css';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, savedPosition) => ({ top: 0, ...savedPosition, behavior: 'smooth' }),
});

const app = createApp(App).use(router);
await router.isReady();
app.mount('#app');
