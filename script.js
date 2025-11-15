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

// ========================================
// CITY SIMULATION
// ========================================

// ========== SIMULATION STATE ==========
const simState = {
    meteorFallen: false,
    clayPlaced: false,
    discoveredProperties: ['burns'], // starts with one known property
    currentScenario: null, // 'power', 'mill', or 'city'
    dragging: false
};

// ========== SIMULATION DOM ELEMENTS ==========
const simElements = {
    citySimulation: document.getElementById('city-simulation'),
    meteor: document.getElementById('meteor'),
    crater: document.getElementById('crater'),
    draggableClay: document.getElementById('draggable-clay'),
    clayTooltip: document.getElementById('clay-tooltip'),
    discoveryMessage: document.getElementById('discovery-message'),
    messageTitle: document.getElementById('message-title'),
    messageText: document.getElementById('message-text'),
    resetBtn: document.getElementById('reset-sim'),

    // Droppable targets
    powerPlant: document.querySelector('[data-target="power"]'),
    woodMill: document.querySelector('[data-target="mill"]'),
    city: document.querySelector('[data-target="city"]'),

    // System elements
    forest: document.getElementById('forest'),
    trees: document.querySelectorAll('.tree'),
    cityLights: document.querySelectorAll('.city-light'),
    millWindows: document.querySelectorAll('.mill-window'),
    furnaceGlow: document.querySelector('.furnace-glow'),

    // Flow arrows
    flowForestMill: document.getElementById('flow-forest-mill'),
    flowMillPower: document.getElementById('flow-mill-power'),
    flowPowerCity: document.getElementById('flow-power-city'),

    // Status indicators
    statusForest: document.getElementById('status-forest'),
    statusMill: document.getElementById('status-mill'),
    statusPower: document.getElementById('status-power'),
    statusCity: document.getElementById('status-city'),

    // Properties list
    propBurns: document.getElementById('prop-burns'),
    propElectricity: document.getElementById('prop-electricity'),
    propGrowth: document.getElementById('prop-growth'),
    propMystery: document.getElementById('prop-mystery')
};

// ========== METEOR DROP ANIMATION ==========
function dropMeteor() {
    if (simState.meteorFallen) return;

    simState.meteorFallen = true;

    // Show meteor
    simElements.meteor.classList.remove('hidden');

    // After meteor animation (2s), show crater and clay
    setTimeout(() => {
        simElements.meteor.classList.add('hidden');
        simElements.crater.classList.remove('hidden');
        simElements.draggableClay.classList.remove('hidden');

        // Pulse animation on clay appearance
        const clay = simElements.draggableClay;
        clay.style.animation = 'none';
        setTimeout(() => {
            clay.style.animation = '';
        }, 10);
    }, 2000);
}

// ========== DRAG AND DROP ==========
let dragStartX = 0;
let dragStartY = 0;
let clayStartX = 500;
let clayStartY = 490;

function initDragAndDrop() {
    const clay = simElements.draggableClay;

    // Mouse events
    clay.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch events
    clay.addEventListener('touchstart', startDragTouch);
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', endDrag);

    // Hover for tooltip
    clay.addEventListener('mouseenter', showTooltip);
    clay.addEventListener('mouseleave', hideTooltip);
}

function startDrag(e) {
    if (simState.clayPlaced) return;

    e.preventDefault();
    simState.dragging = true;
    simElements.draggableClay.classList.add('dragging');

    const svg = document.getElementById('city-svg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    dragStartX = svgP.x - clayStartX;
    dragStartY = svgP.y - clayStartY;
}

function startDragTouch(e) {
    if (simState.clayPlaced) return;

    const touch = e.touches[0];
    const svg = document.getElementById('city-svg');
    const pt = svg.createSVGPoint();
    pt.x = touch.clientX;
    pt.y = touch.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    simState.dragging = true;
    simElements.draggableClay.classList.add('dragging');
    dragStartX = svgP.x - clayStartX;
    dragStartY = svgP.y - clayStartY;
}

function drag(e) {
    if (!simState.dragging || simState.clayPlaced) return;

    e.preventDefault();
    const svg = document.getElementById('city-svg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    clayStartX = svgP.x - dragStartX;
    clayStartY = svgP.y - dragStartY;

    simElements.draggableClay.setAttribute('transform', `translate(${clayStartX}, ${clayStartY})`);

    // Highlight droppable targets
    highlightNearestTarget(clayStartX, clayStartY);
}

function dragTouch(e) {
    if (!simState.dragging || simState.clayPlaced) return;

    const touch = e.touches[0];
    const svg = document.getElementById('city-svg');
    const pt = svg.createSVGPoint();
    pt.x = touch.clientX;
    pt.y = touch.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    clayStartX = svgP.x - dragStartX;
    clayStartY = svgP.y - dragStartY;

    simElements.draggableClay.setAttribute('transform', `translate(${clayStartX}, ${clayStartY})`);
    highlightNearestTarget(clayStartX, clayStartY);
}

function endDrag(e) {
    if (!simState.dragging || simState.clayPlaced) return;

    simState.dragging = false;
    simElements.draggableClay.classList.remove('dragging');

    // Check which target we're over
    const target = getDropTarget(clayStartX, clayStartY);

    if (target) {
        handleDrop(target);
    } else {
        // Snap back to original position
        clayStartX = 500;
        clayStartY = 490;
        simElements.draggableClay.setAttribute('transform', `translate(${clayStartX}, ${clayStartY})`);
    }

    // Remove all highlights
    document.querySelectorAll('.droppable').forEach(el => el.classList.remove('highlight'));
}

function highlightNearestTarget(x, y) {
    // Remove all highlights first
    document.querySelectorAll('.droppable').forEach(el => el.classList.remove('highlight'));

    const target = getDropTarget(x, y);
    if (target) {
        const targetEl = document.querySelector(`[data-target="${target}"]`);
        if (targetEl) targetEl.classList.add('highlight');
    }
}

function getDropTarget(x, y) {
    // Power plant: roughly x: 480-580, y: 370-450
    if (x >= 480 && x <= 580 && y >= 370 && y <= 450) {
        return 'power';
    }

    // Wood mill: roughly x: 280-360, y: 390-450
    if (x >= 280 && x <= 360 && y >= 390 && y <= 450) {
        return 'mill';
    }

    // City: roughly x: 700-840, y: 385-450
    if (x >= 700 && x <= 840 && y >= 385 && y <= 450) {
        return 'city';
    }

    return null;
}

// ========== TOOLTIP ==========
function showTooltip() {
    if (simState.dragging || simState.clayPlaced) return;
    simElements.clayTooltip.classList.remove('hidden');
}

function hideTooltip() {
    simElements.clayTooltip.classList.add('hidden');
}

// ========== DROP SCENARIOS ==========
function handleDrop(target) {
    simState.clayPlaced = true;
    simState.currentScenario = target;
    hideTooltip();

    switch(target) {
        case 'power':
            scenarioPowerPlant();
            break;
        case 'mill':
            scenarioWoodMill();
            break;
        case 'city':
            scenarioCity();
            break;
    }
}

// Scenario 1: Drop on Power Plant (Safe choice - no new discoveries)
function scenarioPowerPlant() {
    // Move clay to power plant
    clayStartX = 530;
    clayStartY = 405;
    simElements.draggableClay.setAttribute('transform', `translate(${clayStartX}, ${clayStartY})`);

    // Boost furnace glow
    simElements.furnaceGlow.classList.add('boosted');

    // Update status
    simElements.statusPower.textContent = 'Boosted!';
    simElements.statusPower.classList.add('boosted');

    // Show message
    setTimeout(() => {
        showDiscoveryMessage(
            'Safe Choice',
            'The alien clay burns more efficiently than wood. Power output increased by 25%. But... no new properties discovered. You played it safe.'
        );
    }, 500);
}

// Scenario 2: Drop on Wood Mill (Risky - disruption then discovery!)
function scenarioWoodMill() {
    // Move clay to wood mill
    clayStartX = 320;
    clayStartY = 420;
    simElements.draggableClay.setAttribute('transform', `translate(${clayStartX}, ${clayStartY})`);

    // PHASE 1: Disruption (immediate)
    setTimeout(() => {
        // Mill breaks down
        simElements.millWindows.forEach(w => w.classList.add('dark'));
        simElements.statusMill.textContent = 'OFFLINE';
        simElements.statusMill.classList.add('disrupted');

        // Power plant loses fuel
        simElements.furnaceGlow.style.opacity = '0.2';
        simElements.statusPower.textContent = 'No Fuel!';
        simElements.statusPower.classList.add('disrupted');

        // City goes dark
        simElements.cityLights.forEach(light => light.classList.add('dark'));
        simElements.statusCity.textContent = 'DARK';
        simElements.statusCity.classList.add('disrupted');

        // Fade flows
        simElements.flowMillPower.classList.add('fade');
        simElements.flowPowerCity.classList.add('fade');

        // Show disruption message
        showDiscoveryMessage(
            'System Disrupted!',
            'The wood mill has shut down. The power plant has no fuel. The city is dark. This looks bad...'
        );
    }, 500);

    // PHASE 2: Discovery! (after 3 seconds)
    setTimeout(() => {
        hideDiscoveryMessage();

        setTimeout(() => {
            // Discover electricity property!
            simState.discoveredProperties.push('electricity');
            simElements.propElectricity.classList.remove('unknown');
            simElements.propElectricity.classList.add('discovered');
            simElements.propElectricity.textContent = '⚡ Generates electricity directly!';

            showDiscoveryMessage(
                'New Property Discovered!',
                'Wait! The alien clay is generating electricity on its own! You can power the city directly without burning anything!'
            );
        }, 500);
    }, 4000);
}

// Scenario 3: Drop on City (Direct power + cascading transformation)
function scenarioCity() {
    // Move clay to city
    clayStartX = 770;
    clayStartY = 420;
    simElements.draggableClay.setAttribute('transform', `translate(${clayStartX}, ${clayStartY})`);

    // PHASE 1: Direct power (immediate)
    setTimeout(() => {
        // City lights back up (if they were dark) or get brighter
        simElements.cityLights.forEach(light => {
            light.classList.remove('dark');
            light.setAttribute('fill', '#00d9ff'); // Brighter, cyan glow
        });

        simElements.statusCity.textContent = 'Powered (Direct)';
        simElements.statusCity.classList.remove('disrupted');
        simElements.statusCity.classList.add('boosted');

        // Check if this is after mill scenario
        if (simState.discoveredProperties.includes('electricity')) {
            showDiscoveryMessage(
                'Direct Power!',
                'The city is now powered directly by the alien clay\'s electrical properties. No burning needed!'
            );
        } else {
            // Discover electricity if not already discovered
            if (!simState.discoveredProperties.includes('electricity')) {
                simState.discoveredProperties.push('electricity');
                simElements.propElectricity.classList.remove('unknown');
                simElements.propElectricity.classList.add('discovered');
                simElements.propElectricity.textContent = '⚡ Generates electricity directly!';
            }

            showDiscoveryMessage(
                'New Property Discovered!',
                'The alien clay powers the city directly! It generates electricity without burning. The old system is obsolete.'
            );
        }
    }, 500);

    // PHASE 2: Cascading transformation (after 3 seconds)
    setTimeout(() => {
        hideDiscoveryMessage();

        setTimeout(() => {
            // Forest flourishes
            simElements.trees.forEach(tree => tree.classList.add('flourish'));
            simElements.statusForest.textContent = 'Flourishing!';
            simElements.statusForest.classList.add('boosted');

            // Discover growth property
            if (!simState.discoveredProperties.includes('growth')) {
                simState.discoveredProperties.push('growth');
                simElements.propGrowth.classList.remove('unknown');
                simElements.propGrowth.classList.add('discovered');
                simElements.propGrowth.textContent = '🌱 Promotes natural growth!';
            }

            // Mill becomes redundant
            simElements.woodMill.classList.add('fading');
            simElements.statusMill.textContent = 'Obsolete';
            simElements.statusMill.classList.add('faded');

            // Power plant becomes redundant
            simElements.furnaceGlow.style.opacity = '0.2';
            simElements.statusPower.textContent = 'Obsolete';
            simElements.statusPower.classList.add('faded');

            // Fade old flows
            simElements.flowForestMill.classList.add('fade');
            simElements.flowMillPower.classList.add('fade');
            simElements.flowPowerCity.classList.add('fade');

            showDiscoveryMessage(
                'Cascade Complete!',
                'Without the need to harvest wood, the forest flourishes. The wood mill and power plant are obsolete. A new paradigm emerges from system transformation.'
            );
        }, 500);
    }, 4000);
}

// ========== DISCOVERY MESSAGE ==========
function showDiscoveryMessage(title, text) {
    simElements.messageTitle.textContent = title;
    simElements.messageText.textContent = text;
    simElements.discoveryMessage.classList.remove('hidden');
}

function hideDiscoveryMessage() {
    simElements.discoveryMessage.classList.add('hidden');
}

// ========== RESET SIMULATION ==========
function resetSimulation() {
    // Reset state
    simState.meteorFallen = false;
    simState.clayPlaced = false;
    simState.discoveredProperties = ['burns'];
    simState.currentScenario = null;
    simState.dragging = false;

    // Reset clay position
    clayStartX = 500;
    clayStartY = 490;

    // Hide everything
    simElements.meteor.classList.add('hidden');
    simElements.crater.classList.add('hidden');
    simElements.draggableClay.classList.add('hidden');
    simElements.draggableClay.setAttribute('transform', `translate(${clayStartX}, ${clayStartY})`);
    simElements.clayTooltip.classList.add('hidden');
    simElements.discoveryMessage.classList.add('hidden');

    // Reset city lights
    simElements.cityLights.forEach(light => {
        light.classList.remove('dark');
        light.setAttribute('fill', '#ffff00');
    });

    // Reset mill windows
    simElements.millWindows.forEach(w => w.classList.remove('dark'));

    // Reset furnace
    simElements.furnaceGlow.classList.remove('boosted');
    simElements.furnaceGlow.style.opacity = '1';

    // Reset trees
    simElements.trees.forEach(tree => tree.classList.remove('flourish'));

    // Reset mill
    simElements.woodMill.classList.remove('fading');

    // Reset flows
    simElements.flowForestMill.classList.remove('fade');
    simElements.flowMillPower.classList.remove('fade');
    simElements.flowPowerCity.classList.remove('fade');

    // Reset status indicators
    simElements.statusForest.textContent = 'Producing';
    simElements.statusForest.classList.remove('boosted', 'disrupted', 'faded');

    simElements.statusMill.textContent = 'Active';
    simElements.statusMill.classList.remove('boosted', 'disrupted', 'faded');

    simElements.statusPower.textContent = 'Running';
    simElements.statusPower.classList.remove('boosted', 'disrupted', 'faded');

    simElements.statusCity.textContent = 'Powered';
    simElements.statusCity.classList.remove('boosted', 'disrupted', 'faded');

    // Reset properties
    simElements.propElectricity.classList.remove('discovered');
    simElements.propElectricity.classList.add('unknown');
    simElements.propElectricity.textContent = '??';

    simElements.propGrowth.classList.remove('discovered');
    simElements.propGrowth.classList.add('unknown');
    simElements.propGrowth.textContent = '??';

    // Restart meteor drop after short delay
    setTimeout(() => {
        dropMeteor();
    }, 500);
}

// ========== SIMULATION SCROLL OBSERVER ==========
function setupSimulationObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !simState.meteorFallen) {
                // Start meteor drop when simulation comes into view
                setTimeout(() => {
                    dropMeteor();
                }, 500);
            }
        });
    }, {
        threshold: 0.3
    });

    if (simElements.citySimulation) {
        observer.observe(simElements.citySimulation);
    }
}

// ========== SIMULATION INIT ==========
function initSimulation() {
    if (!simElements.citySimulation) return; // Simulation not on page

    setupSimulationObserver();
    initDragAndDrop();

    // Reset button
    simElements.resetBtn.addEventListener('click', resetSimulation);
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

    // Initialize city simulation
    initSimulation();

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
