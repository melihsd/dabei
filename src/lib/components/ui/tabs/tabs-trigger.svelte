<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let { class: className, ref = $bindable(null), ...rest }: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	class={cn(
		'cursor-pointer px-4 py-2 font-mono text-sm motion-safe:transition-colors motion-safe:duration-100',
		'border-foreground not-first:border-l hover:bg-muted',
		'data-[state=active]:bg-foreground data-[state=active]:text-background',
		'disabled:pointer-events-none disabled:opacity-40',
		className
	)}
	{...rest}
/>
