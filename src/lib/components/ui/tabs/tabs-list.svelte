<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let { class: className, ref = $bindable(null), ...rest }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	class={cn('inline-flex w-full border-2 border-foreground sm:w-fit', className)}
	{...rest}
/>
