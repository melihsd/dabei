<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	type Props = HTMLTextareaAttributes & { ref?: HTMLTextAreaElement | null };

	let { class: className, ref = $bindable(null), value = $bindable(), ...rest }: Props = $props();
</script>

<textarea
	bind:this={ref}
	bind:value
	class={cn(
		'border- min-h-20 w-full resize-none border-foreground bg-background p-2 text-sm placeholder:text-muted-foreground disabled:opacity-40',
		className
	)}
	{...rest}></textarea>
