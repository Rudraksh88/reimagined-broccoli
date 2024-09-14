<script>
    import { onMount, onDestroy } from 'svelte';
    import Board from "$lib/components/ui/kanban/board.svelte";
    import { jobStore, fetchJobs } from '$lib/stores/jobStore.js';
    import { authStore } from '$lib/stores/authStore.js';

    let intervalId;

    async function pollJobs() {
        await fetchJobs();
        intervalId = setTimeout(pollJobs, 2000);  // Poll every 2 seconds
    }

    onMount(() => {
        pollJobs();  // Start polling
    });

    onDestroy(() => {
        clearTimeout(intervalId);
    });
</script>

{#if $authStore.isAuthenticated}
<div class="flex justify-between items-center px-6 gap-5 max-h-[calc(100%-6.3rem)] flex-1">
    <Board title="Pending" icon="pending" color="text-yellow-500" data={$jobStore.pending}/>
    <Board title="In Process" icon="process" color="text-sky-500" data={$jobStore.inProcess}/>
    <Board title="Completed" icon="completed" color="text-green-500" data={$jobStore.completed}/>
    <Board title="Error" icon="error" color="text-red-500" data={$jobStore.error}/>
    <Board title="Sent" icon="sent" color="text-blue-500" data={$jobStore.sent}/>

</div>
{/if}
