<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border-2 font-mono text-sm font-bold whitespace-nowrap uppercase motion-safe:transition-colors motion-safe:duration-100 disabled:pointer-events-none disabled:opacity-40',
		variants: {
			variant: {
				default:
					'border-foreground bg-foreground text-background hover:bg-background hover:text-foreground',
				outline:
					'border-foreground bg-background text-foreground hover:bg-foreground hover:text-background',
				destructive:
					'border-destructive bg-destructive text-background hover:bg-background hover:text-destructive'
			},
			size: {
				default: 'min-h-11 px-4',
				sm: 'min-h-9 px-3 text-xs',
				icon: 'size-11'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	type Props = HTMLButtonAttributes &
		HTMLAnchorAttributes & {
			ref?: HTMLElement | null;
			variant?: ButtonVariant;
			size?: ButtonSize;
		};

	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		...rest
	}: Props = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		{...rest}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...rest}
	>
		{@render children?.()}
	</button>
{/if}
