/**
 * Home — Hero section with entrance animations
 */

export class Home {
  constructor() {
    this.title = document.getElementById('hero-title');
    this.subtitle = document.getElementById('hero-subtitle');
    this.avatar = document.getElementById('hero-avatar');
    this.tagline = document.getElementById('hero-tagline');
    this.cta = document.getElementById('hero-cta');
    
    this.texts = [
      'Life Player × Logic Architect',
      'ENTJ Commander × Pisces Intuition',
      'Multi-Agent Orchestrator',
      'Building systems that run themselves'
    ];
    this.idx = 0;
    this.typing = false;
    
    this.splitTitle();
  }

  splitTitle() {
    if (!this.title) return;
    const text = this.title.textContent;
    this.title.innerHTML = '';
    text.split('').forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = c === ' ' ? '\u00A0' : c;
      s.style.transitionDelay = `${i * 0.035}s`;
      this.title.appendChild(s);
    });
  }

  playEntrance() {
    // Title chars rise
    this.title?.querySelectorAll('.char').forEach((c, i) => {
      setTimeout(() => {
        c.style.transform = 'translateY(0)';
        c.style.opacity = '1';
      }, 300 + i * 35);
    });
    
    // Avatar
    if (this.avatar) {
      this.avatar.style.opacity = '0';
      this.avatar.style.transform = 'scale(0.92)';
      this.avatar.style.transition = 'all 1.2s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(() => {
        this.avatar.style.opacity = '1';
        this.avatar.style.transform = 'scale(1)';
      }, 500);
    }
    
    // Tagline
    if (this.tagline) {
      this.tagline.style.opacity = '0';
      this.tagline.style.transform = 'translateY(20px)';
      this.tagline.style.transition = 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s';
      setTimeout(() => {
        this.tagline.style.opacity = '1';
        this.tagline.style.transform = 'translateY(0)';
      }, 1200);
    }
    
    // CTA
    if (this.cta) {
      this.cta.style.opacity = '0';
      this.cta.style.transform = 'translateY(20px)';
      this.cta.style.transition = 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s';
      setTimeout(() => {
        this.cta.style.opacity = '1';
        this.cta.style.transform = 'translateY(0)';
      }, 1600);
    }
    
    // Typewriter
    setTimeout(() => this.startTypewriter(), 2200);
  }

  startTypewriter() {
    this.typewrite(this.texts[0], () => {
      setTimeout(() => this.cycle(), 3000);
    });
  }

  cycle() {
    this.idx = (this.idx + 1) % this.texts.length;
    this.erase(() => {
      setTimeout(() => {
        this.typewrite(this.texts[this.idx], () => {
          setTimeout(() => this.cycle(), 3000);
        });
      }, 200);
    });
  }

  typewrite(text, cb) {
    if (!this.subtitle || this.typing) return;
    this.typing = true;
    this.subtitle.textContent = '';
    this.subtitle.style.borderRight = '2px solid rgba(255,255,255,0.4)';
    
    let i = 0;
    const go = () => {
      if (i < text.length) {
        this.subtitle.textContent += text[i];
        i++;
        setTimeout(go, 55 + Math.random() * 45);
      } else {
        this.typing = false;
        let b = 0;
        const blink = setInterval(() => {
          this.subtitle.style.borderRightColor = 
            b % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.4)';
          b++;
          if (b >= 7) { clearInterval(blink); this.subtitle.style.borderRight = 'none'; cb?.(); }
        }, 380);
      }
    };
    go();
  }

  erase(cb) {
    if (!this.subtitle || this.typing) return;
    this.typing = true;
    const text = this.subtitle.textContent;
    let i = text.length;
    const go = () => {
      if (i > 0) { this.subtitle.textContent = text.slice(0, --i); setTimeout(go, 25); }
      else { this.typing = false; cb?.(); }
    };
    go();
  }
}
