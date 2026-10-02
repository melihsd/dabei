<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	type Props = HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLElement | null;
		/** Where the tail sits: below the bubble (pointing down) or above it (pointing up). */
		tail?: 'down' | 'up';
	};

	let {
		class: className,
		ref = $bindable(null),
		tail = 'down',
		children,
		...rest
	}: Props = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		'border- relative max-w-64 border-foreground bg-card px-3 py-2 text-sm break-words text-card-foreground motion-safe:animate-chip-in',
		className
	)}
	{...rest}
>
	{@render children?.()}
	<span
		aria-hidden="true"
		class={cn(
			'absolute left-3 size-3 rotate-45 border-foreground bg-card',
			tail === 'down' ? '-bottom-[7px] border-r border-b' : '-top-[7px] border-t border-l'
		)}
	></span>
</div>
