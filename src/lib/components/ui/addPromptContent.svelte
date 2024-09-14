<!-- Content for Add prompt dialog -->
 <!-- Just a simple text area with a submit and cancel button -->
<script>
    import * as Popover from "$lib/components/ui/popover";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
    import { toast } from "svelte-sonner";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Textarea } from "$lib/components/ui/textarea";
    import { BASE_URL } from "$lib/constants";
    import { getCookie } from '$lib/stores/getCookie';

    export let prompt = '';
    export let job_id = '';

   
    // Handle submit button click to POST the prompt
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

        const accessToken = getCookie('ea_access_token');

        if (!accessToken) {
            toast.error('Authorization token is missing');
            return;
        }

        // POST the prompt. Send a request to the server to save the prompt
        fetch(`${ BASE_URL }/jobs/${job_id}/extra-prompt/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({ prompt: prompt }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            // Show a toast notification
            // toast('Prompt added!');
            toast(data.message);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            toast.error('There was a problem adding the prompt');
        });
    }
</script>

<div class="grid gap-4">
    <div class="space-y-1.5">
      <h4 class="font-medium leading-none">Add/Modify prompt</h4>
      <p class="text-muted-foreground text-sm">
        Re-run the job after changing the prompt
      </p>
    </div>
    <div class="space-y-4">
        <!-- <Label for="prompt" class="text-sm">Prompt</Label> -->
        <Textarea id="prompt" class="w-full focus-visible:ring-gray-400 focus-visible:ring-offset-0 focus-visible:border-transparent" rows="5" bind:value={prompt} />
        <!-- Button to submit the prompt -->
        <Button class="w-full"
            on:click={() => {
                // toast('Prompt added!');
                handleSubmit();
            }}>
            Submit
        </Button>
    </div>
  </div>