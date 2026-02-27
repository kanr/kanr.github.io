<script>
  let progress = $state(0);

  $effect(() => {
    const article = document.querySelector('article');

    function update() {
      const scrollTop = window.scrollY;
      const articleTop = article?.offsetTop ?? 0;
      const docHeight = (article?.offsetHeight ?? document.body.scrollHeight) - window.innerHeight;
      const scrolled = scrollTop - articleTop;
      progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrolled / docHeight) * 100)) : 0;
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => window.removeEventListener('scroll', update);
  });
</script>

<div class="progress-bar" style="width: {progress}%"></div>

<style>
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: var(--accent-gradient);
    z-index: 1000;
    transition: width 0.1s linear;
    pointer-events: none;
  }
</style>
