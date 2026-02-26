<script lang="ts">
  interface Post {
    slug: string;
    url: string;
    title: string;
    description: string;
    pubDate: string;
    tags?: string[];
  }

  let { posts }: { posts: Post[] } = $props();

  let query = $state('');
  let activeTag = $state('');

  const allTags = $derived(
    [...new Set(posts.flatMap((p) => p.tags ?? []))].sort()
  );

  const filteredPosts = $derived(
    posts.filter((post) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q);
      const matchesTag = !activeTag || (post.tags ?? []).includes(activeTag);
      return matchesQuery && matchesTag;
    })
  );

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<div class="search-section">
  <div class="search-bar">
    <svg
      class="search-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
    <input
      type="search"
      placeholder="Search posts…"
      bind:value={query}
      aria-label="Search blog posts"
    />
    {#if query}
      <button class="clear-btn" onclick={() => (query = '')} aria-label="Clear search">✕</button>
    {/if}
  </div>

  {#if allTags.length > 0}
    <div class="tag-filters" role="group" aria-label="Filter by tag">
      <button
        class="tag-btn"
        class:active={activeTag === ''}
        onclick={() => (activeTag = '')}
      >All</button>
      {#each allTags as tag}
        <button
          class="tag-btn"
          class:active={activeTag === tag}
          onclick={() => (activeTag = activeTag === tag ? '' : tag)}
        >{tag}</button>
      {/each}
    </div>
  {/if}
</div>

{#if filteredPosts.length === 0}
  <p class="no-results">
    No posts found{query ? ` for "${query}"` : ''}{activeTag ? ` tagged "${activeTag}"` : ''}.
  </p>
{:else}
  <p class="result-count" aria-live="polite">
    {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
    {query || activeTag ? 'found' : ''}
  </p>
  <div class="posts-grid">
    {#each filteredPosts as post (post.slug)}
      <a href={post.url} class="post-card-link">
        <article class="card">
          <h2>{post.title}</h2>
          <p class="post-description">{post.description}</p>
          <div class="post-footer">
            <span class="post-date">{formatDate(post.pubDate)}</span>
            {#if post.tags && post.tags.length > 0}
              <div class="post-tags">
                {#each post.tags.slice(0, 2) as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>
        </article>
      </a>
    {/each}
  </div>
{/if}

<style>
  .search-section {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .search-bar {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 0.85rem;
    color: var(--text-secondary);
    pointer-events: none;
  }

  input[type='search'] {
    width: 100%;
    padding: 0.65rem 2.5rem 0.65rem 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
  }

  input[type='search']:focus {
    border-color: rgb(var(--accent));
    box-shadow: 0 0 0 3px rgba(var(--accent), 0.15);
  }

  input[type='search']::-webkit-search-cancel-button {
    display: none;
  }

  .clear-btn {
    position: absolute;
    right: 0.7rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .clear-btn:hover {
    color: var(--text-primary);
  }

  .tag-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag-btn {
    padding: 0.3rem 0.85rem;
    border-radius: 20px;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .tag-btn:hover {
    border-color: rgb(var(--accent));
    color: rgb(var(--accent));
  }

  .tag-btn.active {
    background: rgba(var(--accent), 0.1);
    border-color: rgb(var(--accent));
    color: rgb(var(--accent));
  }

  .result-count {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0 0 1rem;
  }

  .no-results {
    text-align: center;
    color: var(--text-secondary);
    padding: 3rem 1rem;
    font-size: 1.1rem;
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .post-card-link {
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;
    display: block;
  }

  .post-card-link:hover {
    transform: translateY(-4px);
    text-decoration: none;
  }

  .card {
    height: 100%;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s;
  }

  .post-card-link:hover .card {
    box-shadow: var(--shadow-lg);
  }

  .card h2 {
    font-size: 1.15rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .post-description {
    flex-grow: 1;
    color: var(--text-secondary);
    margin-bottom: 1rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }

  .post-date {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .post-tags {
    display: flex;
    gap: 0.4rem;
  }

  .tag {
    display: inline-block;
    background: rgba(var(--accent), 0.1);
    color: rgb(var(--accent));
    padding: 0.15rem 0.55rem;
    border-radius: 12px;
    font-size: 0.72rem;
    font-weight: 500;
  }
</style>
