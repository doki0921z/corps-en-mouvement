import * as THREE from './vendor/three.module.min.js';

const DEG = Math.PI / 180;
const clamp = THREE.MathUtils.clamp;

const scenes = [
  {
    id: 'atrium', name: 'Gallery I', mapX: 32, mapY: 74,
    eye: [0, 1.65, 7.7], yaw: 0, pitch: 2,
    hotspots: [
      { x: -2.37, y: 1.59, z: -1.96, exhibit: 1 },
      { x: 2.37, y: 1.59, z: -1.96, exhibit: 2 },
      { x: 0, y: 0.65, z: -1.45, target: 'cabinet' },
    ],
  },
  {
    id: 'cabinet', name: 'Gallery II', mapX: 65, mapY: 30,
    eye: [0, 1.65, -6.2], yaw: 0, pitch: 2,
    hotspots: [
      { x: 1.08, y: 1.62, z: -14.53, exhibit: 3 },
      { x: 0, y: 0.65, z: -3.25, target: 'atrium' },
    ],
  },
];

function surface(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.84, ...extra });
}

function parquet() {
  const bitmap = document.createElement('canvas');
  bitmap.width = bitmap.height = 512;
  const ctx = bitmap.getContext('2d');
  const palette = ['#967052', '#a47d5a', '#a98260', '#9a7555', '#b08a65', '#ad8561'];
  let state = 3919;
  const random = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;

  for (let ix = 0; ix < 4; ix++) {
    for (let iy = 0; iy < 4; iy++) {
      ctx.save();
      ctx.translate(ix * 128 + 64, iy * 128 + 64);
      if ((ix + iy) % 2) ctx.rotate(Math.PI / 2);
      for (let row = 0; row < 4; row++) {
        const y = -64 + 32 * row;
        ctx.fillStyle = palette[Math.floor(random() * palette.length)];
        ctx.fillRect(-64, y, 128, 32);
        ctx.fillStyle = '#5b422c';
        ctx.fillRect(-64, y, 128, 1);
        for (let grain = 0; grain < 16; grain++) {
          ctx.fillStyle = grain % 2 ? '#34251717' : '#f5e1b61c';
          ctx.fillRect(-64 + random() * 42, y + 2 + random() * 28, 24 + random() * 62, 0.45);
        }
      }
      ctx.restore();
    }
  }
  const texture = new THREE.CanvasTexture(bitmap);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 13);
  texture.anisotropy = 8;
  return texture;
}

function createRooms(world, onPaint) {
  const ivory = surface(0xe0cdb3);
  const chalk = surface(0xede0ca);
  const stone = surface(0xbda88c);
  const ceiling = surface(0xcdbc9f);
  const molding = surface(0xd5c2a5);
  const panel = surface(0xc5af92);
  const dark = surface(0x48301f);
  const gold = surface(0xa17543, { metalness: 0.42, roughness: 0.38 });
  const mount = surface(0x28241f);
  const metal = surface(0x5d4a37, { metalness: 0.24 });
  const glow = new THREE.MeshBasicMaterial({ color: 0xfff4d9 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 25.4), surface(0xffffff, {
    map: parquet(), roughness: 0.65,
  }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -3);
  world.add(floor);

  function box(width, height, depth, x, y, z, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    world.add(mesh);
    return mesh;
  }

  box(13.5, .22, 25.4, 0, 5.15, -3, ceiling);
  box(.25, 5.3, 25.4, -6.55, 2.55, -3, ivory);
  box(.25, 5.3, 25.4, 6.55, 2.55, -3, ivory);
  box(13.4, 5.3, .3, 0, 2.55, -15.1, ivory);
  box(13.4, 5.3, .3, 0, 2.55, 9.55, ivory);

  for (const side of [-1, 1]) {
    const x = side * 6.35;
    box(.22, .24, 24.6, x, .13, -2.78, stone);
    box(.27, .09, 24.6, x, .96, -2.78, chalk);
    box(.39, .2, 24.6, x, 4.82, -2.78, molding);
    box(.28, .07, 24.6, x, 4.65, -2.78, chalk);
    for (const z of [-12.4, -9.2, -6.0, -.4, 2.8, 6]) {
      box(.06, .64, 2.35, side * 6.39, .57, z, panel);
      box(.24, 4.55, .37, side * 6.24, 2.3, z - 1.34, molding);
      box(.33, .24, .59, side * 6.2, .22, z - 1.34, chalk);
      box(.36, .17, .62, side * 6.2, 4.58, z - 1.34, chalk);
      box(.07, .09, 1.85, side * 6.28, 2.87, z, stone);
    }
  }

  for (const z of [-14.91, 9.36]) {
    box(13.2, .24, .16, 0, .13, z, stone);
    box(13.2, .09, .16, 0, .96, z, chalk);
    box(13.2, .18, .36, 0, 4.82, z, molding);
    box(13.2, .07, .26, 0, 4.65, z, chalk);
  }

  for (const z of [-12.3, -9.1, -5.9, -1.98, 1.55, 4.8, 8]) {
    box(13.0, .18, .23, 0, 4.95, z, chalk);
    box(13.0, .08, .31, 0, 4.84, z, molding);
  }
  for (const x of [-4.5, -1.48, 1.48, 4.5]) {
    box(.12, .11, 24.3, x, 4.99, -2.74, molding);
  }

  const aperture = 1.27;
  const spring = 2.53;
  const partition = new THREE.Shape();
  partition.moveTo(-6.5, 0);
  partition.lineTo(-aperture, 0);
  partition.lineTo(-aperture, spring);
  partition.absarc(0, spring, aperture, Math.PI, 0, true);
  partition.lineTo(aperture, 0);
  partition.lineTo(6.5, 0);
  partition.lineTo(6.5, 5.13);
  partition.lineTo(-6.5, 5.13);
  partition.closePath();
  const dividingWall = new THREE.Mesh(new THREE.ExtrudeGeometry(partition, {
    depth: .44, bevelEnabled: false, curveSegments: 36,
  }), ivory);
  dividingWall.position.z = -2.62;
  world.add(dividingWall);

  const surround = new THREE.Shape();
  surround.moveTo(-1.55, spring);
  surround.absarc(0, spring, 1.55, Math.PI, 0, true);
  surround.lineTo(aperture, spring);
  surround.absarc(0, spring, aperture, 0, Math.PI, false);
  surround.closePath();
  const trim = new THREE.ExtrudeGeometry(surround, {
    depth: .11, bevelEnabled: true, bevelThickness: .025, bevelSize: .022, bevelSegments: 2, curveSegments: 36,
  });
  for (const z of [-2.17, -2.74]) {
    const ring = new THREE.Mesh(trim, chalk);
    ring.position.z = z;
    world.add(ring);
    for (const side of [-1, 1]) {
      box(.28, 2.54, .16, side * 1.41, 1.27, z + .044, chalk);
      box(.39, .14, .23, side * 1.41, 2.53, z + .044, molding);
      box(.41, .24, .23, side * 1.41, .13, z + .044, molding);
      box(4.82, .18, .16, side * 4.03, .12, z + .044, stone);
      box(4.82, .105, .12, side * 4.03, .95, z + .044, chalk);
      box(4.82, .13, .19, side * 4.03, 4.77, z + .044, chalk);
      box(.17, 3.68, .17, side * 5.58, 2.94, z + .044, molding);
    }
    box(.19, .28, .22, 0, 3.96, z + .044, molding);
  }

  const loader = new THREE.TextureLoader();
  const frames = [
    { exhibit: 1, x: -3.27, z: -2.13, width: 1.75, height: 2.19 },
    { exhibit: 2, x: 3.27, z: -2.13, width: 1.75, height: 2.19 },
    { exhibit: 3, x: 0, z: -14.89, width: 2.07, height: 2.52 },
  ];

  for (const { exhibit, x, z, width, height } of frames) {
    const y = 2.47;
    box(width + .13, height + .13, .05, x, y - .035, z - .025, dark);
    box(width + .08, height + .08, .12, x, y, z + .008, gold);
    box(width, height, .09, x, y, z + .065, dark);
    box(width - .085, height - .085, .047, x, y, z + .098, mount);
    box(.31, .16, .04, x, y - height / 2 - .166, z, chalk);
    for (const offset of [-.02, .024]) {
      box(.19, .009, .006, x, y - height / 2 - .16 + offset, z + .026, stone);
    }

    loader.load(`./assets/exhibit-${exhibit}.jpg`, (image) => {
      image.colorSpace = THREE.SRGBColorSpace;
      image.anisotropy = 8;
      const ratio = image.image.width / image.image.height;
      const displayWidth = Math.min(width - .17, (height - .17) * ratio);
      const displayHeight = displayWidth / ratio;
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(displayWidth, displayHeight),
        new THREE.MeshBasicMaterial({ map: image, toneMapped: false }));
      photo.position.set(x, y, z + .13);
      world.add(photo);
      onPaint();
    });

    const lamp = new THREE.SpotLight(0xffe7c8, 41, 12, 0.42, .74, 2);
    lamp.position.set(x, 4.64, z + 1.48);
    lamp.target.position.set(x, y, z);
    world.add(lamp, lamp.target);
    box(.56, .075, .11, x, 4.71, z + 1.49, metal);
    const bulb = new THREE.Mesh(new THREE.CylinderGeometry(.052, .052, .095, 16), metal);
    bulb.rotation.x = .51;
    bulb.position.set(x, 4.63, z + 1.49);
    world.add(bulb);
  }

  for (const [x, z] of [[-4.77, -12.45], [4.77, -12.45], [-5.04, 4.92], [5.04, 4.92]]) {
    box(1.03, .11, .99, x, .06, z, molding);
    box(.88, .97, .84, x, .576, z, chalk);
    box(.97, .11, .94, x, 1.1, z, molding);
    const ceramic = new THREE.Mesh(new THREE.LatheGeometry([
      [0, 0], [.19, 0], [.21, .065], [.22, .18], [.31, .32], [.28, .5],
      [.18, .63], [.115, .67], [.13, .73], [.15, .75], [.13, .78], [0, .78],
    ].map(([r, h]) => new THREE.Vector2(r, h)), 40), surface(x > 0 ? 0x865b42 : 0x6c7770, { roughness: .48 }));
    ceramic.position.set(x, 1.16, z);
    world.add(ceramic);
    for (const h of [.22, .39, .62]) {
      const radius = h === .39 ? .299 : h === .62 ? .188 : .246;
      const band = new THREE.Mesh(new THREE.TorusGeometry(radius, .009, 6, 40), gold);
      band.rotation.x = Math.PI / 2;
      band.position.set(x, 1.16 + h, z);
      world.add(band);
    }
  }

  for (const z of [3.5, -7.75, -11.2]) {
    box(1.96, .06, .22, 0, 4.78, z, metal);
    box(1.81, .025, .105, 0, 4.741, z, glow);
    const light = new THREE.PointLight(0xffebd0, 23, 16, 2);
    light.position.set(0, 4.53, z);
    world.add(light);
  }

  world.add(new THREE.HemisphereLight(0xf8e0bf, 0x9e7961, 2.55));
  const fill = new THREE.DirectionalLight(0xffecda, 1.48);
  fill.position.set(-2.8, 5.3, 7);
  world.add(fill);
}

export function createGallery({ canvas, onChange = () => {} }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  const world = new THREE.Scene();
  world.background = new THREE.Color(0x877260);
  const camera = new THREE.PerspectiveCamera(52, 1, .05, 60);
  const direction = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const local = new THREE.Vector3();
  let current = scenes[0];
  let yaw = current.yaw;
  let pitch = current.pitch;
  let fov = 52;
  let frame = 0;
  let width = 1;
  let height = 1;

  function draw() {
    frame = 0;
    const nextWidth = Math.max(1, canvas.clientWidth);
    const nextHeight = Math.max(1, canvas.clientHeight);
    if (nextWidth !== width || nextHeight !== height) {
      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height, false);
    }

    const azimuth = yaw * DEG;
    const elevation = pitch * DEG;
    direction.set(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation),
      -Math.cos(azimuth) * Math.cos(elevation));
    camera.position.fromArray(current.eye);
    camera.lookAt(local.copy(camera.position).add(direction));
    camera.aspect = width / height;
    const portraitFov = 2 * Math.atan(Math.tan(fov * .43 * DEG) / camera.aspect) / DEG;
    camera.fov = Math.min(96, Math.max(fov, portraitFov));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    renderer.render(world, camera);
    onChange();
  }

  function paint() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function reset() {
    yaw = current.yaw;
    pitch = current.pitch;
    fov = 52;
    paint();
  }

  function setScene(id) {
    const next = scenes.find(scene => scene.id === id);
    if (!next) return;
    current = next;
    reset();
  }

  function move(yawDegrees, pitchDegrees) {
    yaw = ((yaw + yawDegrees + 180) % 360 + 360) % 360 - 180;
    pitch = clamp(pitch + pitchDegrees, -84, 84);
    paint();
  }

  function zoom(deltaDegrees) {
    fov = clamp(fov + deltaDegrees, 23, 77);
    paint();
  }

  function project(point) {
    projected.set(point.x, point.y, point.z);
    const inFront = local.copy(projected).sub(camera.position).dot(direction) > 0;
    projected.project(camera);
    return {
      x: (projected.x + 1) * width / 2,
      y: (1 - projected.y) * height / 2,
      visible: inFront && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1,
    };
  }

  const pointers = new Map();
  let pinch = 0;
  canvas.style.touchAction = 'none';

  function touchDistance() {
    const [first, second] = pointers.values();
    return Math.hypot(first.x - second.x, first.y - second.y);
  }

  canvas.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) pinch = touchDistance();
    canvas.classList.add('is-dragging');
  });

  canvas.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const next = { x: event.clientX, y: event.clientY };
    pointers.set(event.pointerId, next);
    if (pointers.size === 1) {
      const sensitivity = camera.fov / height;
      move((previous.x - next.x) * sensitivity, (next.y - previous.y) * sensitivity);
    } else if (pointers.size === 2) {
      const distance = touchDistance();
      if (pinch > 1 && distance > 1) zoom(50 * Math.log(pinch / distance));
      pinch = distance;
    }
  });

  function release(event) {
    pointers.delete(event.pointerId);
    pinch = pointers.size === 2 ? touchDistance() : 0;
    if (!pointers.size) canvas.classList.remove('is-dragging');
  }

  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    const units = event.deltaMode === 1 ? 15 : event.deltaMode === 2 ? height : 1;
    zoom(clamp(event.deltaY * units * .032, -6, 6));
  }, { passive: false });

  createRooms(world, paint);
  new ResizeObserver(paint).observe(canvas);
  paint();
  return { scenes, setScene, move, zoom, reset, project, getYaw: () => yaw };
}

window.createGallery = createGallery;
