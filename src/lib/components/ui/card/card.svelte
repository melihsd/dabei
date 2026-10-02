<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	type Props = HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLElement | null;
		shadow?: boolean;
	};

	let {
		class: className,
		ref = $bindable(null),
		shadow = false,
		children,
		...rest
	}: Props = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		'border border-foreground bg-card text-card-foreground',
		shadow && 'shadow-hard',
		className
	)}
	{...rest}
>
	{@render children?.()}
</div>
