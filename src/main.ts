import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

window.GOC = window.GOC || {};
Object.assign(window.GOC, {
  modelUrl: "//globaloneclick.com/cdn/shop/files/official-michelle.gltf?v=14663304747227346975",
  modelTexture1: "//globaloneclick.com/cdn/shop/files/official-image_1.png?v=14553416888877139211",
  modelTexture2: "//globaloneclick.com/cdn/shop/files/official-image_2-1.png?v=2923039752349975030",
  modelTexture3: "//globaloneclick.com/cdn/shop/files/official-image_3-1.png?v=5535707054403497386",
  modelTexture4: "//globaloneclick.com/cdn/shop/files/official-image_4-1.png?v=9983274496466187504",
  backgroundTexture: "//globaloneclick.com/cdn/shop/files/official-bg-10.jpg?v=2251506260468347005",
  sound: ["//globaloneclick.com/cdn/shop/files/official-music.mp3?v=12126609940191178847"],
  cardTexturePaths: [
    "//globaloneclick.com/cdn/shop/files/official-card-1.png?v=333112351454806824",
    "//globaloneclick.com/cdn/shop/files/official-card-2.png?v=1372340193505934166",
    "//globaloneclick.com/cdn/shop/files/official-card-3.png?v=13235302440002245745",
    "//globaloneclick.com/cdn/shop/files/official-card-4.png?v=15231418572175159357",
    "//globaloneclick.com/cdn/shop/files/official-card-5.png?v=450998510676234213",
    "//globaloneclick.com/cdn/shop/files/official-card-6.png?v=6221245745421861079",
  ],
  cardBackgroundColors: [
    "#ffae12", "#0d5aff", "#f72a09", "#0c55f9", "#0b711a", "#eaeaec"
  ]})

createApp(App).mount('#app')
