const panoramaRoot = new URL("./panoramas/", import.meta.url).href;
const initialHfov = 82;

export const scenes = Object.freeze([
  {
    id: "atrium",
    mapX: 32,
    mapY: 74,
    hotspots: [
      { yaw: -13.785, pitch: -0.346, exhibit: 1 },
      { yaw: 13.785, pitch: -0.346, exhibit: 2 },
      { yaw: 0, pitch: -6.237, target: "cabinet" },
    ],
  },
  {
    id: "cabinet",
    mapX: 65,
    mapY: 30,
    hotspots: [
      { yaw: 7.387, pitch: -0.205, exhibit: 3 },
      { yaw: 180, pitch: -18.726, target: "atrium" },
    ],
  },
  {
    id: "photo",
    hotspots: [],
  },
]);

export function createGallery({ element, firstScene, markerLabel, activateMarker, onReady, onError }) {
  const config = Object.fromEntries(scenes.map(({ id, hotspots, yaw = 0, pitch = 2 }) => [id, {
    type: "multires",
    hfov: initialHfov,
    yaw,
    pitch,
    multiRes: {
      basePath: panoramaRoot.slice(0, -1),
      path: "/" + id + "_%l_%s_%y_%x",
      fallbackPath: "/" + id + "_1_%s_0_0",
      extension: "jpg",
      tileResolution: 512,
      maxLevel: 2,
      cubeResolution: 1024,
    },
    hotSpots: hotspots.map(marker => ({
      pitch: marker.pitch,
      yaw: marker.yaw,
      cssClass: "gallery-marker",
      createTooltipFunc(wrapper) {
        const button = document.createElement("button");
        const label = markerLabel(marker);
        button.className = marker.target ? "hotspot travel" : "hotspot";
        button.type = "button";
        button.textContent = marker.target ? "↑" : "i";
        button.title = label;
        button.setAttribute("aria-label", label);
        button.addEventListener("mousedown", event => event.stopPropagation());
        button.addEventListener("touchstart", event => event.stopPropagation());
        button.addEventListener("click", () => activateMarker(marker));
        wrapper.appendChild(button);
      },
    })),
  }]));

  const viewer = window.pannellum.viewer(element, {
    default: {
      firstScene,
      autoLoad: false,
      showControls: false,
      disableKeyboardCtrl: true,
      escapeHTML: true,
      multiResMinHfov: true,
      minHfov: 28,
      maxHfov: 110,
    },
    scenes: config,
  });
  const sizeObserver = new ResizeObserver(() => viewer.resize());
  sizeObserver.observe(element);
  viewer.on("animatefinished", onReady);
  viewer.on("error", onError);
  viewer.loadScene(firstScene);
  return {
    setScene: id => viewer.loadScene(id),
    move: (yaw, pitch) => viewer.lookAt(viewer.getPitch() + pitch, viewer.getYaw() + yaw, undefined, false),
    zoom: delta => viewer.setHfov(viewer.getHfov() + delta),
    reset() {
      const { pitch, yaw } = config[viewer.getScene()];
      viewer.lookAt(pitch, yaw, initialHfov);
    },
    destroy() {
      sizeObserver.disconnect();
      viewer.destroy();
    },
  };
}
