/**
 * Kenna Kai — Lusion-inspired Interactive Website
 * Canvas 2D background + scroll animations + mouse effects
 */

// === CANVAS BACKGROUND ===
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let time = 0;

// Flow lines system
class FlowLine {
    constructor(index, total) {
        this.index = index;
        this.total = total;
        this.points = [];
        this.numPoints = 20;
        this.amplitude = 30 + Math.random() * 50;
        this.frequency = 0.002 + Math.random() * 0.003;
        this.speed = 0.3 + Math.random() * 0.5;
        this.alpha = 0.1 + Math.random() * 0.2;
        this.hue = 340 + Math.random() * 40; // Red to purple range
        
        // Initialize points
        for (let i = 0; i < this.numPoints; i++) {
            this.points.push({
                x: 0,
                y: 0,
                baseY: 0
            });
        }
    }

    update(w, h, t) {
        const spacing = h / this.total;
        const baseY = spacing * this.index + spacing / 2;
        
        for (let i = 0; i < this.numPoints; i++) {
            const x = (i / (this.numPoints - 1)) * w;
            
            // Complex wave: base sine + mouse interaction + time
            const distX = (x - mouse.x) / w;
            const distY = (baseY - mouse.y) / h;
            const dist = Math.sqrt(distX * distX + distY * distY);
            const mouseInfluence = Math.max(0, 1 - dist * 2) * 60;
            
            const wave1 = Math.sin(x * this.frequency + t * this.speed) * this.amplitude;
            const wave2 = Math.sin(x * this.frequency * 2.5 + t * this.speed * 1.3) * this.amplitude * 0.5;
            const wave3 = Math.sin(x * this.frequency * 0.5 + t * this.speed * 0.7) * this.amplitude * 0.3;
            
            const mouseWave = Math.sin(dist * 10 - t * 2) * mouseInfluence;
            
            this.points[i].x = x;
            this.points[i].y = baseY + wave1 + wave2 + wave3 + mouseWave;
            this.points[i].baseY = baseY;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        // Smooth curve through points
        for (let i = 1; i < this.points.length - 1; i++) {
            const xc = (this.points[i].x + this.points[i + 1].x) / 2;
            const yc = (this.points[i].y + this.points[i + 1].y) / 2;
            ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
        }
        
        ctx.quadraticCurveTo(
            this.points[this.points.length - 1].x,
            this.points[this.points.length - 1].y,
            this.points[this.points.length - 1].x,
            this.points[this.points.length - 1].y
        );
        
        // Gradient stroke
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 60%, 0)`);
        gradient.addColorStop(0.3, `hsla(${this.hue}, 80%, 60%, ${this.alpha})`);
        gradient.addColorStop(0.7, `hsla(${this.hue + 20}, 80%, 60%, ${this.alpha})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 80%, 60%, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Glow effect
        ctx.shadowColor = `hsla(${this.hue}, 80%, 60%, 0.3)`;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// Particle system for ambient dust
class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.hue = 340 + Math.random() * 40;
        this.alpha = Math.random() * 0.3 + 0.1;
        this.life = 0;
        this.maxLife = 200 + Math.random() * 200;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        
        // Mouse attraction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            this.x += dx * 0.001;
            this.y += dy * 0.001;
        }
        
        if (this.life > this.maxLife || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.reset();
        }
    }
    
    draw(ctx) {
        const fade = Math.sin((this.life / this.maxLife) * Math.PI);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.alpha * fade})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize
const flowLines = [];
const particles = [];
const numFlowLines = 12;
const numParticles = 80;

function init() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    flowLines.length = 0;
    for (let i = 0; i < numFlowLines; i++) {
        flowLines.push(new FlowLine(i, numFlowLines));
    }
    
    particles.length = 0;
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    time += 0.016;
    
    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;
    
    // Clear with trail effect
    ctx.fillStyle = 'rgba(250, 248, 255, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw flow lines
    flowLines.forEach(line => {
        line.update(width, height, time);
        line.draw(ctx);
    });
    
    // Draw particles
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });
    
    requestAnimationFrame(animate);
}

// Mouse tracking
document.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
});

// Touch support
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
    }
});

// Resize
window.addEventListener('resize', () => {
    init();
});

// Start
init();
animate();

// === SCROLL ANIMATIONS ===
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements
function setupScrollAnimations() {
    const sections = document.querySelectorAll('section');
    const cards = document.querySelectorAll('.project-card');
    const texts = document.querySelectorAll('.about-text, .section-header, .about-stats');
    
    [...sections, ...cards, ...texts].forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Hero animation on load
    setTimeout(() => {
        document.querySelector('.hero-content').classList.add('visible');
    }, 300);
}

document.addEventListener('DOMContentLoaded', setupScrollAnimations);

// === SCROLL PROGRESS BAR ===
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = progress + '%';
});

// === NAV SCROLL EFFECT ===
let lastScroll = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove scrolled class for glassmorphism effect
    if (currentScroll > 80) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// === ACTIVE SECTION DETECTION ===
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scrollPos = window.pageYOffset + 200;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// === SMOOTH SCROLL FOR NAV ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 100;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            // Close mobile menu if open
            mobileMenu.classList.remove('active');
            menuBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// === MOBILE MENU ===
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// === NAV SCROLL EFFECT ===
let lastScroll = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.style.background = 'rgba(255, 255, 255, 0.92)';
        nav.style.backdropFilter = 'blur(20px)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.75)';
    }
    
    lastScroll = currentScroll;
});

// === PROJECT CARD INTERACTION ===
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
        const link = card.querySelector('.project-link');
        if (link) {
            window.open(link.href, '_blank');
        }
    });
});

// === GLITCH TEXT EFFECT ON HERO ===
function glitchText(element, originalText) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let iterations = 0;
    
    const interval = setInterval(() => {
        element.innerText = originalText
            .split('')
            .map((char, index) => {
                if (index < iterations) {
                    return originalText[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        
        if (iterations >= originalText.length) {
            clearInterval(interval);
            element.innerText = originalText;
        }
        
        iterations += 1/2;
    }, 30);
}

// Apply glitch on load
document.addEventListener('DOMContentLoaded', () => {
    const accentText = document.querySelector('.hero-title .accent-text');
    if (accentText) {
        const original = accentText.innerText;
        setTimeout(() => glitchText(accentText, original), 500);
    }
});

// === MOUSE GLOW EFFECT ===
const glow = document.createElement('div');
glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 45, 85, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 2;
    transform: translate(-50%, -50%);
    transition: left 0.15s ease-out, top 0.15s ease-out;
`;
document.body.appendChild(glow);

document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// === TILT EFFECT ON PROJECT CARDS ===
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -5;
        const rotateY = (x - centerX) / centerX * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});
