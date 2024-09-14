<script>
    import { onMount } from 'svelte';
    import * as pdfjs from 'pdfjs-dist';
    import { Plus, Minus, RotateCcw } from 'lucide-svelte';
    // import Loader from '$lib/assets/images/loader.svelte';
    import Icon from '$lib/components/icon.svelte';

    export let url = '';
    export let base64 = '';


    let canvas;
    let pdf = null;
    let pageNum = 1;
    let pageCount = 0;
    let scale = 1;

    // pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    // https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs`;

    async function loadPDF() {
      try {
        if (url) {
          // Show loader
          document.getElementById('loader').classList.remove('opacity-0');
          pdf = await pdfjs.getDocument(url).promise;
        } else if (base64) {
          const uint8Array = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          pdf = await pdfjs.getDocument({ data: uint8Array }).promise;
        } else {
          console.error('No PDF URL or base64 data provided');
          return;
        }

        if (pdf) {
          pageCount = pdf.numPages;
          renderPage(pageNum);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        document.getElementById('noPdf').classList.remove('opacity-0');
        document.getElementById('noPdf').innerHTML = 'Error loading PDF';
      }
    }

    async function renderPage(num) {
      const page = await pdf.getPage(num);
      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
      };

      // await page.render(renderContext).promise;
      // Render PDF page into canvas context and hide loader after rendering

      await page.render(renderContext).promise.then(() => {
        document.getElementById('loader').classList.add('opacity-0');
      });
    }

    function prevPage() {
      if (pageNum <= 1) return;
      pageNum--;
      renderPage(pageNum);
    }

    function nextPage() {
      if (pageNum >= pageCount) return;
      pageNum++;
      renderPage(pageNum);
    }

    function zoomIn() {
      scale += 0.1;
      scale = Math.min(2, scale);
      renderPage(pageNum);
    }

    function zoomOut() {
      scale -= 0.1;
      scale = Math.max(1, scale);
      renderPage(pageNum);
    }

    onMount(() => {
      loadPDF();
    });
    </script>

    <div class="relative h-full group">
      <div id="loader" class="h-full w-full content-center items-center absolute flex items-center justify-center opacity-0 pointer-events-none transition duration-200 ease-out">
          <Icon type="loader" class="h-10 text-gray-500 w-full" />
      </div>
      <div id="noPdf" class="h-full w-full content-center items-center absolute flex items-center justify-center opacity-0 pointer-events-none transition duration-200 ease-out">
          <p class="text-gray-500">No PDF to display</p>
      </div>
      <div class="overflow-auto h-full w-full" style="scrollbar-width: thin; scrollbar-color: rgba(209, 213, 219, 0.7) transparent;">
          <canvas bind:this={canvas} class="flex-1"></canvas>
      </div>
      <div class="controls absolute p-2 flex items-center justify-center w-full opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out bottom-0 left-0 right-0">
          <button on:click={prevPage} disabled={pageNum <= 1} class="size-7 flex items-center justify-center bg-white rounded-full border content-center text-center hover:bg-gray-100 cursor-pointer shadow-sm shadow-black/10">‹</button>
          <div class="text-sm font-semibold mx-4 text-gray-700 bg-white rounded-md p-0.5 px-1.5" style="font-feature-settings: 'tnum';">{pageNum} / {pageCount}</div>
          <button on:click={nextPage} disabled={pageNum >= pageCount} class="size-7 flex items-center justify-center bg-white rounded-full border content-center text-center hover:bg-gray-100 cursor-pointer shadow-sm shadow-black/10">›</button>

          {#if pdf}
          <div class="flex items-center justify-center gap-1.5 ml-4 p-1 border-gray-300/70 bg-white border rounded-full shadow-sm shadow-black/10">
              <button class="flex items-center justify-center size-5 hover:bg-gray-100 focus:outline-none focus:ring-0 focus:ring-gray-300 rounded-full" on:click={zoomIn}>
                  <Plus class="size-4 text-gray-600" />
              </button>
              <button class="flex items-center justify-center size-5 hover:bg-gray-100 focus:outline-none focus:ring-0 focus:ring-gray-300 rounded-full" on:click={zoomOut}>
                  <Minus class="size-4 text-gray-600" />
              </button>
              <button class={`flex items-center justify-center size-5 hover:bg-gray-100 focus:outline-none focus:ring-0 focus:ring-gray-300 focus-visible:ring-0 rounded-full ${scale == 1 ? 'opacity-35 pointer-events-none cursor-default focus-visible:ring-0' : ''}`} on:click={() => { scale = 1; renderPage(pageNum); }}>
                  <RotateCcw class="size-3.5 p-px text-gray-600" />
              </button>
          </div>
          {/if}
      </div>
    </div>

    <style>
    /* .pdf-viewer {
      display: flex;
      flex-direction: column;
      align-items: center;
    } */

    /* .controls {
      margin-top: 10px;
    }

    button {
      margin: 0 5px;
    } */
    </style>