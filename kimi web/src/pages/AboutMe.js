/**
 * AboutMe — Trait cards, timeline, skill constellation, creed
 */

export class AboutMe {
  constructor() {
    this.creedObserver = null;
    this.timelineObserver = null;
    this.skillsInit = false;
  }

  onEnter() {
    this.setupTimeline();
    this.setupCreed();
    if (!this.skillsInit) {
      this.skillsInit = true;
      setTimeout(() => this.setupSkills(), 100);
    }
  }

  setupTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    items.forEach(item => item.classList.remove('visible'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });

    items.forEach((item, i) => {
      setTimeout(() => observer.observe(item), i * 100);
    });
  }

  setupCreed() {
    const creedText = document.getElementById('creed-text');
    if (!creedText) return;

    const chars = creedText.querySelectorAll('.creed-char');
    chars.forEach(c => c.classList.remove('lit'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.lightCreed(chars);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(creedText);
  }

  lightCreed(chars) {
    chars.forEach((char, i) => {
      setTimeout(() => {
        char.classList.add('lit');
      }, i * 120);
    });
  }

  setupSkills() {
    const canvas = document.getElementById('skills-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    // 4 skill clusters
    const clusters = [
      { name: 'AI Tools', x: W * 0.2, y: H * 0.3, color: '#6B8CFF', nodes: ['ChatGPT', 'Claude', 'Cursor', 'Gemini', 'Midjourney', 'Copilot'] },
      { name: 'Product', x: W * 0.8, y: H * 0.3, color: '#4ECDC4', nodes: ['Figma', 'Notion', 'Linear', 'Mixpanel', 'Amplitude', 'Jira'] },
      { name: 'Data', x: W * 0.25, y: H * 0.75, color: '#FFE66D', nodes: ['Python', 'SQL', 'Tableau', 'Pandas', 'NumPy', 'Spark'] },
      { name: 'Content', x: W * 0.75, y: H * 0.75, color: '#FF6B6B', nodes: ['Copywriting', 'Video', 'Social', 'SEO', 'Brand', 'Design'] }
    ];

    // Create particles for each cluster
    const particles = [];
    clusters.forEach(cluster => {
      cluster.nodes.forEach((node, i) => {
        const angle = (i / cluster.nodes.length) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 30 + Math.random() * 40;
        particles.push({
          x: cluster.x + Math.cos(angle) * dist,
          y: cluster.y + Math.sin(angle) * dist,
          vx: 0, vy: 0,
          targetX: cluster.x + Math.cos(angle) * dist,
          targetY: cluster.y + Math.sin(angle) * dist,
          label: node,
          color: cluster.color,
          cluster: cluster.name,
          size: 3 + Math.random() * 3
        });
      });
    });

    let mouse = { x: -1000, y: -1000 };
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

    let time = 0;
    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, W, H);

      // Draw connections between clusters
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          ctx.beginPath();
          ctx.moveTo(clusters[i].x, clusters[i].y);
          ctx.lineTo(clusters[j].x, clusters[j].y);
          ctx.stroke();
        }
      }

      // Draw cluster centers
      clusters.forEach(c => {
        const pulse = Math.sin(time * 2) * 3;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 6 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();

        ctx.font = '600 11px Inter';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(c.name.toUpperCase(), c.x, c.y - 15);
      });

      // Update and draw particles
      particles.forEach(p => {
        // Gentle float
        p.targetX += Math.sin(time + p.label.length) * 0.2;
        p.targetY += Math.cos(time + p.label.length) * 0.2;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60 && dist > 1) {
          const force = (60 - dist) / 60;
          p.vx += (dx / dist) * force * 2;
          p.vy += (dy / dist) * force * 2;
        }

        // Spring back to target
        p.vx += (p.targetX - p.x) * 0.03;
        p.vy += (p.targetY - p.y) * 0.03;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;

        // Glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, p.color + '60');
        grad.addColorStop(1, p.color + '00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Label
        ctx.font = '300 10px Inter';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, p.x, p.y + p.size + 12);

        // Connect to cluster center
        ctx.strokeStyle = p.color + '30';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        const cluster = clusters.find(c => c.name === p.cluster);
        ctx.lineTo(cluster.x, cluster.y);
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };
    animate();
  }
}
