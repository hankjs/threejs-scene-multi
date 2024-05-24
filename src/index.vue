<script>
export default {
  name: "PanoramaMulti",
};
</script>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import PanoramaMulti from "./multi";
import { isDef } from "./utils";
import thumb1 from "./thumb/thumb1.png";
import thumb2 from "./thumb/thumb2.png";
import thumb3 from "./thumb/thumb3.png";
import thumb4 from "./thumb/thumb4.png";
import thumb5 from "./thumb/thumb5.png";

const sceneList = ref([
  {
    name: "滨海",
    image: thumb1,
  },
  {
    name: "日落",
    image: thumb2,
  },
  {
    name: "巨石",
    image: thumb3,
  },
  {
    name: "走廊",
    image: thumb4,
  },
  {
    name: "火车",
    image: thumb5,
  },
]);
const activeSceneIndex = ref(0);
const isShowSceneList = ref(true);
let pm = undefined;

// 点击展示或隐藏场景列表
const clickToggleSelectScene = () => {
  isShowSceneList.value = !isShowSceneList.value;
};
// 隐藏场景列表
const hideSelectScene = () => {
  isShowSceneList.value = false;
};

// 点击切换场景
const clickChangeSceneItem = (item, index) => {
  if (index === activeSceneIndex.value) return;
  activeSceneIndex.value = index;
  isDef(pm) && pm.changeScene(index);
};

const excludes = ref([]);

onMounted(() => {
  excludes.value.push(document.querySelector(".select-scene"));
  pm = new PanoramaMulti();
  pm.render()
});

onBeforeUnmount(() => {
  pm && pm.beforeDestroy();
});
</script>


<template>
  <div class="relative">
    <div id="webgl-output"></div>
    <div :class="['select-scene']" @click="clickToggleSelectScene">
      <div class="flex justify-center items-center">
      </div>
      <div>选择场景</div>
    </div>
    <div :class="['scene-list_box', isShowSceneList ? 'show' : '']">
      <div :class="['scene-item', activeSceneIndex === index ? '' : '']"
        v-for="(item, index) in sceneList" :key="index"
        @click="clickChangeSceneItem(item, index)">
        <img :src="item.image" alt="" />
        <div class="scene-item_desc">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.relative {
  position: relative;
}
#webgl-output {
  width: 100vw;
  height: 100vh
}

.select-scene {
  position: absolute;
  left: 20px;
  bottom: 20px;
  color: #fff;
  cursor: pointer
}

.scene-list_box {
  position: absolute;
  left: 0;
  bottom: 120px;
  width: 100%;
  height: 0;
  background: rgba(0, 0, 0, .3);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: height .3s
}

.scene-list_box.show {
  height: 100px
}

.scene-list_box .scene-item {
  width: 90px;
  height: 90px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
  margin: 0 10px;
  cursor: pointer
}

.scene-list_box .scene-item img {
  width: 100%;
  height: 100%;
  -o-object-fit: cover;
  object-fit: cover
}

.scene-list_box .scene-item .scene-item_desc {
  width: 100%;
  height: 20px;
  line-height: 20px;
  background: rgba(0, 0, 0, .3);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  position: absolute;
  left: 0;
  bottom: 0
}

.scene-list_box .scene-item.active {
  border: 2px solid #e6db3f
}
</style>