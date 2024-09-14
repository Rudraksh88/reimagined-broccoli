<script>
	import { cn } from '$lib/utils.js';
	import { Search } from 'lucide-svelte';
	let className = undefined;
	export let value = undefined;
	export { className as class };
	export let readonly = undefined;
	export let placeholder = 'Search..';
	export let icon = Search;
</script>

<div class="relative flex items-center">
	{#if icon}
		<svelte:component this={icon} class="absolute left-2.5 size-4 text-muted-foreground" />
	{/if}
	<input
		{placeholder}
		class={cn(
			'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-gray-400 flex h-10 w-full rounded-md border px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 ps-8',
			className
		)}
		bind:value
		{readonly}
		on:blur
		on:change
		on:click
		on:focus
		on:focusin
		on:focusout
		on:keydown
		on:keypress
		on:keyup
		on:mouseover
		on:mouseenter
		on:mouseleave
		on:mousemove
		on:paste
		on:input
		on:wheel|passive
	/>
</div>
