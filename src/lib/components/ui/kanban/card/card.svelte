<script>
	// ToolTip, LoadingBar/ProgressBar, TODO: Add apps & connections in the new settings

	import Loader from '$lib/assets/images/loader.svelte';
	import Icon from '$lib/components/icon.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import JobContent from '$lib/components/ui/jobContent.svelte';
	import { Mail } from 'lucide-svelte';
	import EmailModal from '../../EmailModal.svelte';

	export let job_id,
		created_at,
		started_at,
		completed_at,
		status,
		email_id,
		email_subject,
		file_count,
		elapsed;
	// elapsed to receive the elapsed prop

	console.log('job_id:', job_id);
	// console.log('created_at:', created_at);
	// console.log('started_at:', started_at);
	// console.log('completed_at:', completed_at);
	console.log('status:', status);

	function getDisplayDate() {
		switch (status) {
			case 'COMPLETED':
				return new Date(completed_at).toLocaleString();
			case 'PROCESSING':
				return new Date(started_at || created_at).toLocaleString();
			default:
				return new Date(created_at).toLocaleString();
		}
	}

	$: displayDate = getDisplayDate();

	function formatDate(dateString) {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getDuration() {
		if (status === 'COMPLETED' && started_at && completed_at) {
			const start = new Date(started_at);
			const end = new Date(completed_at);
			const durationSeconds = (end - start) / 1000;
			if (durationSeconds > 3600) {
				// If duration is more than an hour
				const hours = Math.floor(durationSeconds / 3600);
				const minutes = Math.floor((durationSeconds % 3600) / 60);
				return `${hours}h ${minutes}m`;
			} else if (durationSeconds > 60) {
				// If duration is more than a minute
				const minutes = Math.floor(durationSeconds / 60);
				return `${minutes}m ${Math.floor(durationSeconds % 60)}s`;
			} else {
				// If duration is less than a minute
				return `${durationSeconds.toFixed(0)}s`;
			}
		}
		return 'N/A';
	}

	$: duration = getDuration();

	// Get elapsed time since the job started
	function formatElapsedTime(elapsedMs) {
		if (!elapsedMs) return 'N/A';
		const elapsedSeconds = elapsedMs / 1000;
		if (elapsedSeconds > 3600) {
			const hours = Math.floor(elapsedSeconds / 3600);
			const minutes = Math.floor((elapsedSeconds % 3600) / 60);
			return `${hours}h ${minutes}m`;
		} else if (elapsedSeconds > 60) {
			const minutes = Math.floor(elapsedSeconds / 60);
			return `${minutes}m ${Math.floor(elapsedSeconds % 60)}s`;
		} else {
			return `${elapsedSeconds.toFixed(0)}s`;
		}
	}

	$: elapsedTime = formatElapsedTime(elapsed);

	const pluralize = (count, noun, suffix = 's') => ` ${noun}${count !== 1 ? suffix : ''}`;

	let pdfurl;

	// Email Modal

	let modalType = '';

	let showEmailModal = false;
	let emailRecipients = '';
	let emailSubject = '';
	let emailBody = '';
	let emailAttachments = [];

	function openEmailModal() {
		emailRecipients = parseEmailAddress(email_id);
		emailSubject = `Re: ${email_subject}`;
		emailBody = '';
		emailAttachments = [{ name: 'attachment.pdf' }];
		showEmailModal = true;
	}

	function handleEmailSubmit(event) {
		const { recipients, subject, body, attachments } = event.detail;
		console.log('Sending email:', { recipients, subject, body, attachments });
		showEmailModal = false;
	}

	function parseEmailAddress(emailString) {
		const emailRegex = /<([^>]+)>|([^\s]+@[^\s]+\.[^\s]+)/;
		const match = emailString.match(emailRegex);

		if (match) {
			return match[1] || match[2];
		}

		return emailString;
	}
</script>

<Dialog.Root>
	<div
		class="bg-white rounded-md mb-2.5 m-1 ring-0 hover:ring-2 ring-transparent shadow-lg shadow-neutral-700/5 mx-1 hover:ring-gray-300 transition-all duration-300 ease-out group flex flex-col cursor-default border"
	>
		<Dialog.Trigger class="focus:outline-none focus:ring-0 focus:border-none">
			<div
				class="card-header text-gray-500 border-b px-4 py-2 font-medium text-[13px] flex justify-between cursor-pointer hover:text-gray-900 transition-all duration-200 ease-out"
			>
				<div class="font-mono font-bold text-xs">Job #{job_id}</div>
				<div class="text-gray-400 text-xs tracking-wide">{displayDate}</div>
			</div>
		</Dialog.Trigger>
		<div class="card-content mx-4 my-2 text-xs text-gray-600 w-max font-medium">
			{email_id.includes('<') ? email_id.split('<')[1].split('>')[0] : email_id}
			<!-- email id -->
			<!-- <span class="card-content ml-1 text-xs text-gray-400 w-max font-medium ">
            {  }
        </span> -->
		</div>
		<div class="flex items-center text-sm font-medium text-gray-800 mx-4">
			<Icon type="email" class="size-4 text-gray-300 mr-2" />
			{email_subject}
		</div>
		<div
			class="flex items-center justify-between text-xs font-medium text-gray-500 mx-4 my-3 relative cursor-default select-none"
		>
			<div class="flex items-center">
				<div class="flex items-center">
					<Icon type="file" class="size-3.5 text-purple-500/60 mr-1" />
					{file_count + pluralize(file_count, 'file')}
				</div>

				<div class="flex items-center ml-4 tracking-wide text-nowrap">
					<!-- <Icon type="clock" class="size-3.5 text-purple-500/80 mr-1"/> -->
					{#key status}
						{#if status === 'PROCESSING'}
							<Icon type="loader" variant="default" class="h-3.5 text-sky-600 w-full mr-1.5" />
						{/if}
					{/key}
					{#key status}
						{#if status === 'FAILED' || status === 'PENDING' || status === 'COMPLETED' || status === 'SENT'}
							<Icon type="clock" variant="default" class="h-3.5 text-sky-600 w-full mr-1.5" />
						{/if}
					{/key}

					{#key elapsed}
						{status === 'PROCESSING' ? elapsedTime : status === 'COMPLETED' ? duration : status === 'SENT' ? duration : 'N/A'}
					{/key}
				</div>
			</div>

			{#key status}
				{#if status === 'COMPLETED' || status === 'FAILED' || status === 'SENT'}
					<Dialog.Trigger on:click={() => (modalType = 'email')}>
						<div
							class="absolute right-6 p-1.5 px-2 bottom-0 text-gray-500 hover:!bg-gray-200/70 rounded-md cursor-pointer duration-200 transition-all ease-out0"
							onclick="={openEmailModal()}"
						>
							<Mail class="size-4" />
						</div>
					</Dialog.Trigger>
				{/if}
			{/key}

			<Dialog.Trigger
				class="focus:outline-none focus:ring-0 focus:border-none"
				on:click={() => (modalType = 'job')}
			>
				<div class="absolute -right-1.5 bottom-0">
					<Icon
						type="chevron-right"
						class="size-7 text-gray-500 p-1 group-hover:bg-gray-100/80 hover:!bg-gray-200/70 rounded-md cursor-pointer duration-200 transition-all ease-out"
					/>
				</div>
			</Dialog.Trigger>
		</div>
	</div>

	{#if modalType === 'email'}
		<EmailModal
			bind:job_id
			bind:recipients={emailRecipients}
			bind:subject={emailSubject}
			bind:body={emailBody}
			attachments={emailAttachments}
			on:submit={handleEmailSubmit}
		/>
	{:else if modalType === 'job'}
		<Dialog.Content class="w-[calc(100vw-5rem)] h-[calc(100vh-5rem)] flex flex-col">
			<JobContent {job_id} {email_subject} />
		</Dialog.Content>
	{/if}
</Dialog.Root>
