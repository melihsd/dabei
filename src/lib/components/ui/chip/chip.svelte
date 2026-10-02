<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	type Props = HTMLAttributes<HTMLSpanElement> & {
		ref?: HTMLElement | null;
		/** Member color, any CSS color (hex from the members table). */
		color: string;
		/** The current user's own chip: full strength with a hard shadow. */
		own?: boolean;
	};

	let {
		class: className,
		ref = $bindable(null),
		color,
		own = false,
		children,
		...rest
	}: Props = $props();
</script>

<!-- Text color flips between black and white depending on the lightness of --chip. -->
<span
	bind:this={ref}
	class={cn(
		'inline-flex min-h-8 items-center border-2 border-foreground bg-(--chip) px-2 font-mono text-sm font-bold motion-safe:animate-chip-in',
		own ? 'shadow-hard' : 'opacity-75',
		className
	)}
	style="--chip: {color}; color: oklch(from var(--chip) calc((0.7 - l) * 1000) 0 0)"
	{...rest}
>
	{@render children?.()}
</span>
