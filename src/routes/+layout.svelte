<script>
	import '../app.css';
	import { BASE_URL } from '$lib/constants';
	import { fetchEmails } from '$lib/stores/fetchEmails';
	import logo from '$lib/assets/images/dlai_logo.svg';
	import { Toaster } from '$lib/components/ui/sonner';
	import { toast } from 'svelte-sonner';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import RangeDatePicker from '$lib/components/ui/range-date-picker.svelte';
	import { SendIcon, RefreshCw, RotateCw, LogOut } from 'lucide-svelte';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	// Import authentication related functions and stores
	import { authStore, logout } from '$lib/stores/authStore.js';
	import { goto } from '$app/navigation';

	const isLoading = writable(true);

	function handleLogout() {
		logout();
		goto('/login');
	}

	$: if (!isLoading && !$authStore.isAuthenticated) {
		goto('/auth');
	}

	onMount(async () => {
		await authStore.checkAuth(); // Check authentication on load
		isLoading.set(false); // Set loading to false after auth check
	});
</script>

<div id="container" class="h-lvh w-screen flex flex-col pb-5">
	{#if $authStore.isAuthenticated}
		<div class="flex items-center justify-between py-5 px-8 w-full bg-white">
			<!-- <img src={logo} alt="DLAI Logo" class="h-6 mr-4 opacity-70" color="text-blue-400" /> -->
			<div>
				<div class="font-medium text-sm text-gray-500">EPIC EmailAgent</div>
				<div class="font-bold text-3xl text-neutral-800">Dashboard</div>
			</div>
			<div class="flex items-center gap-2">
				<Input type="search" placeholder="search" class="max-w-lg" />
				<RangeDatePicker />
				<Button on:click={fetchEmails} class="items-center flex">
					<RotateCw class="h-4 w-4 mr-2" />
					Refresh mailbox
				</Button>
					<div class="flex items-center gap-2">
						<Button variant="outline" on:click={handleLogout} class="items-center flex border-gray-300">
							<LogOut class="h-4 w-4 mr-2" />
							Logout
						</Button>
					</div>
				</div>
		</div>
	{/if}
	<Toaster />
	<slot />
</div>
