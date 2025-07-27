// 🌟 3D Interactive Dashboard - The Ultimate Wow Factor
class Advanced3DDashboard {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.stockSpheres = {};
        this.animationId = null;
        this.isInitialized = false;
        
        this.init3DEnvironment();
        this.create3DElements();
        this.startAnimation();
    }

    init3DEnvironment() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 0, 10);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Create container for 3D view
        this.create3DContainer();

        // Add controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add lights
        this.addLights();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    create3DContainer() {
        const container3D = document.createElement('div');
        container3D.id = '3d-dashboard-container';
        container3D.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        
        container3D.appendChild(this.renderer.domElement);
        document.body.appendChild(container3D);

        // Add toggle button
        this.create3DToggleButton();
    }

    create3DToggleButton() {
        const toggleBtn = document.createElement('div');
        toggleBtn.id = '3d-toggle-btn';
        toggleBtn.innerHTML = `
            <i class="fas fa-cube"></i>
            <span>3D View</span>
        `;
        toggleBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;

        toggleBtn.addEventListener('click', () => this.toggle3DView());
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.transform = 'scale(1.05)';
        });
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.transform = 'scale(1)';
        });

        document.body.appendChild(toggleBtn);
    }

    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 50);
        pointLight1.position.set(-10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff0088, 0.5, 50);
        pointLight2.position.set(10, -10, 10);
        this.scene.add(pointLight2);
    }

    create3DElements() {
        this.createStockSpheres();
        this.createMarketGrid();
        this.createFloatingParticles();
        this.createHolographicText();
    }

    createStockSpheres() {
        const stocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff, 0x5f27cd];

        stocks.forEach((stock, index) => {
            const geometry = new THREE.SphereGeometry(0.5, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                color: colors[index],
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            
            // Position spheres in a circle
            const angle = (index / stocks.length) * Math.PI * 2;
            sphere.position.x = Math.cos(angle) * 5;
            sphere.position.y = Math.sin(angle) * 5;
            sphere.position.z = 0;
            
            // Add glow effect
            const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: colors[index],
                transparent: true,
                opacity: 0.2
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            sphere.add(glow);

            // Add stock label
            this.addStockLabel(sphere, stock, colors[index]);
            
            this.stockSpheres[stock] = {
                sphere: sphere,
                originalY: sphere.position.y,
                color: colors[index]
            };
            
            this.scene.add(sphere);
        });
    }

    addStockLabel(sphere, text, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = 'white';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 16);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true 
        });
        const geometry = new THREE.PlaneGeometry(2, 1);
        const label = new THREE.Mesh(geometry, material);
        
        label.position.y = 1;
        sphere.add(label);
    }

    createMarketGrid() {
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        gridHelper.position.y = -3;
        this.scene.add(gridHelper);

        // Add animated grid lines
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3
        });

        const points = [];
        for (let i = 0; i < 100; i++) {
            points.push(new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                -3,
                (Math.random() - 0.5) * 20
            ));
        }

        geometry.setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
    }

    createFloatingParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createHolographicText() {
        const loader = new THREE.FontLoader();
        // You would need to load a font file here
        // For now, we'll create a simple text mesh
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        
        context.fillStyle = 'rgba(0, 255, 136, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = 'white';
        context.font = 'bold 36px Arial';
        context.textAlign = 'center';
        context.fillText('AI STOCK DASHBOARD', canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true 
        });
        const geometry = new THREE.PlaneGeometry(8, 4);
        const textMesh = new THREE.Mesh(geometry, material);
        
        textMesh.position.set(0, 8, -5);
        this.scene.add(textMesh);
    }

    updateStockData(symbol, data) {
        if (this.stockSpheres[symbol]) {
            const sphere = this.stockSpheres[symbol].sphere;
            const change = data.change_percent || 0;
            
            // Animate based on stock performance
            const targetY = this.stockSpheres[symbol].originalY + (change * 0.1);
            
            // Smooth animation
            const animate = () => {
                sphere.position.y += (targetY - sphere.position.y) * 0.1;
                if (Math.abs(targetY - sphere.position.y) > 0.01) {
                    requestAnimationFrame(animate);
                }
            };
            animate();

            // Change color based on performance
            const material = sphere.material;
            if (change > 0) {
                material.color.setHex(0x00ff88); // Green for positive
            } else if (change < 0) {
                material.color.setHex(0xff4757); // Red for negative
            }

            // Add pulsing effect for significant changes
            if (Math.abs(change) > 2) {
                this.addPulseEffect(sphere);
            }
        }
    }

    addPulseEffect(sphere) {
        const originalScale = sphere.scale.clone();
        const pulseAnimation = () => {
            sphere.scale.multiplyScalar(1.1);
            setTimeout(() => {
                sphere.scale.copy(originalScale);
            }, 200);
        };
        
        pulseAnimation();
        setTimeout(pulseAnimation, 400);
        setTimeout(pulseAnimation, 800);
    }

    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            // Rotate stock spheres
            Object.values(this.stockSpheres).forEach(stockData => {
                stockData.sphere.rotation.y += 0.01;
            });

            // Animate particles
            if (this.particles) {
                this.particles.rotation.y += 0.002;
            }

            // Update controls
            this.controls.update();

            // Render scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }

    toggle3DView() {
        const container = document.getElementById('3d-dashboard-container');
        const toggleBtn = document.getElementById('3d-toggle-btn');
        
        if (container.style.zIndex === '-1') {
            // Show 3D view
            container.style.zIndex = '999';
            container.style.pointerEvents = 'all';
            toggleBtn.innerHTML = '<i class="fas fa-times"></i><span>Exit 3D</span>';
            
            // Add exit instructions
            this.showExitInstructions();
        } else {
            // Hide 3D view
            container.style.zIndex = '-1';
            container.style.pointerEvents = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-cube"></i><span>3D View</span>';
            
            this.hideExitInstructions();
        }
    }

    showExitInstructions() {
        const instructions = document.createElement('div');
        instructions.id = '3d-instructions';
        instructions.innerHTML = `
            <div class="instructions-content">
                <h3>🌟 3D Dashboard Controls</h3>
                <ul>
                    <li><strong>Mouse:</strong> Rotate view</li>
                    <li><strong>Scroll:</strong> Zoom in/out</li>
                    <li><strong>Drag:</strong> Pan around</li>
                    <li><strong>Spheres:</strong> Represent stock performance</li>
                </ul>
                <p>Stock spheres move up/down based on performance!</p>
            </div>
        `;
        instructions.style.cssText = `
            position: fixed;
            top: 100px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 1002;
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(instructions);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.getElementById('3d-instructions')) {
                instructions.style.opacity = '0';
                setTimeout(() => instructions.remove(), 500);
            }
        }, 5000);
    }

    hideExitInstructions() {
        const instructions = document.getElementById('3d-instructions');
        if (instructions) {
            instructions.remove();
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up Three.js objects
        this.scene.clear();
        this.renderer.dispose();
        
        // Remove DOM elements
        const container = document.getElementById('3d-dashboard-container');
        const toggleBtn = document.getElementById('3d-toggle-btn');
        const instructions = document.getElementById('3d-instructions');
        
        if (container) container.remove();
        if (toggleBtn) toggleBtn.remove();
        if (instructions) instructions.remove();
    }
}

// Initialize 3D dashboard when Three.js is loaded
function init3DDashboard() {
    if (typeof THREE !== 'undefined') {
        window.dashboard3D = new Advanced3DDashboard();
        console.log('🌟 3D Dashboard initialized!');
        
        // Integrate with existing dashboard
        if (window.dashboard) {
            const originalLoadStockData = window.dashboard.loadStockData;
            window.dashboard.loadStockData = function(symbol) {
                originalLoadStockData.call(this, symbol);
                // Update 3D visualization when stock data changes
                if (window.dashboard3D && this.currentStockData) {
                    window.dashboard3D.updateStockData(symbol, this.currentStockData);
                }
            };
        }
    } else {
        console.warn('Three.js not loaded, 3D dashboard disabled');
    }
}

// Load Three.js and initialize
if (!window.THREE) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
        // Load OrbitControls
        const controlsScript = document.createElement('script');
        controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
        controlsScript.onload = init3DDashboard;
        document.head.appendChild(controlsScript);
    };
    document.head.appendChild(script);
} else {
    init3DDashboard();
}