<script>
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import {
    CalendarDate,
    DateFormatter,
    getLocalTimeZone,
    today
  } from "@internationalized/date";
  import { cn } from "$lib/utils.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";

  const df = new DateFormatter("en-US", {
    dateStyle: "medium"
  });

  const nowDate = today(getLocalTimeZone());
  const yesterdayDate = nowDate.subtract({ days: 1 });

  let value = {
    start: yesterdayDate,
    end: nowDate
  };

  let startValue = undefined;

  function formatDate(date) {
    try {
      if (date instanceof CalendarDate) {
        const jsDate = date.toDate(getLocalTimeZone());
        console.log('Formatting date:', date, 'JS Date:', jsDate);
        return df.format(jsDate);
      }
      console.log('Invalid date:', date);
      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  }

  console.log('Initial value:', value);
</script>

<div class="grid gap-2">
  <Popover.Root openFocus>
    <Popover.Trigger asChild let:builder>
      <Button
        variant="outline"
        class={cn(
          "w-[300px] justify-start text-left font-normal focus-visible:ring-gray-400 focus-visible:ring-offset-0",
          !value && "text-muted-foreground"
        )}
        builders={[builder]}
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {#if value && value.start}
          {#if value.end}
            {formatDate(value.start)} - {formatDate(value.end)}
          {:else}
            {formatDate(value.start)}
          {/if}
        {:else if startValue}
          {formatDate(startValue)}
        {:else}
          Pick a date
        {/if}
      </Button>
    </Popover.Trigger>
    <Popover.Content class="w-auto p-0 mt-2" align="start">
      <RangeCalendar
        bind:value
        bind:startValue
        initialFocus
        numberOfMonths={2}
        placeholder={value?.start}
        onValueChange={(newValue) => {
          console.log('New value:', newValue);
          value = newValue;
        }}
      />
    </Popover.Content>
  </Popover.Root>
</div>