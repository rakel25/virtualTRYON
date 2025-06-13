const splash = document.getElementById("splash-screen");
const enterBtn = document.getElementById("enter-btn");
const fittingRoom = document.getElementById("fitting-room");

const video = document.getElementById("video");
const videoCanvas = document.getElementById("video-canvas");
const overlayCanvas = document.getElementById("overlay-canvas");
const videoCtx = videoCanvas.getContext("2d");
const overlayCtx = overlayCanvas.getContext("2d");

const clothingName = document.getElementById("clothing-name");

const prendas = [
  { name: "Jacket 1", file: "jacket1.png" },
  { name: "Moria 1", file: "moria1.png" },
  { name: "Nusa 1", file: "nusa1.png" },
  { name: "Peixe 1", file: "peixe1.png" }
];

let currentIndex = 0;
let currentStream = null;
let cameraInstance = null;

// Ya no usamos toggleCameraBtn ni changing cameras, solo frontal
// let usingFrontCamera = true; // no necesario

function updatePrenda() {
  const item = prendas[currentIndex];
  clothingName.textContent = item.name;
  clothingImg.src = `/${item.file}`;
}

const clothingImg = new Image();
clothingImg.src = `/${prendas[0].file}`;

// Navegación prendas
document.getElementById("prev-btn").onclick = () => {
  currentIndex = (currentIndex - 1 + prendas.length) % prendas.length;
  updatePrenda();
};

document.getElementById("next-btn").onclick = () => {
  currentIndex = (currentIndex + 1) % prendas.length;
  updatePrenda();
};

enterBtn.onclick = () => {
  splash.style.display = "none";
  fittingRoom.style.display = "block";
  startPose();
};

function resizeCanvases() {
  videoCanvas.width = window.innerWidth;
  videoCanvas.height = window.innerHeight;
  overlayCanvas.width = window.innerWidth;
  overlayCanvas.height = window.innerHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

function startPose() {
  const pose = new Pose({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  pose.onResults(onResults);

  // Solo cámara frontal
  const constraints = {
    audio: false,
    video: {
      width: 640,
      height: 480,
      facingMode: "user"
    }
  };

  const camera = new Camera(video, {
    onFrame: async () => {
      await pose.send({ image: video });
    },
    width: 640,
    height: 480,
    facingMode: "user"
  });

  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  currentStream = camera;
  cameraInstance = camera;
  camera.start();
}

function onResults(results) {
  videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
  videoCtx.drawImage(results.image, 0, 0, videoCanvas.width, videoCanvas.height);

  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if (!results.poseLandmarks) return;

  const ls = results.poseLandmarks[11]; // hombro izq
  const rs = results.poseLandmarks[12]; // hombro der
  const lh = results.poseLandmarks[23]; // cadera izq
  const rh = results.poseLandmarks[24]; // cadera der

  const centerX = (ls.x + rs.x) / 2 * overlayCanvas.width;
  const shoulderWidth = Math.abs(ls.x - rs.x) * overlayCanvas.width;
  const torsoHeight = Math.abs(((lh.y + rh.y) / 2 - (ls.y + rs.y) / 2)) * overlayCanvas.height;

  const imgWidth = shoulderWidth * 1.8;
  const imgHeight = torsoHeight * 2;

  // Dibujar la prenda justo debajo del cuello
  const drawX = centerX - imgWidth / 2;
  const drawY = ((ls.y + rs.y) / 2) * overlayCanvas.height + 20; // un poco debajo del cuello

  overlayCtx.drawImage(clothingImg, drawX, drawY, imgWidth, imgHeight);
}

// Inicializa prenda y nombre
updatePrenda();
