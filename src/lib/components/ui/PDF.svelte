<script>
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    import PDFViewer from "$lib/components/ui/PDFViewer.svelte";

    export let url = "";

    console.log('PDF URL:', url);

</script>

<!-- PDF Area -->
<div class="overflow-hidden h-full w-[630px] border-2 border-gray-300/70 rounded-md">
    {#if url}
    <div class="overflow-auto h-full w-full" style="scrollbar-width: thin; scrollbar-color: rgba(209, 213, 219, 0.7) transparent;">
        <!-- If pdf url is valid then display else show no pdf msg -->
        <!-- <PDFViewer class="border rounded-md overflow-auto w-full"
            url={ url }
        /> -->
        <PDFViewer url={ url } />
    </div>
    {:else}
        <div class="flex items-center justify-center h-full w-full">
            <div class="text-gray-500 text-lg text-center">No PDF to display</div>
        </div>
    {/if}
</div>
