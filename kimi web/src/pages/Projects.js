/**
 * Projects — Lusion 1:1 stacked list with vertical letter columns
 */

export class Projects {
  onEnter() {
    this.renderVerticalNames();
    this.animateEntrance();
    this.startCounter();
  }

  renderVerticalNames() {
    document.querySelectorAll('.project-name-display').forEach(el => {
      const name = el.dataset.name;
      if (!name) return;

      el.innerHTML = '';
      const words = name.split(' ');

      words.forEach((word, wi) => {
        const col = document.createElement('span');
        col.className = 'project-letter-col';

        word.split('').forEach((char, ci) => {
          const span = document.createElement('span');
          span.textContent = char;
          span.style.transitionDelay = `${ci * 0.02}s`;
          col.appendChild(span);
        });

        el.appendChild(col);

        // Add space between words (except last)
        if (wi < words.length - 1) {
          const space = document.createElement('span');
          space.innerHTML = '&nbsp;&nbsp;&nbsp;';
          space.style.display = 'inline-block';
          space.style.width = '20px';
          el.appendChild(space);
        }
      });
    });
  }

  animateEntrance() {
    const items = document.querySelectorAll('.project-item');
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(40px)';
      setTimeout(() => {
        item.style.transition = 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 200 + i * 120);
    });
  }

  startCounter() {
    const counter = document.getElementById('projects-counter-bottom');
    if (!counter) return;
    counter.classList.remove('hidden');

    let count = 0;
    const target = 100;
    const tick = () => {
      if (count < target) {
        count++;
        counter.textContent = String(count).padStart(3, '0');
        setTimeout(tick, 20);
      }
    };
    tick();
  }
}
