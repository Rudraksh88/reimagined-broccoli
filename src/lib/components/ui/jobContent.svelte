<script>
    import PDF from "$lib/components/ui/PDF.svelte";
    import ButtonsRow from "$lib/components/ui/pdfButtons.svelte";
    import PDFDropdown from "$lib/components/ui/dropdown.svelte";
    import CSVViewer from "$lib/components/ui/CSVViewer.svelte";
    import ViewSwitch from './ViewSwitch.svelte';

    export let job_id, email_subject;
    let currentPdfUrl = '';
    let currentCsvUrl = '';
    let prompt = '';
    let pdfs = [];
    let currentView = 'csv';
    let resultPdfUrl = '';

    $: showCsv = currentView === 'csv';
    $: showPdf = currentView === 'pdf';
    /**
     * Handle the job data fetched event
     * @param event
     * @event jobDataFetched
     *
     */

    // Handle the job data fetched event
    function handleJobDataFetched(event) {
        const jobData = event.detail;
        // Handle the fetched job data, update your component state, etc.
        console.log('Job data fetched:', jobData);

        // Set the current PDF URL
        prompt = jobData.prompt || '';
        console.log('prompt:', prompt);
        if (jobData.current_pdf) {
            currentPdfUrl = jobData.current_pdf.pdf_url || '';
            currentCsvUrl = jobData.current_pdf.csv_url || '';
            resultPdfUrl = jobData.current_pdf.result_pdf_url || '';
            pdfs = jobData.pdfs.map(pdf => ({ id: pdf.pdf_name, label: pdf.pdf_name }));
        } else {
            currentPdfUrl = '';
            currentCsvUrl = '';
            resultPdfUrl = '';
        }
    }
</script>

<div class="flex flex-col h-full w-full">
    <div id="modal-header" class="flex items-center justify-between py-4">
        <div class="flex items-center -mt-6">
            <!-- <span> - {email_id.split('<')[1].split('>')[0]}</span> -->
            <div class="text-xl font-bold text-gray-500 font-mono mr-1 select-none">#{job_id}</div>
             <!-- Email subject -->
            <div class="text-xl text-gray-800 font-semibold ml-1 font-sans">{email_subject}</div>
        </div>

        <div class="flex items-center gap-1.5">
            <PDFDropdown
                jobId={job_id}
                on:jobDataFetched={handleJobDataFetched}
            />
            <ButtonsRow
                prompt={prompt}
                jobId={job_id}
                pdfs={pdfs}
            />
        </div>
    </div>

    <div class="flex-1 overflow-hidden flex items-center justify-between gap-4">
        <div id="leftContainer" class="overflow-hidden flex h-full">
            {#if currentPdfUrl}
                <!-- Key -->
                {#key currentPdfUrl}
                    <PDF url={currentPdfUrl} />
                {/key}
            {:else}
                <div class="flex items-center justify-center flex-1 h-full w-[700px] border border-gray-300 rounded-md">
                    <p class="text-gray-500">No PDF to display</p>
                </div>
            {/if}
        </div>

        <div id="rightContainer" class="pb-4 flex-1 h-full overflow-auto ml-2 border border-gray-300 rounded-md relative" style="scrollbar-width: thin; scrollbar-color: rgba(209, 213, 219, 0.7) transparent;">
        <ViewSwitch bind:activeView={currentView} />

            {#if showCsv}
                {#if currentCsvUrl}
                <CSVViewer 
                    url={currentCsvUrl}
                    tableClass="rounded-md overflow-hidden border-collapse"
                    theadClass="rounded-md border-b border-gray-300"
                    thClass="text-left text-xs pr-12 pl-3 py-2 bg-gray-100 border-gray-300 border-x first:border-none last:border-none"
                    tbodyClass="table-hover rounded-md"
                    trClass="align-top hover:bg-gray-50 even:bg-gray-50 border-b"
                    tdClass="text-left text-sm border-gray-200/80 px-2 pl-3 py-2 w-max border-x first:border-none last:border-none"
                />
                {:else}
                <div class="flex items-center justify-center flex-1 h-full w-full rounded-md">
                    <p class="text-gray-500">No CSV data to display</p>
                </div>
                {/if}
            {:else if showPdf}
                {#if resultPdfUrl}
                <div class="flex h-full w-full items-center justify-center" style="outline: none; border: none; ">
                    <PDF url={resultPdfUrl} />
                </div>
                {:else}
                <div class="flex items-center justify-center flex-1 h-full w-full rounded-md">
                    <p class="text-gray-500">No PDF to display</p>
                </div>
                {/if}
            {/if}
        </div>
    </div>
</div>
