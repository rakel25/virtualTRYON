const caraCanvas = document.getElementById("caraCanvas");
const ropaCanvas = document.getElementById("ropaCanvas");
const ctxCara = caraCanvas.getContext("2d");
const ctxRopa = ropaCanvas.getContext("2d");

const prendas = ["jacket1.png", "moria1.png", "nusa1.png", "peixe1.png"];
let current = 0;

const video = document.createElement("video");

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
    ajustarCanvas();
    requestAnimationFrame(dibujar);
  });

function ajustarCanvas() {
  caraCanvas.width = ropaCanvas.width = window.innerWidth;
  caraCanvas.height = ropaCanvas.height = window.innerHeight / 2;
}

function dibujar() {
  ctxCara.drawImage(video, 0, 0, caraCanvas.width, caraCanvas.height);
  ctxRopa.drawImage(video, 0, -ropaCanvas.height / 3, ropaCanvas.width, ropaCanvas.height * 1.5);

  const img = new Image();
  img.src = prendas[current];
  img.onload = () => {
    const width = ropaCanvas.width * 0.6;
    const x = (ropaCanvas.width - width) / 2;
    const y = ropaCanvas.height / 4;
    ctxRopa.drawImage(img, x, y, width, width);
  };

  requestAnimationFrame(dibujar);
}

document.getElementById("prev").addEventListener("click", () => {
  current = (current - 1 + prendas.length) % prendas.length;
});

document.getElementById("next").addEventListener("click", () => {
  current = (current + 1) % prendas.length;
});
