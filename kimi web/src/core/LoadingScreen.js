/**
 * LoadingScreen — 3D rolling K + progress bar + counter (0 to 999)
 */

export class LoadingScreen {
  constructor() {
    this.el = document.getElementById('loading-screen');
    this.bar = document.getElementById('loading-bar');
    this.counter = document.getElementById('loading-counter');
    this.currentValue = 0;
  }

  updateProgress(pct) {
    if (this.bar) this.bar.style.width = `${pct}%`;
    if (this.counter) {
      // Map percentage to 0-999 range
      const target = Math.round((pct / 100) * 999);
      // Animate from current to target
      this.animateTo(target);
    }
  }

  animateTo(target) {
    const step = () => {
      if (this.currentValue < target) {
        this.currentValue++;
        this.counter.textContent = String(this.currentValue).padStart(3, '0');
        requestAnimationFrame(step);
      }
    };
    step();
  }

  hide() {
    if (!this.el) return;
    this.el.classList.add('hidden');
    setTimeout(() => { this.el.style.display = 'none'; }, 800);
  }
}
