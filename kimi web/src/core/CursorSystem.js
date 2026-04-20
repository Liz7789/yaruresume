/**
 * CursorSystem — Ultra-low-latency cursor (0.02s response)
 * Glass comet trail follows the cursor, not ahead of it
 */

export class CursorSystem {
  constructor() {
    this.el = document.getElementById('custom-cursor');
    if (!this.el) return;
    
    if (window.matchMedia('(pointer: coarse)').matches) {
      this.el.style.display = 'none';
      return;
    }
    
    this.pos = { x: -200, y: -200 };
    this.target = { x: -200, y: -200 };
    
    // lerp factor for ~0.02s visual lag at 60fps
    // 0.02s * 60fps = 1.2 frames of lag → lerp ~0.7
    this.lerpFactor = 0.72;
    
    document.addEventListener('mousemove', e => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
    });
    document.addEventListener('mouseleave', () => { this.el.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { this.el.style.opacity = '1'; });
    
    const hoverables = 'a, button, [role="button"], .nav-btn, .menu-item, .hero-cta, .hero-avatar-wrap';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverables)) this.el.classList.add('hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverables)) this.el.classList.remove('hover');
    });
    
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.pos.x += (this.target.x - this.pos.x) * this.lerpFactor;
    this.pos.y += (this.target.y - this.pos.y) * this.lerpFactor;
    this.el.style.left = `${this.pos.x}px`;
    this.el.style.top = `${this.pos.y}px`;
  }
}
