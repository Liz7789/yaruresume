/**
 * AudioSystem — BGM with SVG waveform animation
 * Muted: single horizontal line
 * Playing: 3 animated waveform bars
 */

export class AudioSystem {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.btn = document.getElementById('audio-btn');
    this.svg = document.getElementById('audio-svg');
    this.waveStatic = document.getElementById('wave-static');
    this.wavePaths = this.svg?.querySelectorAll('path');
    
    this.init();
  }

  init() {
    this.sound = new Howl({
      src: ['/audio/piano-bgm.mp3'],
      html5: true, loop: true, volume: 0,
      preload: true
    });
    
    this.btn?.addEventListener('click', () => this.toggle());
    
    // Tab visibility
    document.addEventListener('visibilitychange', () => {
      if (!this.isPlaying) return;
      if (document.hidden) {
        this.sound?.fade(this.sound.volume(), 0, 300);
      } else {
        this.sound?.fade(0, 0.45, 500);
      }
    });
  }

  toggle() {
    if (!this.sound) return;
    
    if (this.isPlaying) {
      this.sound.fade(this.sound.volume(), 0, 800);
      setTimeout(() => this.sound.pause(), 800);
      this.isPlaying = false;
    } else {
      this.sound.play();
      this.sound.fade(0, 0.45, 1000);
      this.isPlaying = true;
    }
    
    this.updateVisual();
  }

  updateVisual() {
    if (!this.svg) return;
    
    if (this.isPlaying) {
      this.btn?.classList.add('playing');
      // Hide static line, show waveform
      if (this.waveStatic) this.waveStatic.style.opacity = '0';
      this.wavePaths?.forEach(p => {
        p.style.opacity = '1';
        p.style.transition = 'opacity 0.3s';
      });
    } else {
      this.btn?.classList.remove('playing');
      // Show static line, hide waveform
      if (this.waveStatic) this.waveStatic.style.opacity = '1';
      this.wavePaths?.forEach(p => {
        p.style.opacity = '0';
        p.style.transition = 'opacity 0.3s';
      });
    }
  }
}
