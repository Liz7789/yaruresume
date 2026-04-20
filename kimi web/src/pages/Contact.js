/**
 * Contact — Conversational form (4 steps)
 */

export class Contact {
  constructor() {
    this.step = 0;
    this.data = {};
    this.init();
  }

  init() {
    const container = document.getElementById('contact-form');
    if (!container) return;

    // Next buttons
    container.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => this.next());
    });

    // Prev buttons
    container.querySelectorAll('[data-prev]').forEach(btn => {
      btn.addEventListener('click', () => this.prev());
    });

    // Submit
    document.getElementById('form-submit')?.addEventListener('click', () => this.submit());

    // Enter key on inputs
    ['form-name', 'form-purpose', 'form-email'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.next();
      });
    });
  }

  onEnter() {
    this.step = 0;
    this.data = {};
    this.showStep(0);

    // Clear inputs
    ['form-name', 'form-purpose', 'form-message', 'form-email'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  showStep(n) {
    document.querySelectorAll('.form-step').forEach((s, i) => {
      s.classList.toggle('active', i === n);
    });
  }

  next() {
    // Save current step data
    const inputs = {
      0: 'form-name',
      1: 'form-purpose',
      2: 'form-message',
      3: 'form-email'
    };
    const inputId = inputs[this.step];
    if (inputId) {
      const val = document.getElementById(inputId)?.value.trim();
      if (!val && this.step < 3) return; // Don't allow empty except optional
      this.data[inputId] = val;
    }

    if (this.step < 4) {
      this.step++;
      this.showStep(this.step);
    }
  }

  prev() {
    if (this.step > 0) {
      this.step--;
      this.showStep(this.step);
    }
  }

  submit() {
    const email = document.getElementById('form-email')?.value.trim();
    if (!email) return;
    this.data['form-email'] = email;

    // Show success
    this.step = 4;
    this.showStep(4);

    // Log the data (in real app, send to server)
    console.log('Contact form submitted:', this.data);
  }
}
