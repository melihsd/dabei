<script lang="ts">
	import { Switch as SwitchPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';

	let {
		class: className,
		ref = $bindable(null),
		checked = $bindable(false),
		...rest
	}: SwitchPrimitive.RootProps = $props();
</script>

<SwitchPrimitive.Root
	bind:ref
	bind:checked
	class={cn(
		'inline-flex h-7 w-12 shrink-0 cursor-pointer items-center border-2 border-foreground p-0.5 disabled:opacity-40 data-[state=checked]:bg-foreground motion-safe:transition-colors motion-safe:duration-100',
		className
	)}
	{...rest}
>
	<SwitchPrimitive.Thumb
		class="block size-4.5 bg-foreground data-[state=checked]:translate-x-5 data-[state=checked]:bg-background motion-safe:transition-transform motion-safe:duration-100"
	/>
</SwitchPrimitive.Root>
