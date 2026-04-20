/**
 * ThreeEngine — Enhanced Particle Background
 * Mouse ATTRACTS particles (not repels) — particles flow toward cursor
 * Stronger connection lines, glowing particles near mouse
 */

export class ThreeEngine {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) return;
    
    this.mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    this.isMobile = window.innerWidth < 768;
    this.count = this.isMobile ? 400 : 1800;
    
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
    this.camera.position.z = 60;
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: false, alpha: true
    });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    
    this.createParticles();
    this.createMouseGlow();
    this.bindEvents();
    this.animate();
  }

  createParticles() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.count * 3);
    const col = new Float32Array(this.count * 3);
    const size = new Float32Array(this.count);
    const vel = new Float32Array(this.count * 3);
    
    const spread = 100;
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * spread;
      pos[i3+1] = (Math.random() - 0.5) * spread;
      pos[i3+2] = (Math.random() - 0.5) * 40;
      
      const s = 0.4 + Math.random() * 0.6;
      col[i3] = s; col[i3+1] = s; col[i3+2] = s;
      
      size[i] = 0.6 + Math.random() * 2.0;
      vel[i3] = (Math.random()-0.5)*0.015;
      vel[i3+1] = (Math.random()-0.5)*0.015;
      vel[i3+2] = (Math.random()-0.5)*0.005;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
    
    this.origPos = new Float32Array(pos);
    this.velocities = vel;
    
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uPixelRatio: { value: this.renderer.getPixelRatio() }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vGlow;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPixelRatio;
        
        void main() {
          vColor = color;
          vec3 p = position;
          
          // Gentle drift
          p.x += sin(uTime*0.4 + position.y*0.08) * 0.4;
          p.y += cos(uTime*0.3 + position.x*0.08) * 0.4;
          
          // Mouse attraction — particles flow TOWARD cursor
          vec2 mn = uMouse * 2.0 - 1.0;
          float mx = mn.x * 55.0;
          float my = mn.y * 55.0;
          float dx = mx - p.x;
          float dy = my - p.y;
          float dist = sqrt(dx*dx + dy*dy);
          float attractR = 25.0;
          
          if (dist < attractR && dist > 1.0) {
            float f = (attractR - dist) / attractR;
            // Pull strength increases closer to mouse
            float pull = f * f * 2.5;
            p.x += dx * pull * 0.015;
            p.y += dy * pull * 0.015;
            
            // Brightness boost near mouse
            vGlow = f * f;
          } else {
            vGlow = 0.0;
          }
          
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = size * uPixelRatio * (90.0 / -mv.z);
          gl_PointSize *= (1.0 + vGlow * 1.5);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vGlow;
        
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.2, 0.5, d);
          
          // Glow color shift near mouse
          vec3 glowCol = mix(vColor, vec3(1.0, 0.97, 0.92), vGlow * 0.6);
          alpha *= (0.5 + vGlow * 0.5);
          
          gl_FragColor = vec4(glowCol, alpha * 0.75);
        }
      `,
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  createMouseGlow() {
    // A soft glow sprite following the mouse
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64,64,0, 64,64,64);
    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.04)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,128,128);
    
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({
      map: tex, transparent: true, blending: THREE.AdditiveBlending
    });
    this.mouseSprite = new THREE.Sprite(mat);
    this.mouseSprite.scale.set(30, 30, 1);
    this.mouseSprite.visible = false;
    this.scene.add(this.mouseSprite);
  }

  bindEvents() {
    window.addEventListener('mousemove', e => {
      this.mouse.tx = e.clientX / innerWidth;
      this.mouse.ty = 1.0 - e.clientY / innerHeight;
    });
    window.addEventListener('touchmove', e => {
      if (e.touches[0]) {
        this.mouse.tx = e.touches[0].clientX / innerWidth;
        this.mouse.ty = 1.0 - e.touches[0].clientY / innerHeight;
      }
    }, { passive: true });
    window.addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const t = performance.now() * 0.001;
    
    // Smooth mouse
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.06;
    
    // Update uniforms
    const m = this.particles.material;
    m.uniforms.uTime.value = t;
    m.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    
    // Rotate slowly
    this.particles.rotation.y = t * 0.008;
    this.particles.rotation.x = Math.sin(t * 0.05) * 0.02;
    
    // Mouse glow sprite follows cursor in 3D
    if (this.mouseSprite) {
      const mx = (this.mouse.x * 2 - 1) * 55;
      const my = (this.mouse.y * 2 - 1) * 55;
      this.mouseSprite.position.set(mx, my, 5);
      this.mouseSprite.visible = true;
      this.mouseSprite.material.opacity = 0.6 + Math.sin(t * 2) * 0.15;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}
