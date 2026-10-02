<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let { class: className, ref = $bindable(null), ...rest }: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	class={cn(
		'min-h-11 flex-1 cursor-pointer px-4 font-mono text-sm font-bold uppercase motion-safe:transition-colors motion-safe:duration-100 sm:flex-none',
		'border-foreground not-first:border-l-2 hover:bg-muted',
		'data-[state=active]:bg-foreground data-[state=active]:text-background',
		'disabled:pointer-events-none disabled:opacity-40',
		className
	)}
	{...rest}
/>
