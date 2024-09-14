<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';
	import { PencilLine, RefreshCw, MessagesSquare, Sparkles, Mail, Forward } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import PopoverContent from '$lib/components/ui/addPromptContent.svelte';
	import ChatBot from '$lib/components/ui/chatBotContent.svelte';
	import FlagUI from '$lib/components/ui/FlagUI.svelte';
	import PdfForm from '$lib/components/ui/pdf-form.svelte';
	import EmailModal from './EmailModal.svelte';

	export let prompt = '';
	export let jobId = '';

	export let pdfs = [];

	let pdfBtnSet = false;
	let promptBtnSet = false;
	let chatBtnSet = false;
	let rulesFlag = false;
	let sendPlacefolder = false;
	let sendEmailSet = false;

	export let email_id;
	export let email_subject;

	let popoverType = '';
	let showEmailModal = false;
	let emailRecipients = [];
	let emailSubject = '';
	let emailBody = '';
	let emailAttachments = [];

	function openEmailModal() {
		// In a real scenario, you would fetch this data from an API
		emailRecipients = email_id.includes('<') ? email_id.split('<')[1].split('>')[0] : email_id;
		emailSubject = `Re: ${email_subject}`;
		emailBody = 'Your email body here...';
		emailAttachments = [{ name: 'attachment.pdf' }]; // Example attachment
		showEmailModal = true;
	}

	function handleEmailSubmit(event) {
		const { recipients, subject, body, attachments } = event.detail;
		console.log('Sending email:', { recipients, subject, body, attachments });
		// Here you would typically send this data to your backend API
		showEmailModal = false;
	}
</script>

<div class="flex items-center mr-6 -mt-6 gap-1.5">
	<!-- <PDFDropdown {jobId} on:jobDataFetched={handleJobDataFetched} /> -->

	<!-- Rules Flag -->
	<Popover.Root
		portal={null}
		onOpenChange={() => {
			rulesFlag = !rulesFlag;
		}}
	>
		<Popover.Trigger
			class="focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none hidden"
		>
			<Button
				variant="outline"
				class="h-[37px] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none {rulesFlag
					? 'bg-gray-100'
					: ''}"
			>
				<div><Sparkles class="size-4 mr-0 text-red-500" /></div>
				<!-- <div class="ml-2">Rules</div> -->
			</Button>
		</Popover.Trigger>
		<Popover.Content class="mt-2 fixed w-96 shadow-2xl">
			<FlagUI {prompt} job_id={jobId} />
		</Popover.Content>
	</Popover.Root>

	<!-- Chatbot -->
	<Popover.Root
		portal={null}
		onOpenChange={() => {
			chatBtnSet = !chatBtnSet;
		}}
	>
		<Popover.Trigger
			class="focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none"
		>
			<Button
				variant="outline"
				class="h-[37px] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none {chatBtnSet
					? 'bg-gray-100'
					: ''}"
			>
				<div><MessagesSquare class="size-4 mr-0 text-green-500" /></div>
				<div class="ml-2">Chat</div>
				<!-- Chat -->
			</Button>
		</Popover.Trigger>
		<Popover.Content class="mt-2 fixed w-96 shadow-2xl">
			<ChatBot {prompt} job_id={jobId} />
		</Popover.Content>
	</Popover.Root>

	<Popover.Root
		portal={null}
		onOpenChange={() => {
			promptBtnSet = !promptBtnSet;
		}}
	>
		<!-- Modify -->
		<Popover.Trigger
			class="focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none"
		>
			<Button
				variant="outline"
				class="h-[37px] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none {promptBtnSet
					? 'bg-gray-100'
					: ''}"
			>
				<PencilLine class="size-4 mr-2 text-blue-400" />
				Modify prompt
			</Button>
		</Popover.Trigger>
		<Popover.Content class="mt-2 fixed left-0 w-96">
			<PopoverContent {prompt} job_id={jobId} />
		</Popover.Content>
	</Popover.Root>

	<!-- Re-run -->
	<Popover.Root
		onOpenChange={() => {
			pdfBtnSet = !pdfBtnSet;
		}}
	>
		<Popover.Trigger>
			<Button
				variant="outline"
				class="h-[37px] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0  focus-visible:outline-none focus:outline-none {pdfBtnSet
					? 'bg-gray-100'
					: ''}"
			>
				<RefreshCw class="size-4 mr-2 text-amber-600" />
				Re-run
			</Button>
		</Popover.Trigger>
		<Popover.Content class="mt-2 max-w-[35rem] w-max -right-[20px] !left-[unset]">
			<PdfForm availablePdfs={pdfs} {jobId} />
		</Popover.Content>
	</Popover.Root>

	<!-- Send <>-->
	<Popover.Root
		onOpenChange={() => {
			sendPlacefolder = !sendPlacefolder;
		}}
	>
		<Popover.Trigger>
			<Button
				variant="outline"
				class="h-[37px] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0  focus-visible:outline-none focus:outline-none hidden {sendPlacefolder
					? 'bg-gray-100'
					: ''}"
			>
				<Forward class="size-4 mr-0 text-pink-600" />
				<!-- sendPlacefolder -->
			</Button>
		</Popover.Trigger>
		<Popover.Content class="mt-2 max-w-[35rem] w-max -right-[20px] !left-[unset]">
			<div>Send to placeholder</div>
		</Popover.Content>
	</Popover.Root>

	<!-- Send Email -->
	<Popover.Root
		onOpenChange={() => {
			sendEmailSet = !sendEmailSet;
			popoverType = 'email';
		}}
	>
		<Popover.Trigger>
			<Button
				on:click={openEmailModal}
				variant="outline"
				class="h-[37px] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0  focus-visible:outline-none focus:outline-none hidden {sendEmailSet
					? 'bg-gray-100'
					: ''}"
			>
				<Mail class="size-4 mr- text-blue-600" />
				<!-- New email -->
			</Button>
		</Popover.Trigger>

		{#if popoverType === 'email'}
			<div class="">
				<div class="">
					<Popover.Content class="w-[700px] h-[550px] blur-0 backdrop-blur-0 p-0 m-0">
						<EmailModal
							bind:recipients={emailRecipients}
							bind:subject={emailSubject}
							bind:body={emailBody}
							attachments={emailAttachments}
							on:submit={handleEmailSubmit}
						/>
					</Popover.Content>
				</div>
			</div>
		{/if}
	</Popover.Root>
</div>
