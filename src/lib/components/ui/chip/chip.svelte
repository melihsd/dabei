<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	type Props = HTMLAttributes<HTMLSpanElement> & {
		ref?: HTMLElement | null;
		/** Member color, any CSS color (hex from the members table). */
		color: string;
		/** The current user's own chip: full strength. Other chips are slightly dimmed. */
		own?: boolean;
		/** Shows a small marker: this entry has a note. */
		note?: boolean;
	};

	let {
		class: className,
		ref = $bindable(null),
		color,
		own = false,
		note = false,
		children,
		...rest
	}: Props = $props();
</script>

<!-- Text color flips between black and white depending on the lightness of --chip. -->
<span
	bind:this={ref}
	class={cn(
		'relative inline-flex min-h-8 items-center bg-(--chip) px-3 text-xs font-bold motion-safe:animate-chip-in',
		!own && 'opacity-60',
		className
	)}
	style="--chip: {color}; color: oklch(from var(--chip) calc((0.7 - l) * 1000) 0 0)"
	{...rest}
>
	{@render children?.()}
	{#if note}
		<span aria-label="Has a note" class="absolute top-1 right-1 size-1.5 bg-current"></span>
	{/if}
</span>
