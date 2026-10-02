<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	type Props = HTMLAttributes<HTMLSpanElement> & {
		ref?: HTMLElement | null;
		/** Member color, any CSS color (hex from the members table). */
		color: string;
		/** The current user's own chip: full strength, bigger shadow on hover. */
		own?: boolean;
		/** The chip sits on an inverted (foreground-colored) background. */
		onInverted?: boolean;
	};

	let {
		class: className,
		ref = $bindable(null),
		color,
		own = false,
		onInverted = false,
		children,
		...rest
	}: Props = $props();
</script>

<!-- Text color flips between black and white depending on the lightness of --chip. -->
<span
	bind:this={ref}
	class={cn(
		'inline-flex min-h-20 min-w-20 -rotate-[1.5deg] items-center justify-center bg-(--chip) p-2 text-center font-mono text-xs leading-tight font-bold motion-safe:animate-chip-in motion-safe:transition-shadow motion-safe:duration-150',
		// Soft offset shadow, translucent like the original; own chips grow it on hover.
		onInverted
			? own
				? 'shadow-[2px_2px_0_0_rgba(255,255,255,0.65)] hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.65)]'
				: 'shadow-[2px_2px_0_0_rgba(255,255,255,0.3)]'
			: own
				? 'shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]'
				: 'shadow-[2px_2px_0_0_rgba(0,0,0,0.12)]',
		!own && 'opacity-60',
		className
	)}
	style="--chip: {color}; color: oklch(from var(--chip) calc((0.7 - l) * 1000) 0 0)"
	{...rest}
>
	{@render children?.()}
</span>
