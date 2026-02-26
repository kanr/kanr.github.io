<script lang="ts">
  interface Skill {
    name: string;
    level: number; // 0–100
  }

  interface SkillCategory {
    category: string;
    emoji: string;
    skills: Skill[];
  }

  let { categories }: { categories: SkillCategory[] } = $props();

  let visible = $state(false);

  $effect(() => {
    // Small delay so the bar animation plays after mount
    const id = setTimeout(() => (visible = true), 80);
    return () => clearTimeout(id);
  });
</script>

<div class="skill-bars">
  {#each categories as cat}
    <div class="category">
      <h3>{cat.emoji} {cat.category}</h3>
      <ul>
        {#each cat.skills as skill}
          <li>
            <div class="skill-header">
              <span class="skill-name">{skill.name}</span>
              <span class="skill-pct">{skill.level}%</span>
            </div>
            <div class="track" role="progressbar" aria-valuenow={skill.level} aria-valuemin={0} aria-valuemax={100} aria-label="{skill.name} proficiency">
              <div
                class="fill"
                style="width: {visible ? skill.level : 0}%"
              ></div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>

<style>
  .skill-bars {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 2rem;
  }

  .category {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
  }

  h3 {
    font-size: 1rem;
    color: rgb(var(--accent));
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 1.25rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .skill-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.35rem;
  }

  .skill-name {
    font-size: 0.92rem;
    color: var(--text-primary);
    font-weight: 500;
  }

  .skill-pct {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .track {
    width: 100%;
    height: 8px;
    background: var(--border-color);
    border-radius: 999px;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background: linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-light)));
    border-radius: 999px;
    transition: width 0.9s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
