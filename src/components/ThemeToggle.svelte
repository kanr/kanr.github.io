<script lang="ts">
  let theme = $state('light');

  $effect(() => {
    // Read from what the inline script already set to avoid flash
    theme = document.documentElement.getAttribute('data-theme') ?? 'light';

    // Keep in sync if another tab changes the theme
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        theme = e.newValue;
        document.documentElement.setAttribute('data-theme', e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  });

  function toggle() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  const isDark = $derived(theme === 'dark');
</script>

<button
  class="theme-toggle"
  onclick={toggle}
  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if isDark}
    <!-- Sun icon – shown in dark mode to switch to light -->
    <svg
      class="icon"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  {:else}
    <!-- Moon icon – shown in light mode to switch to dark -->
    <svg
      class="icon"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 6px;
    transition: background-color 0.2s, color 0.2s;
    line-height: 0;
  }

  .theme-toggle:hover {
    background: var(--border-color);
  }

  .icon {
    display: block;
    transition: transform 0.3s ease;
  }

  .theme-toggle:hover .icon {
    transform: rotate(20deg) scale(1.1);
  }
</style>
