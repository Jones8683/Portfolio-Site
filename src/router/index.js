import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import GamesView from "../views/GamesView.vue";
import PongView from "../views/PongView.vue";
import TetrisView from "../views/TetrisView.vue";
import MinesweeperView from "../views/MinesweeperView.vue";
import StickManHookView from "../views/StickManHookView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { title: "Home" },
    },
    {
      path: "/games",
      name: "games",
      component: GamesView,
      meta: { title: "Games" },
    },
    {
      path: "/games/tetris",
      name: "tetris",
      component: TetrisView,
      meta: { title: "Tetris" },
    },
    {
      path: "/games/pong",
      name: "pong",
      component: PongView,
      meta: { title: "Pong" },
    },
    {
      path: "/games/minesweeper",
      name: "minesweeper",
      component: MinesweeperView,
      meta: { title: "Minesweeper" },
    },
    {
      path: "/games/stickman-hook",
      name: "stickman-hook",
      component: StickManHookView,
      meta: { title: "Stickman Hook" },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
      meta: { title: "404" },
    },
  ],
});

router.beforeEach((to, from) => {
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
