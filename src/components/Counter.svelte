<script>
  let count = $state(0);
  let message = $derived(
    count === 0 ? 'Click the button to try Svelte!' :
    count < 5 ? 'Keep going...' :
    count < 10 ? "You're getting the hang of it!" :
    '🎉 Svelte reactive state in action!'
  );

  function increment() { count++ }
  function decrement() { count-- }
  function reset() { count = 0 }
</script>

<div class="counter-demo">
  <p class="demo-label">Svelte 5 Interactive Demo</p>
  <p class="message">{message}</p>
  <div class="controls">
    <button onclick={decrement} disabled={count === 0}>−</button>
    <span class="count">{count}</span>
    <button onclick={increment}>+</button>
  </div>
  <button class="reset" onclick={reset} disabled={count === 0}>Reset</button>
</div>

<style>
  .counter-demo {
    border: 1px solid var(--border-color, #e2e8f0);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    margin: 2rem 0;
    background: var(--bg-secondary, #f8fafc);
  }
  .demo-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-secondary, #64748b);
    margin: 0 0 0.75rem;
  }
  .message {
    font-size: 1rem;
    color: var(--text-primary, #1e293b);
    margin: 0 0 1.25rem;
    min-height: 1.5em;
  }
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .count {
    font-size: 2rem;
    font-weight: 700;
    min-width: 3rem;
    display: inline-block;
    color: var(--text-primary, #1e293b);
  }
  button {
    padding: 0.4rem 1rem;
    border-radius: 8px;
    border: 2px solid rgb(59 130 246);
    background: transparent;
    color: rgb(59 130 246);
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  button:hover:not(:disabled) {
    background: rgb(59 130 246);
    color: white;
  }
  button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .reset {
    font-size: 0.85rem;
    padding: 0.3rem 0.9rem;
  }
</style>
