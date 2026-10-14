<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import ChevronDownIcon from '~icons/line-md/chevron-small-down';
	import ConfirmIcon from '~icons/line-md/confirm';
	import { cn } from '#lib/utils.js';

	type Item = { value: string; label: string };

	let {
		class: className,
		items,
		value = $bindable(''),
		name,
		placeholder = 'Select…',
		disabled,
		...rest
	}: {
		class?: string;
		items: Item[];
		value?: string;
		name?: string;
		placeholder?: string;
		disabled?: boolean;
		'aria-label'?: string;
		'aria-labelledby'?: string;
	} = $props();

	let label = $derived(items.find((i) => i.value === value)?.label);
</script>

<SelectPrimitive.Root type="single" bind:value {items} {name} {disabled}>
	<SelectPrimitive.Trigger
		class={cn(
			'flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border border-foreground bg-background px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40',
			className
		)}
		{...rest}
	>
		<span class={cn('truncate', !label && 'text-muted-foreground')}>{label ?? placeholder}</span>
		<ChevronDownIcon aria-hidden="true" class="shrink-0" />
	</SelectPrimitive.Trigger>
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			sideOffset={4}
			class="z-50 max-h-72 w-(--bits-select-anchor-width) min-w-48 overflow-y-auto border border-foreground bg-popover text-popover-foreground shadow-hard"
		>
			<SelectPrimitive.Viewport>
				{#each items as item (item.value)}
					<SelectPrimitive.Item
						value={item.value}
						label={item.label}
						class="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 text-sm data-highlighted:underline data-highlighted:underline-offset-4"
					>
						{#snippet children({ selected })}
							<span class="truncate">{item.label}</span>
							{#if selected}
								<ConfirmIcon aria-hidden="true" class="shrink-0" />
							{/if}
						{/snippet}
					</SelectPrimitive.Item>
				{/each}
			</SelectPrimitive.Viewport>
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
</SelectPrimitive.Root>
