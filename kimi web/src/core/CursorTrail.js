/**
 * CursorTrail — Lusion-style continuous glass light beam
 * NOT scattered dots — one smooth glowing line from tail to head
 * Head: bright glow orb | Tail: thin fading light streak
 * Chromatic dispersion for glass prism feel
 */

export class CursorTrail {
  constructor() {
    this.canvas = document.getElementById('cursor-trail-canvas');
    if (!this.canvas) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    // Trail history
    this.points = [];
    this.maxPoints = 30;
    this.mouse = { x: -200, y: -200 };
    this.distAccum = 0;
    
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      // Add point based on distance, not every frame
      this.distAccum += 1;
      if (this.distAccum >= 2) {
        this.addPoint(e.clientX, e.clientY);
        this.distAccum = 0;
      }
    });
    window.addEventListener('resize', () => this.resize());
    
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  addPoint(x, y) {
    this.points.push({ x, y, age: 0 });
    if (this.points.length > this.maxPoints) this.points.shift();
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Always add current mouse position for live head
    if (this.mouse.x > 0) {
      this.addPoint(this.mouse.x, this.mouse.y);
    }
    
    // Age and clean
    for (const p of this.points) p.age++;
    while (this.points.length > 0 && this.points[0].age > this.maxPoints) {
      this.points.shift();
    }
    if (this.points.length < 3) return;
    
    const len = this.points.length;
    const head = this.points[len - 1];
    
    // === LAYER 1: Wide soft glow (outer light bloom) ===
    this.drawLightLayer(12, 0.12, 8, true);
    
    // === LAYER 2: Medium glow body ===
    this.drawLightLayer(5, 0.22, 4, false);
    
    // === LAYER 3: Sharp bright core line ===
    this.drawLightLayer(2, 0.45, 2, false);
    
    // === LAYER 4: Ultra-sharp center ===
    this.drawLightLayer(0.8, 0.7, 1, false);
    
    // === HEAD: Bright glow orb at cursor position ===
    // Outer soft halo
    const halo = this.ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 35);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    halo.addColorStop(0.2, 'rgba(255, 255, 255, 0.08)');
    halo.addColorStop(0.5, 'rgba(240, 248, 255, 0.03)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.beginPath();
    this.ctx.arc(head.x, head.y, 35, 0, Math.PI * 2);
    this.ctx.fillStyle = halo;
    this.ctx.fill();
    
    // Inner bright orb (glass bead)
    const orb = this.ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 12);
    orb.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    orb.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
    orb.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.beginPath();
    this.ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
    this.ctx.fillStyle = orb;
    this.ctx.fill();
    
    // === CHROMATIC DISPERSION: glass prism color split ===
    this.ctx.globalCompositeOperation = 'screen';
    
    // Warm edge (slight orange shift)
    this.drawDispersionLine(2, 'rgba(255, 210, 170, 0.18)', 1.5);
    // Cool edge (slight cyan shift)
    this.drawDispersionLine(-2, 'rgba(170, 220, 255, 0.18)', -1.5);
    
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  /**
   * Draw the light beam as one continuous line
   * Width and alpha vary from tail (thin/dim) to head (thick/bright)
   */
  drawLightLayer(baseWidth, baseAlpha, glowBlur, isOuter) {
    const len = this.points.length;
    if (len < 2) return;
    
    this.ctx.save();
    if (isOuter) {
      this.ctx.filter = `blur(${glowBlur}px)`;
    } else if (glowBlur > 1) {
      this.ctx.filter = `blur(${glowBlur}px)`;
    }
    
    // Draw as connected segments so each can have different width
    for (let i = 1; i < len; i++) {
      const p0 = this.points[i - 1];
      const p1 = this.points[i];
      
      // t goes from 0 (tail) to 1 (head)
      const t = i / (len - 1);
      
      // Width: very thin at tail, thick at head
      const w = baseWidth * (0.1 + t * t * 0.9);
      // Alpha: dim at tail, bright at head
      const a = baseAlpha * (0.05 + t * t * 0.95);
      
      this.ctx.beginPath();
      this.ctx.moveTo(p0.x, p0.y);
      this.ctx.lineTo(p1.x, p1.y);
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
      this.ctx.lineWidth = w;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Chromatic dispersion: offset the light line slightly
   * for warm/cool color splitting (glass prism effect)
   */
  drawDispersionLine(offsetX, colorStr, offsetY) {
    const len = this.points.length;
    if (len < 2) return;
    
    this.ctx.save();
    this.ctx.filter = 'blur(2px)';
    
    for (let i = 2; i < len; i++) {
      const p0 = this.points[i - 1];
      const p1 = this.points[i];
      const t = i / (len - 1);
      const a = parseFloat(colorStr.match(/[\d.]+\)/)[0]) * t * t;
      
      this.ctx.beginPath();
      this.ctx.moveTo(p0.x + offsetX * t, p0.y + offsetY * t);
      this.ctx.lineTo(p1.x + offsetX * t, p1.y + offsetY * t);
      // Reconstruct color with dynamic alpha
      const col = colorStr.replace(/[\d.]+\)/, `${a})`);
      this.ctx.strokeStyle = col;
      this.ctx.lineWidth = 3 * t;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
}
