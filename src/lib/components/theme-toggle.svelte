<script lang="ts">
	import { onMount } from 'svelte';

	let dark = $state(false);

	onMount(() => {
		dark = document.documentElement.classList.contains('dark');
	});

	function toggle() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {
			// storage unavailable: the choice just won't persist
		}
	}
</script>

<button
	type="button"
	onclick={toggle}
	aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
	class="flex size-7 cursor-pointer items-center justify-center border border-foreground text-sm hover:bg-foreground hover:text-background"
>
	{dark ? '☀' : '☾'}
</button>
