<script lang="ts" context="module">
	import { z } from 'zod';

	export const formSchema = z.object({
		selectedPdfs: z.array(z.string()).min(1, {
			message: 'You have to select at least one PDF.'
		})
	});
	export type FormSchema = typeof formSchema;
</script>

<script lang="ts">
	import SuperDebug, { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { BASE_URL } from '$lib/constants';

	// In a real scenario, this would be passed as a prop
	// const availablePdfs = [
	//   { id: 'document1.pdf', label: 'Invoice.pdf' },
	//   { id: 'document2.pdf', label: 'Document 2' },
	//   { id: 'document3.pdf', label: 'Document 3' },
	//   { id: 'document4.pdf', label: 'Document 4' },
	//   { id: 'document5.pdf', label: 'Document 5' }
	// ];

	// Prop passed from the parent component
	export let availablePdfs = [];
	export let jobId = '';

	let data: SuperValidated<Infer<FormSchema>> = $page.data.pdfSelection || {
		selectedPdfs: []
	};
	export { data as form };

	const form = superForm(data, {
		validators: zodClient(formSchema),
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				toast.success(`Selected PDFs: ${JSON.stringify(f.data.selectedPdfs)}`);
			} else {
				toast.error('Please fix the errors in the form.');
			}
		}
	});

	const { form: formData, enhance } = form;

	function addPdf(id: string) {
		$formData.selectedPdfs = [...$formData.selectedPdfs, id];
	}

	function removePdf(id: string) {
		$formData.selectedPdfs = $formData.selectedPdfs.filter((i) => i !== id);
	}

	async function handleSubmit() {
		// Function to get the access token from cookies
		function getCookie(name) {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) return parts.pop().split(';').shift();
		}

		try {
			const accessToken = getCookie('ea_access_token'); // Retrieve access token from cookies

			if (!accessToken) {
				toast.error('Authorization token is missing');
				return;
			}

			const response = await fetch(`${BASE_URL}/extract_data/${jobId}/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}` // Add the Authorization header with the token
				},
				body: JSON.stringify({ selectedPdfs: $formData.selectedPdfs, type: 'RERUN' })
			});

			const result = await response.json();

			if (!response.ok) {
				// For non-ok responses, throw an error with the response data
				throw new Error(JSON.stringify(result));
			}

			toast.success('Done! Check the dashboard for the results.');
			console.log('Submission result:', result);
		} catch (error) {
			let errorMessage = 'Submission error';
			let errorData;

			try {
				// Try to parse the error message as JSON
				errorData = JSON.parse(error.message);
			} catch {
				// If parsing fails, it's not a JSON string
				console.error('Error parsing:', error);
			}

			if (errorData && errorData.status === 'error') {
				errorMessage = errorData.message;
			}

			toast.error(errorMessage);
			console.error('Submission error:', errorMessage);
		}
	}
</script>

{#if availablePdfs.length}
	<form on:submit|preventDefault={handleSubmit} class="space-y-8">
		<Form.Fieldset {form} name="selectedPdfs" class="space-y-0">
			<div class="mb-4">
				<Form.Legend class="text-base">Select PDFs</Form.Legend>
				<Form.Description>Choose the PDFs to submit.</Form.Description>
			</div>
			<div class="space-y-4">
				{#each availablePdfs as pdf}
					{@const checked = $formData.selectedPdfs.includes(pdf.id)}
					<div class="flex flex-row items-center space-x-3">
						<Form.Control let:attrs>
							<Checkbox
								{...attrs}
								{checked}
								onCheckedChange={(v) => {
									if (v) {
										addPdf(pdf.id);
									} else {
										removePdf(pdf.id);
									}
								}}
							/>
							<Form.Label class="font-normal max-w-[30rem] pe-4 text-ellipsis overflow-hidden">
								{pdf.label}
							</Form.Label>
							<input hidden type="checkbox" name={attrs.name} value={pdf.id} {checked} />
						</Form.Control>
					</div>
				{/each}
				<Form.FieldErrors />
			</div>
		</Form.Fieldset>
		<Form.Button class="w-full">Re-run on selected PDFs</Form.Button>
	</form>
{:else}
	<p>No PDFs available</p>
{/if}
