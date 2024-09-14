<script>
    import { flip } from 'svelte/animate';
    import { fade, scale } from 'svelte/transition';
    import { crossfade } from 'svelte/transition';
    import Icon from "$lib/components/icon.svelte";
    import Card from "$lib/components/ui/kanban/card/card.svelte";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

    export let title = 'Board title';
    export let icon = 'pending';
    export let color = 'text-gray-600';
    export let data = [];


    const [send, receive] = crossfade({
        duration: 300,
        fallback(node, params) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;

            return {
                duration: 250,
                // css: t => `
                //     transform: ${transform} scale(${t});
                //     opacity: ${t}
                // `
                // min scale is 0.9 to avoid super fancy animations
                css: t => `
                    transform: ${transform} scale(${t * 0.1 + 0.9});
                    opacity: ${t}
                `
            };
        }
    });
</script>

<div class="rounded-lg bg-gray-100/70 p-2 pb-0 flex-1 overflow-hidden h-full flex flex-col">
    <div class="flex items-center mb-2 mt-0.5 mx-2 cursor-default">
        <Icon type="{ icon }" class="size-5 { color } mr-1.5" />
        <div class="font-semibold text-neutral-800 text-nowrap">{ title }</div>
        <div class="rounded-full text-xs px-2.5 py-0.5 bg-white text-gray-500 border border-gray-300/70 font-bold ml-2">{ data.length }</div>
    </div>

    <ScrollArea class="overflow-auto flex-1">
        {#each data as job (job.id)}
            <div animate:flip={{duration: 300}}
                 in:receive={{key: job.id}}
                 out:send={{key: job.id}}>
                <Card
                    job_id={job.id}
                    created_at={job.created_at}
                    started_at={job.started_at}
                    completed_at={job.completed_at}
                    status={job.status}
                    email_id={job.email_id}
                    email_subject={job.email_subject}
                    file_count={job.file_count}
                    elapsed={job.elapsed}
                />
            </div>
        {:else}
            <div in:receive={{key: 'empty'}} out:send={{key: 'empty'}} class="content-center h-full flex-1">
                <p class="text-center text-gray-500 select-none mt-16">no items</p>
            </div>
        {/each}
    </ScrollArea>
</div>