import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ArcadeView from "../views/ArcadeView.vue";
import PongView from "../views/PongView.vue";
import TetrisView from "../views/TetrisView.vue";
import MinesweeperView from "../views/MinesweeperView.vue";
import StickManHookView from "../views/StickManHookView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import MinecraftView from "../views/MinecraftView.vue";
import Game2048View from "@/views/Game2048View.vue";
import HangmanView from "@/views/HangmanView.vue";
import NoughtsAndCrossesView from "@/views/NoughtsAndCrossesView.vue";
import FlappyBirdView from "@/views/FlappyBirdView.vue";
import SnakeView from "@/views/SnakeView.vue";
import BreakoutView from "@/views/BreakoutView.vue";
import DuckHuntView from "@/views/DuckHuntView.vue";

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
      path: "/play",
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
      path: "/play/tetris",
      name: "tetris",
      component: TetrisView,
      meta: { title: "Tetris" },
    },
    {
      path: "/play/pong",
      name: "pong",
      component: PongView,
      meta: { title: "Pong" },
    },
    {
      path: "/play/minesweeper",
      name: "minesweeper",
      component: MinesweeperView,
      meta: { title: "Minesweeper" },
    },
    {
      path: "/play/stickman-hook",
      name: "stickman-hook",
      component: StickManHookView,
      meta: { title: "Stickman Hook" },
    },
    {
      path: "/play/2048",
      name: "2048",
      component: Game2048View,
      meta: { title: "2048" },
    },
    {
      path: "/play/noughts-and-crosses",
      name: "noughts-and-crosses",
      component: NoughtsAndCrossesView,
      meta: { title: "Noughts and Crosses" },
    },
    {
      path: "/play/hangman",
      name: "hangman",
      component: HangmanView,
      meta: { title: "Hangman" },
    },
    {
      path: "/play/flappy-bird",
      name: "flappy-bird",
      component: FlappyBirdView,
      meta: { title: "Flappy Bird" },
    },
    {
      path: "/play/snake",
      name: "snake",
      component: SnakeView,
      meta: { title: "Snake" },
    },
    {
      path: "/play/breakout",
      name: "breakout",
      component: BreakoutView,
      meta: { title: "Breakout" },
    },
    {
      path: "/play/duck-hunt",
      name: "duck-hunt",
      component: DuckHuntView,
      meta: { title: "Duck Hunt" },
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
