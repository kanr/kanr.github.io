<script lang="ts">
  import Toast from './Toast.svelte';

  // Pass your Formspree endpoint, e.g. "https://formspree.io/f/YOUR_ID"
  let { action = '' }: { action?: string } = $props();

  // Form fields
  let name = $state('');
  let email = $state('');
  let subject = $state('');
  let message = $state('');

  // Track which fields have been blurred
  let touched = $state({ name: false, email: false, subject: false, message: false });

  // Validation
  const errors = $derived({
    name: touched.name && name.trim().length < 2 ? 'Please enter your name.' : '',
    email:
      touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? 'Please enter a valid email address.'
        : '',
    subject: touched.subject && subject.trim().length < 3 ? 'Please enter a subject.' : '',
    message: touched.message && message.trim().length < 10 ? 'Message must be at least 10 characters.' : '',
  });

  const isValid = $derived(
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    subject.trim().length >= 3 &&
    message.trim().length >= 10
  );

  let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Toast ref
  let toastEl: ReturnType<typeof Toast> | undefined = $state();

  function touch(field: keyof typeof touched) {
    touched = { ...touched, [field]: true };
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    // Mark all fields touched for final validation display
    touched = { name: true, email: true, subject: true, message: true };
    if (!isValid) return;

    status = 'submitting';

    try {
      if (!action) {
        // No endpoint configured — simulate success for demo
        await new Promise((r) => setTimeout(r, 800));
        throw new Error('No action URL configured. Set the `action` prop to your form endpoint.');
      }

      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) throw new Error(`Submission failed (${res.status})`);

      status = 'success';
      toastEl?.addToast('Message sent! I\'ll get back to you soon.', 'success');
      name = '';
      email = '';
      subject = '';
      message = '';
      touched = { name: false, email: false, subject: false, message: false };
    } catch (err: unknown) {
      status = 'error';
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toastEl?.addToast(message, 'error');
    } finally {
      if (status !== 'success') status = 'error';
      setTimeout(() => (status = 'idle'), 3000);
    }
  }
</script>

<Toast bind:this={toastEl} />

<section class="contact-form-section">
  <h2>✉️ Send a Message</h2>
  <p class="form-intro">
    Prefer a quick note? Fill out the form below and I'll reply within 24–48 hours.
  </p>

  <form class="form" onsubmit={handleSubmit} novalidate>
    <div class="row">
      <div class="field" class:has-error={!!errors.name}>
        <label for="cf-name">Name</label>
        <input
          id="cf-name"
          type="text"
          placeholder="Your name"
          bind:value={name}
          onblur={() => touch('name')}
          autocomplete="name"
          required
          aria-describedby={errors.name ? 'cf-name-err' : undefined}
        />
        {#if errors.name}
          <span id="cf-name-err" class="error">{errors.name}</span>
        {/if}
      </div>

      <div class="field" class:has-error={!!errors.email}>
        <label for="cf-email">Email</label>
        <input
          id="cf-email"
          type="email"
          placeholder="you@example.com"
          bind:value={email}
          onblur={() => touch('email')}
          autocomplete="email"
          required
          aria-describedby={errors.email ? 'cf-email-err' : undefined}
        />
        {#if errors.email}
          <span id="cf-email-err" class="error">{errors.email}</span>
        {/if}
      </div>
    </div>

    <div class="field" class:has-error={!!errors.subject}>
      <label for="cf-subject">Subject</label>
      <input
        id="cf-subject"
        type="text"
        placeholder="What's this about?"
        bind:value={subject}
        onblur={() => touch('subject')}
        required
        aria-describedby={errors.subject ? 'cf-subject-err' : undefined}
      />
      {#if errors.subject}
        <span id="cf-subject-err" class="error">{errors.subject}</span>
      {/if}
    </div>

    <div class="field" class:has-error={!!errors.message}>
      <label for="cf-message">Message</label>
      <textarea
        id="cf-message"
        rows="5"
        placeholder="Your message…"
        bind:value={message}
        onblur={() => touch('message')}
        required
        aria-describedby={errors.message ? 'cf-message-err' : undefined}
      ></textarea>
      {#if errors.message}
        <span id="cf-message-err" class="error">{errors.message}</span>
      {/if}
    </div>

    <button
      type="submit"
      class="submit-btn"
      disabled={status === 'submitting'}
      aria-busy={status === 'submitting'}
    >
      {#if status === 'submitting'}
        <span class="spinner" aria-hidden="true"></span>
        Sending…
      {:else}
        Send Message
      {/if}
    </button>
  </form>
</section>

<style>
  .contact-form-section {
    margin-top: 3rem;
  }

  h2 {
    font-size: 1.5rem;
    color: rgb(var(--accent-dark));
    margin-bottom: 0.5rem;
  }

  .form-intro {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
    font-size: 0.97rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: var(--shadow-md);
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  @media (max-width: 560px) {
    .row {
      grid-template-columns: 1fr;
    }
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  label {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  input,
  textarea {
    padding: 0.6rem 0.85rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.97rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    resize: vertical;
  }

  input:focus,
  textarea:focus {
    border-color: rgb(var(--accent));
    box-shadow: 0 0 0 3px rgba(var(--accent), 0.15);
  }

  .has-error input,
  .has-error textarea {
    border-color: #ef4444;
  }

  .has-error input:focus,
  .has-error textarea:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  }

  .error {
    font-size: 0.8rem;
    color: #ef4444;
  }

  .submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.7rem 1.75rem;
    border-radius: 8px;
    border: none;
    background: rgb(var(--accent));
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    align-self: flex-start;
  }

  .submit-btn:hover:not(:disabled) {
    background: rgb(var(--accent-dark));
    transform: translateY(-1px);
  }

  .submit-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
