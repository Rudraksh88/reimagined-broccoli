
<script>
    import { onMount } from 'svelte';

    export let url = '';
    export let tableClass = '';
    export let theadClass = '';
    export let thClass = '';
    export let tbodyClass = '';
    export let trClass = '';
    export let tdClass = '';

    let data = [];
    let headers = [];

    async function fetchCSV() {
      try {
        const response = await fetch(url);
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(';'));
        headers = rows.shift();
        data = rows.filter(row => row.length === headers.length);
      } catch (error) {
        console.error('Error fetching CSV:', error);
      }
    }

    onMount(fetchCSV);
  </script>

  <table class={tableClass}>
    <thead class={theadClass}>
      <tr>
        {#each headers as header}
          <th class={thClass}>{header}</th>
        {/each}
      </tr>
    </thead>
    <tbody class={tbodyClass}>
      {#each data as row}
        <tr class={trClass}>
          {#each row as cell}
            <td class={tdClass}>{cell}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>