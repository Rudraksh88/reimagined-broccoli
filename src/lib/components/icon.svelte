<script>
    import { onMount } from 'svelte';

    export let type = 'pending';
    export let variant = 'default';

    let icon;

    // export let color = 'text-gray-600'; // export is the prop value and the declaration is the default value

    // Import the svg file based on the type from $lib/assets/images folder
    onMount(async () => {
      icon = (await import(`$lib/assets/images/${type}.svelte`)).default;
    });

</script>

{#if icon}
  <div {...$$restProps}>
    <svelte:component this={icon} width="100%" height="100%" variant={variant} />
  </div>
{/if}