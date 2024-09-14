<!-- Content for Add prompt dialog -->
<!-- Just a simple text area with a submit and cancel button -->
<script>
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { BASE_URL } from '$lib/constants';

	export let prompt = '';
	export let job_id = '';

	function handleSubmit() {
		if (!prompt) {
			toast('Please enter a prompt');
			return;
		}

		if (!job_id) {
			toast('Job ID not found');
			return;
		}

		console.log('job_id prompt:', job_id);

		let formData = new FormData();
		formData.append('prompt', prompt);

		fetch(`${BASE_URL}/api/add_prompt/${job_id}/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt: prompt })
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				console.log(data);
				// Show a toast notification
				// toast('Prompt added!');
				toast(data.message);
			})
			.catch((error) => {
				console.error('There was a problem with the fetch operation:', error);
				toast('There was a problem adding the prompt');
			});
	}
</script>

<div class="grid gap-4">
	<div class="space-y-1.5">
		<h4 class="font-medium leading-none">Appled rules</h4>
		<p class="text-muted-foreground text-sm">List of all the rules applied</p>
	</div>
	<div class="flex gap-1 flex-wrap overflow-hidden">
		<div class="w-fit border rounded-full py-1 px-4">parse_date</div>
        <div class="w-fit border rounded-full py-1 px-4">parse_date</div>
        <div class="w-fit border rounded-full py-1 px-4">parse_date</div>
        <div class="w-fit border rounded-full py-1 px-4">parse_date</div>
        <div class="w-fit border rounded-full py-1 px-4">parse_date</div>
	</div>
</div>
