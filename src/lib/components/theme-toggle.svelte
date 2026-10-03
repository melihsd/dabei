<script lang="ts">
	import { onMount } from 'svelte';
	import MoonToSunnyOutlineTransitionIcon from '~icons/line-md/moon-to-sunny-outline-transition';
	import SunnyOutlineToMoonTransitionIcon from '~icons/line-md/sunny-outline-to-moon-transition';

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
	class="flex size-8 cursor-pointer items-center justify-center text-2xl hover:opacity-60 motion-safe:transition-opacity motion-safe:duration-100"
>
	<!-- The icon shows the mode you'd switch to; swapping components replays its morph animation. -->
	{#if dark}
		<MoonToSunnyOutlineTransitionIcon />
	{:else}
		<SunnyOutlineToMoonTransitionIcon />
	{/if}
</button>
