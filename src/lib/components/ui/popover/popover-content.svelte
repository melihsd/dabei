<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let {
		class: className,
		ref = $bindable(null),
		sideOffset = 8,
		...rest
	}: PopoverPrimitive.ContentProps = $props();
</script>

<PopoverPrimitive.Portal>
	<PopoverPrimitive.Content
		bind:ref
		{sideOffset}
		class={cn(
			'z-50 w-72 max-w-[calc(100vw-2rem)] border-2 border-foreground bg-popover p-3 text-popover-foreground shadow-hard',
			className
		)}
		{...rest}
	/>
</PopoverPrimitive.Portal>
