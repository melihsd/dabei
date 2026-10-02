<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let {
		class: className,
		ref = $bindable(null),
		value = $bindable(''),
		...rest
	}: TabsPrimitive.RootProps = $props();
</script>

<TabsPrimitive.Root bind:ref bind:value class={cn('flex flex-col gap-4', className)} {...rest} />
