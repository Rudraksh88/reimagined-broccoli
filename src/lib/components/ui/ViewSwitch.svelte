<script>
  export let activeView = 'csv';

  function switchView(view) {
    activeView = view;
  }
</script>

<div class="absolute top-3 right-3 flex bg-gray-200 rounded-full overflow-hidden z-50 border-0 border-gray-400">
  <button
    class="px-4 py-1 text-xs font-medium {activeView === 'csv' ? 'bg-gray-800 text-white' : 'text-gray-700 hover:bg-gray-200'}"
    on:click={() => switchView('csv')}
  >
    CSV
  </button>
  <button
    class="px-4 py-1 text-xs font-medium {activeView === 'pdf' ? 'bg-gray-800 text-white' : 'text-gray-700  hover:bg-gray-200'}"
    on:click={() => switchView('pdf')}
  >
    PDF
  </button>
</div>