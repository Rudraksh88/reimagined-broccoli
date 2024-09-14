<script>
	import { onMount, afterUpdate } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { SendHorizontal } from 'lucide-svelte';
	import { BASE_URL } from '$lib/constants';
	
	export let job_id;
	let messages = [];
	let prompt = '';
	let isLoading = false;
	let chatContainerRef;

	// Fetch the access token from cookies
	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}

	// Function to handle chat submission
	async function handleSubmit() {
		if (!prompt.trim()) {
			toast.error('Please enter a message');
			return;
		}

		const accessToken = getCookie('ea_access_token');

		if (!accessToken) {
			toast.error('Authorization token is missing');
			return;
		}

		isLoading = true;

		try {
			// Add the user's message to the chat
			const userMessage = {
				id: job_id,
				text: prompt,
				timestamp: new Date().toLocaleString(),
				isUser: true
			};
			messages = [...messages, userMessage];
			prompt = '';

			// Send the input to the API
			const response = await fetch(`${BASE_URL}/chatai_response/${job_id}/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify({
					chat_input: userMessage.text
				})
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`);
			}

			const data = await response.json();

			// Add the bot's response to the chat
			const botMessage = {
				id: messages.length + 2,
				text: data.output,
				timestamp: new Date().toLocaleString(),
				isUser: false
			};
			messages = [...messages, botMessage];

			// Scroll to the bottom of the chat container
			scrollToBottom();
		} catch (error) {
			console.error('Error sending message:', error);
			toast.error('Failed to send message');
		} finally {
			isLoading = false;
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}

	onMount(() => {
		scrollToBottom();
	});

	afterUpdate(() => {
		scrollToBottom();
	});

	function scrollToBottom() {
		if (chatContainerRef) {
			chatContainerRef.scrollTop = chatContainerRef.scrollHeight;
		}
	}
</script>

<div class="flex flex-col gap-4 h-[500px]">
	<div class="space-y-1.5">
		<h4 class="font-medium leading-none">Chat</h4>
		<p class="text-muted-foreground text-sm">Ask any question related to template</p>
	</div>

	<div
		class="chat-container flex-1 overflow-y-auto bg-white border-t border-gray-200"
		bind:this={chatContainerRef}
	>
		{#each messages as message}
			<div class="message-container flex my-2 {message.isUser ? 'justify-end' : ''}">
				<div
					class="message-bubble rounded-2xl px-4 py-2 max-w-[70%] {message.isUser
						? 'bg-green-100'
						: 'bg-white'}"
				>
					<p>{message.text}</p>
					<span class="text-xs text-gray-500">{message.timestamp}</span>
				</div>
			</div>
		{/each}
	</div>

	<div class="user-input-container flex items-center gap-4 border-t border-gray-200 p-4">
		<textarea
			id="chatBot"
			class="w-full h-fi text-sm rounded-md border bg-transparent focus-visible:ring-gray-400 focus-visible:ring-offset-0 focus-visible:border-transparent px-4 py-2"
			rows="3"
			bind:value={prompt}
			on:keydown={handleKeydown}
			aria-label="Enter your message"
		></textarea>
		<Button
			class="bg-black text-white rounded-xl px-4 py-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
			on:click={handleSubmit}
			disabled={isLoading}
			aria-label="Send message"
		>
			<SendHorizontal class="w-5 h-5" />
		</Button>
	</div>
</div>

<style lang="postcss">
	.chat-container {
		@apply px-6 py-4;
	}

	.message-bubble {
		@apply shadow-sm;
	}

	.message-container.justify-end {
		justify-content: flex-end;
	}

	.message-container.justify-end .message-bubble {
		@apply bg-green-100;
	}
</style>
