// ========================================
// ALIEN CLAY - INTERACTIVE SCRIPT
// A Material Science Approach to AI
// ========================================

// ========== STATE MANAGEMENT ==========
const state = {
    clayInjected: false,
    systemDisrupted: false,
    discoveriesRevealed: false,
    transformationShown: false
};

// ========== DOM ELEMENTS ==========
const elements = {
    clayOrb: document.getElementById('clay-orb'),
    stableSystem: document.getElementById('stable-system'),
    discoveryArea: document.getElementById('discovery-area'),
    transformationArea: document.getElementById('transformation'),
    systemStatus: document.querySelector('.status-indicator'),
    particleCanvas: document.getElementById('particle-canvas'),
    expandButtons: document.querySelectorAll('.expand-btn')
};

// ========== PARTICLE BACKGROUND ==========
class ParticleBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100;
        this.connectionDistance = 150;

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles.forEach((particle, i) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 217, 255, 0.5)';
            this.ctx.fill();

            // Draw connections
            this.particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    const opacity = (1 - distance / this.connectionDistance) * 0.3;
                    this.ctx.strokeStyle = `rgba(0, 217, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ========== RIPPLE EFFECT ==========
function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 20px;
        height: 20px;
        border: 3px solid #00d9ff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        animation: ripple-expand 1.5s ease-out forwards;
    `;

    // Add animation keyframes if not already added
    if (!document.getElementById('ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple-expand {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(50);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 1500);
}

// ========== INJECT ALIEN CLAY ==========
function injectAlienClay() {
    if (state.clayInjected) return;

    state.clayInjected = true;

    // Get clay position for ripple origin
    const clayRect = elements.clayOrb.getBoundingClientRect();
    const clayX = clayRect.left + clayRect.width / 2;
    const clayY = clayRect.top + clayRect.height / 2;

    // Add injected animation to clay
    elements.clayOrb.classList.add('injected');

    // Create ripple effect
    createRipple(clayX, clayY);

    // Disrupt the system after short delay
    setTimeout(() => {
        disruptSystem();
    }, 500);

    // Reveal discoveries after disruption
    setTimeout(() => {
        revealDiscoveries();
    }, 2000);

    // Show transformation visualization
    setTimeout(() => {
        showTransformation();
    }, 3000);
}

// ========== DISRUPT SYSTEM ==========
function disruptSystem() {
    state.systemDisrupted = true;

    // Add disrupted class to system
    elements.stableSystem.classList.add('disrupted');

    // Update status indicator
    elements.systemStatus.classList.remove('stable');
    elements.systemStatus.classList.add('disrupted');
    elements.systemStatus.textContent = 'Disrupted & Evolving';

    // Create multiple ripple effects on system nodes
    const systemNodes = document.querySelectorAll('.system-node');
    systemNodes.forEach((node, index) => {
        setTimeout(() => {
            const rect = node.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            createRipple(x, y);
        }, index * 200);
    });
}

// ========== REVEAL DISCOVERIES ==========
function revealDiscoveries() {
    state.discoveriesRevealed = true;

    // Remove hidden class and add visible class
    elements.discoveryArea.classList.remove('hidden');

    // Smooth fade-in
    setTimeout(() => {
        elements.discoveryArea.classList.add('visible');
    }, 50);

    // Stagger animation for discovery nodes
    const discoveryNodes = document.querySelectorAll('.discovery-node');
    discoveryNodes.forEach((node, index) => {
        node.style.opacity = '0';
        node.style.transform = 'translateY(30px)';

        setTimeout(() => {
            node.style.transition = 'all 0.6s ease';
            node.style.opacity = '1';
            node.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

// ========== SHOW TRANSFORMATION ==========
function showTransformation() {
    state.transformationShown = true;

    // Remove hidden class and add visible class
    elements.transformationArea.classList.remove('hidden');

    setTimeout(() => {
        elements.transformationArea.classList.add('visible');
    }, 50);

    // Animate stages sequentially
    const stages = ['stage-stable', 'stage-disrupted', 'stage-transformed'];
    stages.forEach((stageId, index) => {
        const stage = document.getElementById(stageId);
        stage.style.opacity = '0';
        stage.style.transform = 'scale(0.8)';

        setTimeout(() => {
            stage.style.transition = 'all 0.8s ease';
            stage.style.opacity = '1';
            stage.style.transform = 'scale(1)';
        }, index * 400);
    });
}

// ========== EXPAND/COLLAPSE DISCOVERIES ==========
function setupDiscoveryExpansion() {
    elements.expandButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();

            const discoveryNode = button.closest('.discovery-node');
            const detail = discoveryNode.querySelector('.discovery-detail');
            const isExpanded = detail.classList.contains('visible');

            if (isExpanded) {
                // Collapse
                detail.classList.remove('visible');
                button.classList.remove('expanded');
                button.textContent = 'Explore';
            } else {
                // Expand
                detail.classList.add('visible');
                button.classList.add('expanded');
                button.textContent = 'Collapse';

                // Create subtle ripple effect
                const rect = discoveryNode.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;

                // Small ripple for discovery reveal
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    width: 10px;
                    height: 10px;
                    border: 2px solid #00d9ff;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    z-index: 9999;
                    animation: ripple-expand 0.8s ease-out forwards;
                `;
                document.body.appendChild(ripple);
                setTimeout(() => ripple.remove(), 800);
            }
        });
    });
}

// ========== SYSTEM NODE INTERACTIONS ==========
function setupSystemNodeInteractions() {
    const systemNodes = document.querySelectorAll('.system-node');

    systemNodes.forEach(node => {
        node.addEventListener('click', () => {
            if (!state.clayInjected) {
                // Pulse animation to indicate they should inject clay first
                node.style.animation = 'none';
                setTimeout(() => {
                    node.style.animation = '';
                }, 10);
            } else {
                // Create ripple on click
                const rect = node.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                createRipple(x, y);
            }
        });
    });
}

// ========== KEYBOARD SHORTCUTS ==========
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Press 'E' to inject clay
        if (e.key.toLowerCase() === 'e' && !state.clayInjected) {
            injectAlienClay();
        }

        // Press 'R' to reset (reload)
        if (e.key.toLowerCase() === 'r' && e.ctrlKey) {
            e.preventDefault();
            location.reload();
        }
    });
}

// ========== SCROLL REVEAL EFFECTS ==========
function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe sections
    const sections = document.querySelectorAll('.intro, .footer');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.8s ease';
        observer.observe(section);
    });
}

// ========== EASTER EGGS ==========
function setupEasterEggs() {
    let clickCount = 0;
    const header = document.querySelector('.header h1');

    header.addEventListener('click', () => {
        clickCount++;

        if (clickCount === 3) {
            // Triple click on title for extra glitch
            header.style.animation = 'none';
            setTimeout(() => {
                header.style.animation = 'glitch-intense 0.5s ease';
            }, 10);

            // Add intense glitch animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes glitch-intense {
                    0%, 100% { transform: translate(0); }
                    10% { transform: translate(-5px, 5px); color: #ff006e; }
                    20% { transform: translate(5px, -5px); color: #00d9ff; }
                    30% { transform: translate(-5px, -5px); color: #8338ec; }
                    40% { transform: translate(5px, 5px); color: #06ffa5; }
                    50% { transform: translate(-5px, 5px); color: #ff006e; }
                    60% { transform: translate(5px, -5px); color: #00d9ff; }
                    70% { transform: translate(-5px, -5px); color: #8338ec; }
                    80% { transform: translate(5px, 5px); color: #06ffa5; }
                    90% { transform: translate(0); }
                }
            `;
            document.head.appendChild(style);

            setTimeout(() => {
                header.style.animation = 'glitch-subtle 5s infinite';
                clickCount = 0;
            }, 500);
        }
    });

    // Konami code easter egg
    let konamiCode = [];
    const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);

        if (konamiCode.join(',') === konamiPattern.join(',')) {
            // Activate special mode
            document.body.style.animation = 'rainbow-bg 5s linear infinite';

            const style = document.createElement('style');
            style.textContent = `
                @keyframes rainbow-bg {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
            document.head.appendChild(style);

            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
        }
    });
}

// ========== INITIALIZE ==========
function init() {
    // Initialize particle background
    new ParticleBackground(elements.particleCanvas);

    // Setup clay injection
    elements.clayOrb.addEventListener('click', injectAlienClay);

    // Setup discovery expansion
    setupDiscoveryExpansion();

    // Setup system node interactions
    setupSystemNodeInteractions();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Setup scroll reveal effects
    setupScrollReveal();

    // Setup easter eggs
    setupEasterEggs();

    // Log welcome message
    console.log('%c🌌 ALIEN CLAY 🌌', 'font-size: 20px; color: #00d9ff; font-weight: bold;');
    console.log('%cPress E to inject alien clay', 'color: #8338ec;');
    console.log('%cCtrl+R to reset the experiment', 'color: #06ffa5;');
    console.log('%c"I don\'t want to build better chatbots. I want to discover what we don\'t know we don\'t know."', 'font-style: italic; color: #ff006e;');
}

// ========== START ==========
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for potential external use
window.AlienClay = {
    inject: injectAlienClay,
    state: state
};
