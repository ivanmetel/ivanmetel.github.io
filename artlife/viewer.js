import { getDocument, GlobalWorkerOptions } from "./vendor/pdfjs/pdf.min.mjs";

GlobalWorkerOptions.workerSrc = new URL("./vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).href;

const canvas = document.querySelector("#pdfCanvas");
const context = canvas.getContext("2d", { alpha: false });
const stage = document.querySelector("#viewerStage");
const status = document.querySelector("#status");
const progress = document.querySelector("#loadProgress");
const pageInput = document.querySelector("#pageNumber");
const zoomLevel = document.querySelector("#zoomLevel");
const previousButton = document.querySelector("#previousPage");
const nextButton = document.querySelector("#nextPage");
const zoomOutButton = document.querySelector("#zoomOut");
const zoomInButton = document.querySelector("#zoomIn");

const minScale = 0.1;
const maxScale = 3;
const scaleStep = 0.2;
const defaultScale = 0.8;
let pdfDocument;
let pageNumber = 1;
let scale = defaultScale;
let activeRender;
let renderVersion = 0;
let resizeFrame;

function setStatus(message, state = "") {
  status.textContent = message;
  status.dataset.state = state;
  status.hidden = !message;
}

function updateControls() {
  const ready = Boolean(pdfDocument);
  pageInput.disabled = !ready;
  previousButton.disabled = !ready || pageNumber <= 1;
  nextButton.disabled = !ready || pageNumber >= pdfDocument.numPages;
  zoomOutButton.disabled = !ready || scale <= minScale;
  zoomInButton.disabled = !ready || scale >= maxScale;
  pageInput.max = ready ? String(pdfDocument.numPages) : "1";
  pageInput.value = String(pageNumber);
  zoomLevel.textContent = `${Math.round(scale * 100)}%`;
  canvas.setAttribute("aria-label", ready ? "Содержимое страницы PDF" : "Страница PDF");
}

async function renderPage() {
  if (!pdfDocument) return;
  const thisRender = ++renderVersion;
  let renderTask;

  try {
    if (activeRender) {
      const previousRender = activeRender;
      previousRender.cancel();
      try {
        await previousRender.promise;
      } catch (error) {
        if (error?.name !== "RenderingCancelledException") throw error;
      }
      if (activeRender === previousRender) activeRender = undefined;
    }
    if (thisRender !== renderVersion) return;

    const page = await pdfDocument.getPage(pageNumber);
    if (thisRender !== renderVersion) return;

    const viewport = page.getViewport({ scale });
    const maxCanvasPixels = 16000000;
    const pixelScaleLimit = Math.sqrt(maxCanvasPixels / (viewport.width * viewport.height));
    const outputScale = Math.max(0.5, Math.min(window.devicePixelRatio || 1, 2, pixelScaleLimit));

    canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
    canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

    renderTask = page.render({ canvasContext: context, viewport });
    activeRender = renderTask;
    await renderTask.promise;
    if (activeRender === renderTask) activeRender = undefined;
    if (thisRender === renderVersion) {
      setStatus("");
      updateControls();
    }
  } catch (error) {
    if (activeRender === renderTask) activeRender = undefined;
    if (error?.name !== "RenderingCancelledException") {
      console.error(error);
      setStatus("Не удалось отобразить страницу. Обновите страницу и попробуйте ещё раз.", "error");
    }
  }
}

function goToPage(value) {
  if (!pdfDocument) return;
  const nextPage = Math.min(pdfDocument.numPages, Math.max(1, Math.trunc(Number(value) || 1)));
  pageNumber = nextPage;
  updateControls();
  renderPage();
}

function changeScale(direction) {
  if (!pdfDocument) return;
  scale = Math.max(minScale, Math.min(maxScale, Math.round((scale + direction * scaleStep) * 100) / 100));
  updateControls();
  renderPage();
}

previousButton.addEventListener("click", () => goToPage(pageNumber - 1));
nextButton.addEventListener("click", () => goToPage(pageNumber + 1));
zoomOutButton.addEventListener("click", () => changeScale(-1));
zoomInButton.addEventListener("click", () => changeScale(1));
pageInput.addEventListener("change", () => goToPage(pageInput.value));
pageInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    goToPage(pageInput.value);
    pageInput.blur();
  }
});

window.addEventListener("keydown", event => {
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")) return;
  if (event.key === "ArrowLeft") goToPage(pageNumber - 1);
  if (event.key === "ArrowRight") goToPage(pageNumber + 1);
  if (event.key === "+" || event.key === "=") changeScale(1);
  if (event.key === "-") changeScale(-1);
});

const resizeObserver = new ResizeObserver(() => {
  if (!pdfDocument) return;
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(renderPage);
});
resizeObserver.observe(stage);

updateControls();

const loadingTask = getDocument({ url: "./in-progress.pdf?v=2", rangeChunkSize: 65536 });
loadingTask.onProgress = ({ loaded, total }) => {
  if (!pdfDocument && total > 0) {
    progress.removeAttribute("value");
    progress.value = Math.round((loaded / total) * 100);
    setStatus(`Загружено ${progress.value}%`);
  }
};

try {
  pdfDocument = await loadingTask.promise;
  progress.hidden = true;
  updateControls();
  setStatus("Документ загружен, отрисовываю страницу…");
  await renderPage();
} catch (error) {
  console.error(error);
  progress.hidden = true;
  setStatus("Не удалось загрузить PDF. Обновите страницу и попробуйте ещё раз.", "error");
}
