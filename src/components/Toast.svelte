<script lang="ts">
  interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  }

  let toasts = $state<Toast[]>([]);
  let nextId = 0;

  export function addToast(message: string, type: Toast['type'] = 'info', duration = 4000) {
    const id = ++nextId;
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => dismiss(id), duration);
  }

  function dismiss(id: number) {
    toasts = toasts.filter((t) => t.id !== id);
  }
</script>

{#if toasts.length > 0}
  <div class="toast-container" aria-live="polite" aria-atomic="false">
    {#each toasts as toast (toast.id)}
      <div class="toast toast--{toast.type}" role="alert">
        <span class="toast-icon">
          {#if toast.type === 'success'}✓{:else if toast.type === 'error'}✕{:else}ℹ{/if}
        </span>
        <span class="toast-message">{toast.message}</span>
        <button class="toast-close" onclick={() => dismiss(toast.id)} aria-label="Dismiss">✕</button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 1000;
    max-width: 380px;
    width: calc(100vw - 3rem);
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    border-radius: 10px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-lg);
    animation: slide-in 0.25s ease;
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(1.5rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .toast-icon {
    font-size: 1rem;
    flex-shrink: 0;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .toast--success .toast-icon {
    background: rgba(34, 197, 94, 0.15);
    color: #16a34a;
  }

  .toast--error .toast-icon {
    background: rgba(239, 68, 68, 0.15);
    color: #dc2626;
  }

  .toast--info .toast-icon {
    background: rgba(var(--accent), 0.15);
    color: rgb(var(--accent));
  }

  .toast-message {
    flex: 1;
    line-height: 1.4;
  }

  .toast-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.2rem 0.3rem;
    border-radius: 4px;
    flex-shrink: 0;
    transition: color 0.15s;
    line-height: 1;
  }

  .toast-close:hover {
    color: var(--text-primary);
  }
</style>
