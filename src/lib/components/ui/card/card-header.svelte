<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	type Props = HTMLAttributes<HTMLDivElement> & { ref?: HTMLElement | null };

	let { class: className, ref = $bindable(null), children, ...rest }: Props = $props();
</script>

<div
	bind:this={ref}
	class={cn('flex items-baseline justify-between gap-2 border-b border-foreground p-3', className)}
	{...rest}
>
	{@render children?.()}
</div>
