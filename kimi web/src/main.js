import { LoadingScreen } from './core/LoadingScreen.js';
import { ThreeEngine } from './core/ThreeEngine.js';
import { CursorTrail } from './core/CursorTrail.js';
import { CursorSystem } from './core/CursorSystem.js';
import { AudioSystem } from './core/AudioSystem.js';
import { MenuSystem } from './core/MenuSystem.js';
import { Home } from './pages/Home.js';
import { AboutMe } from './pages/AboutMe.js';
import { Playground } from './pages/Playground.js';
import { Projects } from './pages/Projects.js';
import { Contact } from './pages/Contact.js';

class App {
  constructor() {
    this.currentPage = 'home';
    this.pages = {};
    this.init();
  }

  async init() {
    this.loading = new LoadingScreen();
    this.engine = new ThreeEngine();
    this.trail = new CursorTrail();
    this.cursor = new CursorSystem();
    this.audio = new AudioSystem();
    this.menu = new MenuSystem(this);

    // Init pages
    this.pages.home = new Home();
    this.pages.about = new AboutMe();
    this.pages.projects = new Projects();
    this.pages.playground = new Playground();
    this.pages.contact = new Contact();

    // Setup navigation
    this.setupNavigation();

    // Simulate loading
    await this.simulateLoad();
    this.onLoaded();
  }

  async simulateLoad() {
    for (let i = 0; i <= 20; i++) {
      this.loading.updateProgress(Math.round((i / 20) * 100));
      await new Promise(r => setTimeout(r, 60 + Math.random() * 100));
    }
  }

  onLoaded() {
    this.loading.hide();
    setTimeout(() => this.pages.home.playEntrance(), 350);
    setTimeout(() => {
      document.getElementById('scroll-hint')?.classList.add('visible');
      document.getElementById('hero-counter')?.classList.add('visible');
      document.querySelector('.playground-btn')?.classList.add('visible');
    }, 2800);
    this.pages.home.startCounter();
    console.log('Kenna Kai universe loaded');
  }

  setupNavigation() {
    // Menu items
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateTo(page);
        this.menu.close();
      });
    });

    // Logo click
    document.querySelector('.nav-logo')?.addEventListener('click', e => {
      e.preventDefault();
      this.navigateTo('home');
    });

    // Data-nav elements
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        this.navigateTo(el.dataset.nav);
      });
    });
  }

  navigateTo(page) {
    if (page === this.currentPage) return;

    // Hide current
    const currentEl = document.querySelector(`#page-${this.currentPage}`);
    if (currentEl) {
      currentEl.classList.remove('active');
    }

    // Show new
    const newEl = document.querySelector(`#page-${page}`);
    if (newEl) {
      newEl.classList.add('active');
      // Scroll to top
      newEl.scrollTop = 0;
    }

    // Page-specific setup
    if (page === 'projects') {
      document.body.style.background = '#f0eef4';
    } else {
      document.body.style.background = '#000';
    }

    // Show/hide projects counter
    const projCounter = document.getElementById('projects-counter-bottom');
    if (projCounter) {
      projCounter.classList.toggle('hidden', page !== 'projects');
    }

    // Trigger page init
    if (this.pages[page]) {
      this.pages[page].onEnter?.();
    }

    this.currentPage = page;

    // Close menu if open
    this.menu.close();
  }
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', () => new App())
  : new App();
