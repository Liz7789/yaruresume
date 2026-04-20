/**
 * Playground — Taichi particle, Tarot cards, Draggable notes
 */

const TAROT_DECK = [
  { name: '观 · The Observer', meaning: 'Observe without judgment, clarity emerges' },
  { name: '生 · The Seed', meaning: 'New beginnings, potential, growth' },
  { name: '化 · The Flux', meaning: 'Change is the only constant, embrace transformation' },
  { name: '衡 · The Balance', meaning: 'Equilibrium, moderation, centeredness' },
  { name: '游 · The Player', meaning: 'Approach life as a game, enjoy the journey' },
  { name: '直 · The Instinct', meaning: 'Trust your gut, act on intuition' },
  { name: '简 · The Essence', meaning: 'Strip away the unnecessary, find the core' },
  { name: '连 · The Link', meaning: 'Connection, network, relationships' }
];

export class Playground {
  constructor() {
    this.dealt = [];
    this.init();
  }

  init() {
    this.setupTaichi();
    this.setupTarot();
    this.setupNotes();
  }

  onEnter() {
    // Reset tarot
    document.querySelectorAll('.tarot-card').forEach(card => {
      card.classList.remove('flipped');
    });
    document.querySelectorAll('.tarot-name').forEach(el => el.textContent = '?');
    document.querySelectorAll('.tarot-meaning').forEach(el => el.textContent = 'Click to reveal');
    this.dealt = [];
  }

  setupTaichi() {
    const canvas = document.getElementById('taichi-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const cx = W / 2;
    const cy = H / 2;

    let time = 0;
    const particles = [];
    const count = 200;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 100;
      particles.push({
        angle, r,
        speed: 0.002 + Math.random() * 0.005,
        size: 1 + Math.random() * 2,
        isYin: i < count / 2
      });
    }

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, W, H);

      // Draw yin-yang base circle
      ctx.beginPath();
      ctx.arc(cx, cy, 130, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // S-curve divider
      ctx.beginPath();
      ctx.arc(cx, cy - 65, 65, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(cx, cy + 65, 65, Math.PI * 1.5, Math.PI * 0.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.stroke();

      // Small dots
      ctx.beginPath();
      ctx.arc(cx, cy - 65, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100,150,255,0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy + 65, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,200,100,0.3)';
      ctx.fill();

      // Particles
      particles.forEach(p => {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.r;
        const y = cy + Math.sin(p.angle + time * 0.5) * (p.r * 0.3);

        const color = p.isYin
          ? `rgba(150,180,255,${0.3 + Math.sin(time * 2) * 0.1})`
          : `rgba(255,200,120,${0.3 + Math.sin(time * 2 + 1) * 0.1})`;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Yin-Yang labels
      ctx.font = '300 10px Inter';
      ctx.fillStyle = 'rgba(150,180,255,0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('YIN', cx - 90, cy - 20);
      ctx.fillStyle = 'rgba(255,200,120,0.4)';
      ctx.fillText('YANG', cx + 90, cy + 30);

      requestAnimationFrame(animate);
    };
    animate();
  }

  setupTarot() {
    const cards = document.querySelectorAll('.tarot-card');
    cards.forEach(card => {
      card.addEventListener('click', () => this.flipCard(card));
    });
  }

  flipCard(card) {
    if (card.classList.contains('flipped')) return;

    const slot = parseInt(card.dataset.slot);

    // Deal a random unique card
    const available = TAROT_DECK.filter((_, i) => !this.dealt.includes(i));
    if (available.length === 0) {
      // Reset if all dealt
      this.dealt = [];
    }

    const deckIdx = Math.floor(Math.random() * available.length);
    const cardData = available[deckIdx];
    const actualIdx = TAROT_DECK.indexOf(cardData);
    this.dealt.push(actualIdx);

    // Update front face
    document.getElementById(`tarot-name-${slot}`).textContent = cardData.name;
    document.getElementById(`tarot-meaning-${slot}`).textContent = cardData.meaning;

    // Flip animation
    card.classList.add('flipped');

    // Particle burst effect (CSS-based)
    this.createBurst(card);
  }

  createBurst(card) {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      const angle = (i / 12) * Math.PI * 2;
      const color = ['#d4a853', '#6B8CFF', '#4ECDC4', '#FF6B6B'][i % 4];
      particle.style.cssText = `
        position: fixed; left: ${cx}px; top: ${cy}px;
        width: 4px; height: 4px; background: ${color}; border-radius: 50%;
        pointer-events: none; z-index: 1000;
        animation: tarotBurst 0.8s ease-out forwards;
        --burst-angle: ${angle}rad;
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }

    // Add keyframe if not exists
    if (!document.getElementById('tarot-burst-style')) {
      const style = document.createElement('style');
      style.id = 'tarot-burst-style';
      style.textContent = `
        @keyframes tarotBurst {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(calc(cos(var(--burst-angle)) * 80px), calc(sin(var(--burst-angle)) * 80px)) scale(0); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupNotes() {
    const container = document.getElementById('notes-container');
    if (!container) return;

    const notes = container.querySelectorAll('.note');

    notes.forEach(note => {
      let isDragging = false;
      let startX, startY, initLeft, initTop;

      note.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initLeft = note.offsetLeft;
        initTop = note.offsetTop;
        note.style.zIndex = '100';
        note.style.cursor = 'grabbing';
        e.preventDefault();
      });

      document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        note.style.left = `${initLeft + dx}px`;
        note.style.top = `${initTop + dy}px`;

        // Check proximity to other notes
        this.checkNoteGlow(notes);
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          note.style.zIndex = '';
          note.style.cursor = 'grab';
        }
      });
    });
  }

  checkNoteGlow(notes) {
    notes.forEach(note => {
      let near = false;
      notes.forEach(other => {
        if (note === other) return;
        const dx = note.offsetLeft - other.offsetLeft;
        const dy = note.offsetTop - other.offsetTop;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) near = true;
      });
      if (near) note.classList.add('glow');
      else note.classList.remove('glow');
    });
  }
}
