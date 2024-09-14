<script>
	// Importing Svelte functions
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	// Constants
	import { BASE_URL } from '$lib/constants.js';

	// Icons
	import Icon from '$lib/components/icon.svelte';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';

	// Components
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	// Utils
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';

	// Stores
	// import { fetchJobData } from '$lib/stores/fetchJobData';

	export let jobId;

	const dispatch = createEventDispatcher();

	onMount(async () => {
		await fetchJobData(jobId);
	});

	async function fetchJobData(pdfId = null) {
		let url = `${BASE_URL}/api/job/${jobId}/`;
		if (pdfId) {
			url += `?pdf_id=${pdfId}`;
		}
		const response = await fetch(url);
		const data = await response.json();
		pdfs = data.pdfs;
		selectedPdf = data.current_pdf;
		dispatch('jobDataFetched', data);

		// API RESPONSE REFERENCE
		// {
		//   "job_id": 205,
		//   "email_subject": "Test Email 5",
		//   "email_id": "deeplogicaifingerprint@gmail.com",
		//   "status": "COMPLETED",
		//   "created_at": "2024-08-06T23:52:05.974784+00:00",
		//   "started_at": "2024-08-06T23:52:44.791686+00:00",
		//   "completed_at": "2024-08-06T23:53:04.815101+00:00",
		//   "file_count": 1,
		//   "pdfs": [
		//     {
		//       "pdf_id": 238,
		//       "pdf_name": "invoice_9206.pdf",
		//       "pdf_url": "http://127.0.0.1:8000/media/attachments/220/invoice_9206.pdf",
		//       "csv_url": null
		//     }
		//   ],
		//   "current_pdf": {
		//     "pdf_id": 238,
		//     "pdf_name": "invoice_9206.pdf",
		//     "pdf_url": "http://127.0.0.1:8000/media/attachments/220/invoice_9206.pdf",
		//     "csv_url": null
		//   }
		// }
	}

	function handleSelect(pdf) {
		selectedPdf = pdf;
		open = false;
		fetchJobData(pdf.pdf_id);
	}

	let open = false; // Popover state

	// Set default value of the dropdown to the current PDF name
	let selectedPdf = null;
	let pdfs = [];

	$: pdfNames = pdfs.map((pdf) => pdf.pdf_name);

	// Close the dropdown when the user clicks outside of it
	function handleClickOutside(event) {
		if (open && !event.target.closest('.dropdown')) {
			open = false;
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<Popover.Root bind:open let:ids>
	<!-- Dropdown Button -->
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class="w-[450px] hover:bg-gray-100/80 font-medium text-gray-900 justify-between h-[37px] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none -mt-6"
		>
			<span class="truncate">{selectedPdf ? selectedPdf.pdf_name : 'Select PDF'}</span>
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>

	<!-- Dropdown Content -->
	<Popover.Content
		class="w-[450px] max-h-[300px] overflow-y-auto border border-gray-200 shadow-lg bg-white rounded-md z-10 mt-2 p-0"
		aria-labelledby={ids.trigger}
		on:click={handleClickOutside}
		on:keydown={handleClickOutside}
	>
		<Command.Root>
			{#if pdfs.length}
				<Command.Input placeholder="Search pdf..." />
			{/if}
			<Command.Empty>No PDF found</Command.Empty>
			<Command.Group>
				{#each pdfs as pdf}
					<!-- Value is the displayed text  -->
					<!-- onSelect is the function that will be called when the item is selected -->
					<Command.Item
						value={pdf.pdf_name}
						onSelect={() => handleSelect(pdf)}
						class="w-full text-ellipsis"
					>
						<Check
							class={cn(
								'mr-2 h-4 w-4',
								selectedPdf && selectedPdf.pdf_id === pdf.pdf_id
									? 'text-gray-500'
									: 'text-transparent'
							)}
						/>
						<div class="max-w-[90%] text-ellipsis overflow-hidden">{pdf.pdf_name}</div>
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
