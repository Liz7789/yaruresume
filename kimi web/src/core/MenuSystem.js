/**
 * MenuSystem — Lusion-style white panel overlay
 */

export class MenuSystem {
  constructor(app) {
    this.app = app;
    this.isOpen = false;
    this.overlay = document.getElementById('menu-overlay');
    this.backdrop = document.getElementById('menu-backdrop');
    this.toggle = document.getElementById('menu-toggle');
    this.init();
  }

  init() {
    this.toggle?.addEventListener('click', () => this.toggleMenu());
    this.backdrop?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  toggleMenu() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.overlay?.classList.add('active');
    if (this.toggle) this.toggle.textContent = 'Close';
  }

  close() {
    this.isOpen = false;
    this.overlay?.classList.remove('active');
    if (this.toggle) this.toggle.textContent = 'Menu';
  }
}
