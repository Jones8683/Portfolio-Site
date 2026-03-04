import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ArcadeView from "../views/ArcadeView.vue";

const PongView = () => import("../views/PongView.vue");
const TetrisView = () => import("../views/TetrisView.vue");
const MinesweeperView = () => import("../views/MinesweeperView.vue");
const StickManHookView = () => import("../views/StickManHookView.vue");
const NotFoundView = () => import("../views/NotFoundView.vue");
const MinecraftView = () => import("../views/MinecraftView.vue");
const Game2048View = () => import("@/views/Game2048View.vue");
const HangmanView = () => import("@/views/HangmanView.vue");
const NoughtsAndCrossesView = () => import("@/views/NoughtsAndCrossesView.vue");

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
      path: "/arcade",
      name: "arcade",
      component: ArcadeView,
      meta: { title: "Arcade" },
    },
    {
      path: "/minecraft",
      name: "minecraft",
      component: MinecraftView,
      meta: { title: "Minecraft" },
    },
    {
      path: "/arcade/tetris",
      name: "tetris",
      component: TetrisView,
      meta: { title: "Tetris" },
    },
    {
      path: "/arcade/pong",
      name: "pong",
      component: PongView,
      meta: { title: "Pong" },
    },
    {
      path: "/arcade/minesweeper",
      name: "minesweeper",
      component: MinesweeperView,
      meta: { title: "Minesweeper" },
    },
    {
      path: "/arcade/stickman-hook",
      name: "stickman-hook",
      component: StickManHookView,
      meta: { title: "Stickman Hook" },
    },
    {
      path: "/arcade/2048",
      name: "2048",
      component: Game2048View,
      meta: { title: "2048" },
    },
    {
      path: "/arcade/noughts-and-crosses",
      name: "noughts-and-crosses",
      component: NoughtsAndCrossesView,
      meta: { title: "Noughts and Crosses" },
    },
    {
      path: "/arcade/hangman",
      name: "hangman",
      component: HangmanView,
      meta: { title: "Hangman" },
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
