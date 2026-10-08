<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import ChatIcon from '~icons/line-md/chat-round-dots';
	import PersonIcon from '~icons/line-md/person';
	import { cn } from '#lib/utils.js';

	type Props = HTMLAttributes<HTMLSpanElement> & {
		ref?: HTMLElement | null;
		/** Member color, any CSS color (hex from the members table). */
		color: string;
		/** Leading person icon: marks someone else's chip. */
		person?: boolean;
		/** Trailing chat icon: this entry has a note. */
		note?: boolean;
	};

	let {
		class: className,
		ref = $bindable(null),
		color,
		person = false,
		note = false,
		children,
		...rest
	}: Props = $props();
</script>

<!-- Text color flips between black and white depending on the lightness of --chip. -->
<span
	bind:this={ref}
	class={cn(
		'relative inline-flex min-h-8 items-center gap-1.5 bg-(--chip) px-3 text-xs font-bold motion-safe:animate-chip-in',
		className
	)}
	style="--chip: {color}; color: oklch(from var(--chip) calc((0.7 - l) * 1000) 0 0)"
	{...rest}
>
	{#if person}
		<PersonIcon aria-hidden="true" class="size-3.5 shrink-0" />
	{/if}
	{@render children?.()}
	{#if note}
		<ChatIcon aria-label="Has a note" class="size-3.5 shrink-0" />
	{/if}
</span>
