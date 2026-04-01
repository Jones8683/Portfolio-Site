import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ArcadeView from "@/views/ArcadeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return { ...savedPosition, behavior: "smooth" };
    }
    return { top: 0, behavior: "smooth" };
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { title: "Home" },
    },
    {
      path: "/play",
      name: "arcade",
      component: ArcadeView,
      meta: { title: "Arcade" },
    },
    {
      path: "/play/2048",
      name: "2048",
      component: () => import("@/views/Game2048View.vue"),
      meta: { title: "2048" },
    },
    {
      path: "/play/connect-4",
      name: "connect-4",
      component: () => import("@/views/Connect4View.vue"),
      meta: { title: "Connect 4" },
    },
    {
      path: "/play/flappy-bird",
      name: "flappy-bird",
      component: () => import("@/views/FlappyBirdView.vue"),
      meta: { title: "Flappy Bird" },
    },
    {
      path: "/play/hangman",
      name: "hangman",
      component: () => import("@/views/HangmanView.vue"),
      meta: { title: "Hangman" },
    },
    {
      path: "/play/minesweeper",
      name: "minesweeper",
      component: () => import("@/views/MinesweeperView.vue"),
      meta: { title: "Minesweeper" },
    },
    {
      path: "/play/pong",
      name: "pong",
      component: () => import("@/views/PongView.vue"),
      meta: { title: "Pong" },
    },
    {
      path: "/play/stickman-hook",
      name: "stickman-hook",
      component: () => import("@/views/StickManHookView.vue"),
      meta: { title: "Stickman Hook" },
    },
    {
      path: "/play/tetris",
      name: "tetris",
      component: () => import("@/views/TetrisView.vue"),
      meta: { title: "Tetris" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
      meta: { title: "404" },
    },
  ],
});

router.beforeEach((to) => {
  const pageTitle = to.meta.title;
  if (pageTitle === "404") {
    document.title = "404 | Page not found";
  } else if (pageTitle) {
    document.title = `${pageTitle} | Jones Jankovic`;
  } else {
    document.title = "Jones Jankovic";
  }
});

export default router;
