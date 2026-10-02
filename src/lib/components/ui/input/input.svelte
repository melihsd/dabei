<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	type Props = HTMLInputAttributes & { ref?: HTMLInputElement | null };

	let { class: className, ref = $bindable(null), value = $bindable(), ...rest }: Props = $props();
</script>

<input
	bind:this={ref}
	bind:value
	class={cn(
		'border- min-h-11 w-full border-foreground bg-background px-3 text-sm placeholder:text-muted-foreground disabled:opacity-40',
		className
	)}
	{...rest}
/>
