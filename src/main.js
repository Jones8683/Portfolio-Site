import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";

const link =
  document.querySelector("link[rel*='icon']") || document.createElement("link");
link.rel = "icon";
document.head.appendChild(link);

const img = new Image();
img.onload = () => {
  const size = Math.min(img.width, img.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(img, (size - img.width) / 2, (size - img.height) / 2);
  link.href = canvas.toDataURL();
};
if (link.href) {
  img.src = link.href;
  img.crossOrigin = "Anonymous";
}

const app = createApp(App);

app.use(router);

app.mount("#app");
