const missions = [
  {
    key: "paylas",
    title: "Paylaş",
    center: 36,
    color: "#e78637",
    image: "assets/paylas.jpg",
    alt: "Bir kitabı paylaşan iki çocuk",
    tasks: [
      "Bir oyuncağımızı arkadaşımızla paylaşarak birlikte oynayalım.",
      "Sevdiğimiz bir kitabı ya da oyunu bir arkadaşımıza önerelim.",
      "Ailemiz hakkındaki duygularımızı aile bireylerimizle paylaşalım."
    ]
  },
  {
    key: "tesekkur",
    title: "Teşekkür Et",
    center: 108,
    color: "#dc6d4c",
    image: "assets/tesekkur.jpg",
    alt: "Bir çocuğun annesine teşekkür ettiği an",
    tasks: [
      "Annemize yaptığı yemek için teşekkür edelim.",
      "Markette bize yardımcı olan görevliye teşekkür edelim.",
      "Bizi dikkatle dinleyen birisine, dinlediği için teşekkür edelim."
    ]
  },
  {
    key: "yardim",
    title: "Yardım Et",
    center: 180,
    color: "#8e984f",
    image: "assets/yardim.jpg",
    alt: "Bir çocuğun parktaki kediye mama vermesi",
    tasks: [
      "Evde yapılması gereken bir iş için ailemize yardım edelim.",
      "Bir konuda zorlanan arkadaşımıza destek olalım.",
      "Parklardaki mama kaplarına hayvanlar için mama koyalım."
    ]
  },
  {
    key: "selam",
    title: "Selam Ver",
    center: 252,
    color: "#c97848",
    image: "assets/selam.jpg",
    alt: "Bir çocuğun yaşlı komşusuna selam vermesi",
    tasks: [
      "Bir komşumuza selam verelim.",
      "Alışveriş yaptığımız esnafa selam verelim.",
      "Bir yakınımızla yaptığımız telefon konuşmasına selam vererek başlayalım."
    ]
  },
  {
    key: "gulumse",
    title: "Gülümse",
    center: 324,
    color: "#eeb82c",
    image: "assets/gulumse.jpg",
    alt: "Sonbahar parkında gülümseyen bir çocuk",
    tasks: [
      "Bugün en az üç kişiye gülümseyelim.",
      "Gülümseyerek poz verdiğimiz bir fotoğraf çektirelim.",
      "Aynaya bakalım ve kendimize gülümseyelim."
    ]
  }
];

const wheelScreen = document.querySelector("#wheelScreen");
const resultScreen = document.querySelector("#resultScreen");
const wheelRotor = document.querySelector("#wheelRotor");
const winnerMask = document.querySelector("#winnerMask");
const spinButton = document.querySelector("#spinButton");
const wheelStatus = document.querySelector("#wheelStatus");
const missionImage = document.querySelector("#missionImage");
const resultTitle = document.querySelector("#resultTitle");
const missionList = document.querySelector("#missionList");
const journalText = document.querySelector("#journalText");
const charCount = document.querySelector("#charCount");
const saveButton = document.querySelector("#saveButton");
const homeButton = document.querySelector("#homeButton");
const toast = document.querySelector("#toast");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentRotation = 0;
let selectedMission = null;
let spinning = false;
let completedTasks = new Set();
let revealTimer;
let resultTimer;
let toastTimer;

function randomMission() {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return missions[values[0] % missions.length];
  }
  return missions[Math.floor(Math.random() * missions.length)];
}

function spinWheel() {
  if (spinning) return;

  spinning = true;
  spinButton.setAttribute("aria-disabled", "true");
  winnerMask.classList.remove("is-visible");
  selectedMission = randomMission();
  wheelStatus.textContent = "Çark dönüyor…";

  const target = (360 - selectedMission.center) % 360;
  const currentNormalized = ((currentRotation % 360) + 360) % 360;
  const alignment = (target - currentNormalized + 360) % 360;
  const fullTurns = (5 + Math.floor(Math.random() * 3)) * 360;

  currentRotation += fullTurns + alignment;
  wheelRotor.style.transform = `rotate(${currentRotation}deg)`;

  const settleDelay = reducedMotion.matches ? 1450 : 4850;
  clearTimeout(revealTimer);
  clearTimeout(resultTimer);
  revealTimer = window.setTimeout(showWinningSlice, settleDelay);
}

function showWinningSlice() {
  const normalized = ((currentRotation % 360) + 360) % 360;
  winnerMask.style.setProperty("--final-rotation", `${normalized}deg`);
  winnerMask.classList.add("is-visible");
  wheelStatus.textContent = `${selectedMission.title} bölümü seçildi.`;
  resultTimer = window.setTimeout(showResult, 2000);
}

function showResult() {
  renderMission(selectedMission);
  wheelScreen.classList.remove("is-active");
  wheelScreen.hidden = true;
  resultScreen.hidden = false;
  resultScreen.classList.add("is-active");
  spinning = false;
  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    resultTitle.focus({ preventScroll: true });
  });
}

function renderMission(mission) {
  completedTasks = new Set();
  missionImage.src = mission.image;
  missionImage.alt = mission.alt;
  resultTitle.textContent = mission.title;
  document.documentElement.style.setProperty("--mission-color", mission.color);
  missionList.innerHTML = "";

  mission.tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = "mission-item";
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${task} Yıldızı yak.`);
    button.innerHTML = `<span class="star" aria-hidden="true">★</span><span>${task}</span>`;
    button.addEventListener("click", () => toggleTask(index, item, button));
    item.append(button);
    missionList.append(item);
  });

  journalText.value = "";
  charCount.textContent = "0";
}

function toggleTask(index, item, button) {
  if (completedTasks.has(index)) {
    completedTasks.delete(index);
    item.classList.remove("is-complete");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${selectedMission.tasks[index]} Yıldızı yak.`);
  } else {
    completedTasks.add(index);
    item.classList.add("is-complete");
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", `${selectedMission.tasks[index]} Tamamlandı; yıldızı söndür.`);
  }
}

function resetGame() {
  clearTimeout(revealTimer);
  clearTimeout(resultTimer);
  selectedMission = null;
  completedTasks = new Set();
  spinning = false;
  currentRotation = 0;
  wheelRotor.style.transition = "none";
  wheelRotor.style.transform = "rotate(0deg)";
  winnerMask.classList.remove("is-visible");
  spinButton.removeAttribute("aria-disabled");
  wheelStatus.textContent = "";

  resultScreen.classList.remove("is-active");
  resultScreen.hidden = true;
  wheelScreen.hidden = false;
  wheelScreen.classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "auto" });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      wheelRotor.style.transition = "";
      spinButton.focus({ preventScroll: true });
    });
  });
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function paintRoundedRect(ctx, x, y, width, height, radius, fill, stroke = null) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((entry, index) => {
    const clipped = index === maxLines - 1 && lines.length > maxLines ? `${entry}…` : entry;
    ctx.fillText(clipped, x, y + index * lineHeight);
  });
}

function loadCanvasImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawImageCover(ctx, image, x, y, width, height, radius) {
  if (!image) {
    paintRoundedRect(ctx, x, y, width, height, radius, "#e8b761");
    return;
  }
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;
  if (sourceRatio > targetRatio) {
    sw = sh * targetRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = sw / targetRatio;
    sy = (image.naturalHeight - sh) / 2;
  }
  ctx.save();
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
  ctx.restore();
}

async function renderSafeSnapshot() {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 900);
  gradient.addColorStop(0, "#dff2ff");
  gradient.addColorStop(0.55, "#f2f9f5");
  gradient.addColorStop(1, "#fff0d4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1400, 900);

  const snapshotImageSource = window.SNAPSHOT_IMAGE_DATA?.[selectedMission.key] || selectedMission.image;
  const image = await loadCanvasImage(snapshotImageSource);
  paintRoundedRect(ctx, 35, 35, 825, 830, 34, "#fffdf5", "rgba(145,72,31,0.20)");
  drawImageCover(ctx, image, 35, 35, 825, 330, 34);
  paintRoundedRect(ctx, 58, 306, 185, 40, 20, "rgba(91,40,17,0.86)");
  ctx.fillStyle = "#fffdf5";
  ctx.font = "800 17px Trebuchet MS";
  ctx.fillText("ÇARKIN SEÇİMİ", 79, 332);

  ctx.fillStyle = "#c95b22";
  ctx.font = "800 18px Trebuchet MS";
  ctx.fillText("BUGÜNÜN İYİLİK GÖREVİ", 70, 408);
  ctx.fillStyle = "#4b2114";
  ctx.font = "700 53px Georgia";
  ctx.fillText(selectedMission.title, 70, 468);
  ctx.fillStyle = "#754936";
  ctx.font = "22px Trebuchet MS";
  ctx.fillText("Bir görev seç, tamamladığında yıldızını yak.", 70, 506);

  selectedMission.tasks.forEach((task, index) => {
    const y = 535 + index * 92;
    paintRoundedRect(ctx, 68, y, 758, 74, 18, completedTasks.has(index) ? "#fff7cd" : "#fffaf0", "rgba(145,72,31,0.20)");
    ctx.font = "44px Georgia";
    ctx.fillStyle = completedTasks.has(index) ? "#ffc62e" : "#fffdf5";
    ctx.strokeStyle = completedTasks.has(index) ? "#b96818" : "#8d583e";
    ctx.lineWidth = 2;
    ctx.strokeText("★", 86, y + 51);
    ctx.fillText("★", 86, y + 51);
    ctx.fillStyle = "#583929";
    ctx.font = "18px Trebuchet MS";
    drawWrappedText(ctx, task, 145, y + 29, 650, 23, 2);
  });

  paintRoundedRect(ctx, 884, 35, 481, 730, 34, "#fffdf5", "rgba(145,72,31,0.20)");
  ctx.fillStyle = "#c95b22";
  ctx.font = "800 18px Trebuchet MS";
  ctx.fillText("İYİLİK GÜNLÜĞÜM", 920, 82);
  ctx.fillStyle = "#4b2114";
  ctx.font = "700 35px Georgia";
  ctx.fillText("Bugün nasıl hissettim?", 920, 126);
  ctx.strokeStyle = "rgba(225,98,71,0.24)";
  ctx.beginPath();
  ctx.moveTo(944, 155);
  ctx.lineTo(944, 724);
  ctx.stroke();
  for (let y = 186; y <= 710; y += 34) {
    ctx.strokeStyle = "rgba(70,143,185,0.22)";
    ctx.beginPath();
    ctx.moveTo(910, y);
    ctx.lineTo(1338, y);
    ctx.stroke();
  }
  const note = journalText.value.trim() || "Bugün yaptığın iyiliği ve hissettiklerini buraya yazabilirsin.";
  ctx.fillStyle = journalText.value.trim() ? "#4f392d" : "#947566";
  ctx.font = journalText.value.trim() ? "20px Segoe Print" : "italic 20px Trebuchet MS";
  drawWrappedText(ctx, note, 970, 181, 335, 34, 14);

  paintRoundedRect(ctx, 884, 790, 230, 70, 35, "#df661f");
  paintRoundedRect(ctx, 1135, 790, 230, 70, 35, "#fffaf0", "rgba(112,73,50,0.25)");
  ctx.textAlign = "center";
  ctx.font = "800 21px Trebuchet MS";
  ctx.fillStyle = "#fffef7";
  ctx.fillText("⇩  Kaydet", 999, 834);
  ctx.fillStyle = "#4b2114";
  ctx.fillText("⌂  Anasayfa", 1250, 834);
  ctx.textAlign = "left";
  return canvas;
}

async function downloadCanvas(canvas) {
  let url = null;
  if (typeof canvas.toBlob === "function") {
    try {
      const blob = await new Promise((resolve, reject) => {
        try {
          canvas.toBlob(resolve, "image/png");
        } catch (error) {
          reject(error);
        }
      });
      if (blob) url = URL.createObjectURL(blob);
    } catch (error) {
      console.warn("PNG Blob oluşturulamadı; veri adresi yöntemi deneniyor.", error);
    }
  }
  if (!url) url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = `iyilik-carki-ekran-${selectedMission.key}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  if (url.startsWith("blob:")) window.setTimeout(() => URL.revokeObjectURL(url), 3000);
}

async function saveMemoryCard() {
  if (!selectedMission) return;
  saveButton.disabled = true;

  try {
    saveButton.blur();
    document.documentElement.classList.add("is-capturing");
    await document.fonts?.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    let canvas = null;
    if (typeof window.html2canvas === "function") {
      try {
        canvas = await window.html2canvas(resultScreen, {
          backgroundColor: "#f2f9f5",
          logging: false,
          useCORS: true,
          scale: Math.min(window.devicePixelRatio || 1, 2),
          scrollX: 0,
          scrollY: 0,
          width: resultScreen.clientWidth,
          height: resultScreen.clientHeight,
          windowWidth: document.documentElement.clientWidth,
          windowHeight: document.documentElement.clientHeight
        });
      } catch (captureError) {
        console.warn("Doğrudan ekran yakalama kullanılamadı; güvenli yöntem devreye alındı.", captureError);
      }
    }
    if (canvas) {
      try {
        await downloadCanvas(canvas);
      } catch (downloadError) {
        console.warn("Doğrudan yakalanan tuval indirilemedi; güvenli kart hazırlanıyor.", downloadError);
        canvas = null;
      }
    }
    if (!canvas) {
      canvas = await renderSafeSnapshot();
      await downloadCanvas(canvas);
    }
    showToast("Ekran görüntüsü bilgisayarına indirildi.");
  } catch (error) {
    console.error(error);
    showToast("Ekran görüntüsü hazırlanamadı. Lütfen yeniden deneyin.");
  } finally {
    document.documentElement.classList.remove("is-capturing");
    saveButton.disabled = false;
  }
}

spinButton.addEventListener("click", spinWheel);
homeButton.addEventListener("click", resetGame);
saveButton.addEventListener("click", saveMemoryCard);
journalText.addEventListener("input", () => {
  charCount.textContent = String(journalText.value.length);
});
