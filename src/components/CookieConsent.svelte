<script>
  let visible = $state(false);

  $effect(() => {
    if (!localStorage.getItem('cookie-consent')) {
      visible = true;
    }
  });

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted');
    visible = false;
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined');
    visible = false;
    // Disable Google Analytics when consent is declined
    window['ga-disable-G-BQHKMX135L'] = true;
  }
</script>

{#if visible}
  <div class="cookie-banner" role="dialog" aria-label="Cookie consent">
    <p>
      This site uses cookies for analytics and advertising.
      See our <a href="/privacy">privacy policy</a> for details.
    </p>
    <div class="cookie-actions">
      <button class="cookie-btn decline" onclick={decline}>Decline</button>
      <button class="cookie-btn accept" onclick={accept}>Accept</button>
    </div>
  </div>
{/if}

<style>
  .cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    z-index: 1000;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
  }

  .cookie-banner p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .cookie-banner a {
    color: rgb(var(--accent));
    text-decoration: none;
  }

  .cookie-banner a:hover {
    text-decoration: underline;
  }

  .cookie-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .cookie-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s;
  }

  .cookie-btn:hover {
    opacity: 0.85;
  }

  .cookie-btn.accept {
    background: rgb(var(--accent));
    color: white;
  }

  .cookie-btn.decline {
    background: var(--border-color);
    color: var(--text-primary);
  }

  @media (max-width: 640px) {
    .cookie-banner {
      flex-direction: column;
      gap: 0.75rem;
      text-align: center;
    }
  }
</style>
