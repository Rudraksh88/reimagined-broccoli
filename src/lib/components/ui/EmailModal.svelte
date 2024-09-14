<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import {DialogClose} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Search, Send, X, Plus, Paperclip } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { BASE_URL } from '$lib/constants';

	export let job_id;
	export let recipients;
	export let defaultRecipient = recipients; // Add a default recipient
	export let subject;
	export let body;
	export let attachments;
	export let placeholder = 'Add recipient...';
  	let dialogCloseRef;


	const dispatch = createEventDispatcher();
	let errors = { recipients: '', subject: '', body: '' };
	let recipientInput = '';

	onMount(() => {
		if (defaultRecipient && validateEmail(defaultRecipient)) {
			recipients = [defaultRecipient];
		}
	});

	function validateEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(String(email).toLowerCase());
	}

	function addRecipient() {
		if (validateEmail(recipientInput)) {
			recipients = [...recipients, recipientInput];
			recipientInput = '';
			errors.recipients = '';
			toast.success('Recipient added successfully');
		} else {
			errors.recipients = 'Invalid email format';
			toast.error('Invalid email format');
		}
	}

	function removeRecipient(index) {
		recipients = recipients.filter((_, i) => i !== index);
		toast.info('Recipient removed');
	}

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addRecipient();
		}
	}

	// Function to get the access token from cookies
	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}

	async function handleSubmit() {
		errors = { recipients: '', subject: '', body: '' };

		if (recipients.length === 0) {
			errors.recipients = 'Recipients cannot be empty';
			toast.error('Recipients cannot be empty');
		}

		if (!subject.trim()) {
			errors.subject = 'Subject cannot be empty';
			toast.error('Subject cannot be empty');
		}

		if (!body.trim()) {
			errors.body = 'Body cannot be empty';
			toast.error('Body cannot be empty');
		}

		if (!errors.recipients && !errors.subject && !errors.body) {
			const accessToken = getCookie('ea_access_token');
			console.log('accessToken', accessToken);

			if (!accessToken) {
				toast.error('Authorization token is missing');
				return;
			}

			const payload = {
				subject,
				recipient_email: recipients[0],
				message_body: body
			};

			// API call to send the email
			try {
				toast.success('Sending..');
				const dialogCloseElement = document.querySelector('[data-dialog-close]');
				if (dialogCloseElement) {
				dialogCloseElement.click();
				}

				const response = await fetch(`${BASE_URL}/send_email_with_attachment/${job_id}/`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`
					},
					body: JSON.stringify(payload)
				});

				console.log(response); // Log the response to check status and details

				if (!response.ok) {
					console.log('Response not OK:', response.status, response.statusText);
					throw new Error(`Network response was not ok. Status: ${response.status}`);
				}

				const result = await response.json();
				toast.success('Email sent successfully');

				// Clear the body and close the modal
				body = '';

			} catch (error) {
				console.error('API request failed', error);
				toast.error('Failed to send email');
			}
		}
	}
</script>

<Dialog.Content
	class="w-[calc(100vw-50rem)] h-[calc(100vh-20rem)] min-w-[550px] min-h-[450px] max-h-[450px] rounded-2xl p-0 m-0 text-white overflow-hidden"
>
	<div>
		<Dialog.Header>
			<Dialog.Title class="text-white bg-black rounded-t-2xl py-3 text-sm pl-5 font-normal z-0">
				<div class="flex justify-between w-full">
					<div class="flex space-x-2">
						<Send class="w-4" />
						<div class="my-auto">New email</div>
					</div>
					<div
						class="font-normal my-auto mr-10 rounded-md text-black text-xs px-2 py-0.5 bg-gray-200"
					>
						#{job_id}
					</div>
				</div>
			</Dialog.Title>
		</Dialog.Header>
		<div class="grid text-xs text-gray-400 w-full">
			<div class="flex items-start w-full h-full px-5">
				<div class="flex justify-start pt-6">
					<label for="recipients" class="text-right mr-4">To:</label>
				</div>
				<div class="relative w-full flex flex-wrap items-center gap-1 pt-4">
					<div class="flex flex-wrap items-center h-full max-h-16 overflow-scroll gap-1">
						{#each recipients as recipient, index}
							<div class="bg-gray-100 pl-3 px-2 py-1.5 text-black rounded-full flex items-center">
								{recipient}
								<button
									on:click={() => removeRecipient(index)}
									class="ml-2 border hover:border-red-500 hover:bg-red-100 rounded px-0.5 text-gray-500 hover:text-red-700 group transition duration-200"
								>
									<X class="w-3 h-3 group-hover:text-red-700" />
								</button>
							</div>
						{/each}
					</div>
					<div class="relative flex items-center">
						<input
							type="text"
							{placeholder}
							id="recipients"
							bind:value={recipientInput}
							on:keydown={handleKeydown}
							class="w-72 border rounded-full text-black px-3 py-1.5 focus:outline-none bg-white"
						/>
						<button
							on:click={addRecipient}
							class="ml-1 w-6 h-6 bg-black hover:bg-gray-700 rounded-full flex items-center justify-center group"
						>
							<Plus class="w-4 h-4 text-white transition-all duration-200" />
						</button>
					</div>
				</div>
				<!-- {#if errors.recipients}
					<p class="text-red-500 text-sm ml-2">{errors.recipients}</p>
				{/if} -->
			</div>

			<div class="mt-4"><hr /></div>

			<div class="flex items-center">
				<!-- <label for="subject" class="text-right mr-5">Subject:</label> -->
				<div class="relative w-full">
					<input
						placeholder="Subject"
						type="text"
						id="subject"
						bind:value={subject}
						class="w-full border-0 rounded px-0 py-4 pl-5 text-black focus:outline-none bg-white"
					/>
				</div>

			</div>

			<div class=""><hr /></div>

			<div class="flex items-center">
				<textarea
					id="body"
					placeholder="Body"
					bind:value={body}
					class="px-5 py-4 text-black col-span-3 h-fit w-full bg-white rounded-none border-0 border-transparent focus:outline-none min-h-[200px] max-h-[225px]"
				/>

			</div>
			<!-- <div class=""><hr /></div> -->

			<div class=""><hr /></div>
		</div>
		<Dialog.Footer class="mt-4 pr-4">
			<DialogClose 
			class="text-xs py-2 px-3 font-semibold bg-gray-100 rounded-md border text-gray-600"
			>
				Cancel
			</DialogClose>
			<button
				class="text-xs py-2 px-3 font-semibold hover:bg-gray-800 rounded-md bg-black text-white"
				on:click={handleSubmit}>Send email</button
			>
		</Dialog.Footer>
	</div>
</Dialog.Content>
