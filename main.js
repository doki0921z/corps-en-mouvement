import { createGallery, scenes } from "./gallery.js";

const sceneLabels = { atrium: "展厅一", cabinet: "展厅二", photo: "实拍大厅", next: "泉水屋" };

const exhibits = Object.freeze([
  {
    id: 1,
    title: "蒂特舞者",
    english: "The Titeux Dancer",
    image: "./assets/exhibit-1.jpg",
    metadata: "古希腊佚名 · 公元前 375–350 年 · 陶土",
    description: "裙褶随转身向外扬起，薄纱贴着轮廓。衣料的走向让人可以想象静止姿势之前的一瞬。",
    credit: "Shonagon / Wikimedia Commons · CC0",
    source: "https://commons.wikimedia.org/wiki/File:Danseuse_Titeux_-_Mus%C3%A9e_du_Louvre_AGER_CA_462.jpg",
  },
  {
    id: 2,
    title: "舞蹈课",
    english: "The Dance Class",
    image: "./assets/exhibit-2.jpg",
    metadata: "埃德加·德加 · 1874 年 · 布面油画",
    description: "有的舞者正在练习，有的在等候或整理衣物。德加把目光转向训练室里表演前后的日常动作。",
    credit: "大都会艺术博物馆 · CC0",
    source: "https://www.metmuseum.org/art/collection/search/438817",
  },
  {
    id: 3,
    title: "端详右脚脚底的舞者（第三式）",
    english: "Dancer Looking at the Sole of Her Right Foot (Third State)",
    image: "./assets/exhibit-3.jpg",
    metadata: "埃德加·德加 · 约 1890–1910 年塑模，1920 年铸造 · 青铜",
    description: "舞者只用一条腿支撑身体。弯腰与抬腿同时发生，重心的变化让这个日常动作有了舞蹈般的张力。",
    credit: "大都会艺术博物馆 · CC0",
    source: "https://www.metmuseum.org/art/collection/search/196447",
  },
]);

new window.Vue({
  el: "#app",
  data() {
    return {
      exhibits,
      scenes,
      currentScene: "",
      viewYaw: 0,
      viewHfov: 82,
      dialogMode: "help",
      activeExhibit: null,
      canFullscreen: !!document.fullscreenEnabled,
      fullscreen: false,
      loading: true,
      renderError: false,
    };
  },
  computed: {
    mapView() {
      const scene = this.scenes.find(({ id }) => id === this.currentScene);
      if (!scene) return null;
      const heading = this.viewYaw + (scene.mapHeading ?? 90);
      return {
        left: scene.mapX + "%",
        "--cone-start": heading - this.viewHfov / 2 + "deg",
        "--cone-width": this.viewHfov + "deg",
      };
    },
  },
  mounted() {
    document.addEventListener("fullscreenchange", this.syncFullscreen);
    try {
      const firstScene = this.sceneFromUrl();
      this.gallery = createGallery({
        element: this.$refs.panorama,
        firstScene,
        markerLabel: this.markerLabel,
        activateMarker: this.activateMarker,
        onView: (yaw, hfov) => {
          this.viewYaw = yaw;
          this.viewHfov = hfov;
        },
        onReady: () => {
          if (!this.loading) return;
          this.loading = false;
          this.readSceneFromUrl();
        },
        onError: () => {
          this.loading = false;
          this.renderError = true;
        },
      });
      this.currentScene = firstScene;
      window.addEventListener("hashchange", this.readSceneFromUrl);
    } catch (error) {
      console.error("Gallery could not start.", error);
      this.renderError = true;
    }
  },
  beforeDestroy() {
    this.gallery?.destroy();
    document.removeEventListener("fullscreenchange", this.syncFullscreen);
    window.removeEventListener("hashchange", this.readSceneFromUrl);
  },
  methods: {
    sceneLabel(id) {
      return sceneLabels[id] || id;
    },
    sceneFromUrl() {
      const requestedScene = window.location.hash.replace(/^#\/?/, "").replace(/\/$/, "");
      return this.scenes.some(({ id }) => id === requestedScene) ? requestedScene : this.scenes[0].id;
    },
    readSceneFromUrl() {
      this.chooseScene(this.sceneFromUrl(), false);
    },
    chooseScene(id, writeHistory = true) {
      if (writeHistory && location.hash !== `#/${id}/`) location.hash = `/${id}/`;
      if (!this.gallery || this.loading || this.currentScene === id) return;
      this.loading = true;
      this.renderError = false;
      this.currentScene = id;
      this.gallery.setScene(id);
    },
    markerLabel(marker) {
      return marker.target
        ? `前往${this.sceneLabel(marker.target)}`
        : `查看${this.exhibits[marker.exhibit - 1].title}`;
    },
    activateMarker(marker) {
      if (marker.target) this.chooseScene(marker.target);
      else this.showExhibit(marker.exhibit);
    },
    openDialog(mode) {
      this.dialogMode = mode;
      const dialog = this.$refs.dialog;
      if (!dialog.open) this.$nextTick(() => dialog.showModal());
    },
    showExhibit(id) {
      this.activeExhibit = this.exhibits[id - 1];
      this.openDialog("exhibit");
    },
    closeDialog() {
      this.$refs.dialog.close();
    },
    moveWithKeyboard(event) {
      if (!this.gallery) return;
      const direction = {
        ArrowLeft: [-8, 0],
        ArrowRight: [8, 0],
        ArrowUp: [0, 8],
        ArrowDown: [0, -8],
      }[event.key];
      if (direction) {
        this.gallery.move(...direction);
      } else if (["+", "=", "-"].includes(event.key)) {
        this.zoom(event.key === "-" ? 8 : -8);
      } else {
        return;
      }
      event.preventDefault();
    },
    zoom(amount) {
      this.gallery.zoom(amount);
    },
    reset() {
      this.gallery.reset();
    },
    syncFullscreen() {
      this.fullscreen = document.fullscreenElement === this.$refs.tour;
    },
    async toggleFullscreen() {
      try {
        if (this.fullscreen) await document.exitFullscreen();
        else await this.$refs.tour.requestFullscreen();
      } catch (error) {
        console.error("Fullscreen is unavailable.", error);
      }
    },
  },
});
