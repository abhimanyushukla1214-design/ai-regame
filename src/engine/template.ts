import { PlayableGameDefinition } from '../types/gameBuilder.js';
import { VisualDirectionAgent } from './VisualDirectionAgent.js';
import * as fs from 'fs';
import * as path from 'path';

export function generateGameHTML(def: PlayableGameDefinition): string {
    const runtimeInput = fs.readFileSync(path.join(process.cwd(), 'src/engine/runtime_js/input.js'), 'utf-8');
    const runtimeCore = fs.readFileSync(path.join(process.cwd(), 'src/engine/runtime_js/runtime.js'), 'utf-8');
    const runtimeParticles = fs.readFileSync(path.join(process.cwd(), 'src/engine/runtime_js/particles.js'), 'utf-8');
    const runtimeVisuals = fs.readFileSync(path.join(process.cwd(), 'src/engine/runtime_js/visuals.js'), 'utf-8');
    const runtimeVD = fs.readFileSync(path.join(process.cwd(), 'src/engine/runtime_js/visualDirection.js'), 'utf-8');
    const runtimeFactory = fs.readFileSync(path.join(process.cwd(), 'src/engine/runtime_js/RuntimeFactory.js'), 'utf-8');
    
    // Dynamically load only the needed runtime
    let runtimeSpecific = '';
    const archetype = def.gameIdentity?.archetype;
    if (archetype === 'SNAKE') {
        runtimeSpecific = fs.readFileSync(path.join(process.cwd(), 'src/engine/runtime_js/SnakeRuntime.js'), 'utf-8');
    } else if (archetype === 'PLATFORMER') {
        runtimeSpecific = fs.readFileSync(path.join(process.cwd(), 'src/engine/runtime_js/PlatformerRuntime.js'), 'utf-8');
    }
    
    const runtimeCode = runtimeInput + '\n' + 
                        runtimeCore + '\n' + 
                        runtimeParticles + '\n' + 
                        runtimeVisuals + '\n' + 
                        runtimeVD + '\n' + 
                        runtimeSpecific + '\n' + 
                        runtimeFactory;

    const visualConfig = VisualDirectionAgent.getVisuals(def);
    const bgColor = visualConfig.palette.background;
    const playerColor = visualConfig.palette.player;
    const enemyColor = visualConfig.palette.enemy;
    const hudColor = visualConfig.palette.hud || '#2dd4bf';
    const platformColor = def.visualExperience?.colorPalette?.terrain || def.theme.platform;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>${def.title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap');
        
        :root {
            --bg-color: ${bgColor};
            --player-color: ${playerColor};
            --enemy-color: ${enemyColor};
            --platform-color: ${platformColor};
            --hud-color: ${def.visualExperience?.colorPalette?.hudText || '#38bdf8'};
            --glow-color: ${def.visualExperience?.colorPalette?.glowingAccents || '#22c55e'};
        }

        body, html {
            margin: 0; padding: 0;
            width: 100%; height: 100%;
            background-color: var(--bg-color);
            overflow: hidden;
            font-family: 'Rajdhani', sans-serif;
            touch-action: none;
            user-select: none;
        }
        
        #gameCanvas {
            width: 100%; height: 100%;
            display: block;
        }

        #ui-layer {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 16px;
            box-sizing: border-box;
            z-index: 10;
        }

        .hud-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
        }

        .glass-panel {
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 12px 16px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
            pointer-events: auto;
        }

        .hud-buttons {
            display: flex;
            gap: 8px;
            pointer-events: auto;
        }

        .glass-btn {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            padding: 10px 16px;
            color: rgba(255, 255, 255, 0.9);
            font-family: 'Rajdhani', sans-serif;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }

        .glass-btn:hover {
            background: var(--hud-color);
            color: black;
            border-color: var(--hud-color);
            box-shadow: 0 0 15px var(--hud-color);
            transform: translateY(-1px);
        }

        .glass-btn-danger {
            border-color: rgba(239, 68, 68, 0.4);
        }

        .glass-btn-danger:hover {
            background: #ef4444;
            color: white;
            border-color: #ef4444;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
            transform: translateY(-1px);
        }

        .health-bar-container {
            width: 140px;
            height: 6px;
            background: rgba(0,0,0,0.6);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 4px;
            overflow: hidden;
            margin-top: 6px;
        }

        #hp-bar {
            width: 100%; height: 100%;
            background: linear-gradient(90deg, var(--player-color), #38bdf8);
            transition: width 0.15s ease-out;
        }
        
        .score-box {
            font-family: 'Share Tech Mono', monospace;
            font-size: 28px;
            color: var(--hud-color);
            text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
            letter-spacing: 2px;
            min-width: 80px;
            text-align: center;
        }
        
        #title-display {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(255,255,255,0.55);
            margin-bottom: 2px;
            font-weight: 600;
        }

        #overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(9, 9, 11, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            pointer-events: auto;
            z-index: 99;
        }
        
        #overlay h1 { 
            font-size: 48px; 
            margin-bottom: 8px; 
            text-transform: uppercase; 
            letter-spacing: 4px;
            font-weight: 700;
        }
        #overlay p { 
            font-size: 18px; 
            margin-bottom: 32px; 
            opacity: 0.75; 
            max-width: 450px;
            text-align: center;
            line-height: 1.4;
            font-family: 'Rajdhani', sans-serif;
        }
        
        .primary-btn {
            padding: 12px 28px;
            font-size: 16px;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 700;
            background: transparent;
            color: white;
            border: 2px solid var(--player-color);
            border-radius: 6px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .primary-btn:hover {
            background: var(--player-color);
            color: black;
            box-shadow: 0 0 20px var(--player-color);
            transform: translateY(-2px);
        }

        /* Mobile Controls */
        #mobile-controls {
            display: none;
            position: absolute;
            bottom: 24px;
            left: 24px;
            right: 24px;
            pointer-events: auto;
            justify-content: space-between;
            gap: 32px;
        }
        
        @media (max-width: 768px) {
            #mobile-controls { display: flex; }
            #controls-legend-panel {
                bottom: 110px !important;
                left: 16px !important;
                right: 16px !important;
                max-width: none !important;
                font-size: 11px !important;
                padding: 10px 12px !important;
            }
        }

        .d-pad, .action-pad { display: flex; gap: 12px; }
        .btn {
            width: 56px; height: 56px;
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 20px; font-weight: bold; user-select: none;
            backdrop-filter: blur(8px);
            cursor: pointer;
        }
        .btn:active { background: var(--player-color); color: black; }

        #controls-legend-panel {
            position: absolute;
            bottom: 24px;
            left: 24px;
            max-width: 320px;
            font-size: 12px;
            line-height: 1.45;
            color: rgba(255,255,255,0.85);
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: auto;
            box-sizing: border-box;
            z-index: 95;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    
    <div id="ui-layer">
        <div class="hud-top">
            <div class="glass-panel">
                <div id="title-display">${def.title}</div>
                <div style="font-size: 18px; font-weight: 700; color: white; margin-bottom: 2px; text-transform: uppercase;">
                    ${(def.genreExtensions?.vehiclePhysics?.vehicleRoster?.[0]?.name) || def.title}
                </div>
                <div class="health-bar-container"><div id="hp-bar"></div></div>
                <div style="font-size: 11px; margin-top: 4px; color: rgba(255,255,255,0.45); font-weight: 500;">
                    ${def.winCondition}
                </div>
                <div style="font-size: 11px; margin-top: 4px; color: var(--hud-color); font-weight: bold;">
                    P - LOCATE PLAYER
                </div>
            </div>

            <div class="hud-buttons">
                <button id="btn-locate" class="glass-btn">◎ LOCATE</button>
                <button id="btn-restart" class="glass-btn">↺ RESTART</button>
                <button id="btn-home" class="glass-btn glass-btn-danger">⌂ HOME</button>
            </div>
            
            <div class="glass-panel score-box" id="score-display">0000</div>
        </div>

        <!-- Elegant controls guide and item legend for instant clarity -->
        <div class="glass-panel" id="controls-legend-panel">
            <div style="font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px; color: var(--hud-color); border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center;">
                <span>GUIDE & OBJECT SYSTEM</span>
                <span id="close-guide-btn" style="cursor: pointer; opacity: 0.7; padding: 2px 6px; font-size: 10px; background: rgba(255,255,255,0.08); border-radius: 4px;" onclick="document.getElementById('controls-legend-panel').style.display='none'">✕ HIDE</span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; opacity: 0.8;">NAVIGATION:</div>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 3px 10px; font-family: monospace; align-items: center; background: rgba(0,0,0,0.25); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04); font-size: 11px;">
                    <span style="color: var(--hud-color); font-weight: bold;">[W][A][S][D] / [▲][▼][◄][►]</span>
                    <span style="font-family: 'Rajdhani', sans-serif;">Steer / Move Vehicle</span>
                    
                    <span style="color: var(--hud-color); font-weight: bold;">[SPACEBAR]</span>
                    <span style="font-family: 'Rajdhani', sans-serif;">Jump / Boost</span>
                    
                    <span style="color: var(--hud-color); font-weight: bold;">[P] / [◎ LOCATE]</span>
                    <span style="font-family: 'Rajdhani', sans-serif;">Center Camera</span>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px;">
                <div style="font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; opacity: 0.8;">OBJECT LEGEND:</div>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 6px 10px; align-items: center; background: rgba(0,0,0,0.25); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04); font-size: 11px;">
                    <div style="display: flex; align-items: center; justify-content: center; width: 12px; height: 12px;">
                        <span style="display: block; width: 8px; height: 8px; background: var(--player-color); border-radius: 2px; box-shadow: 0 0 6px var(--player-color);"></span>
                    </div>
                    <span><strong>YOU:</strong> Pilot with controls.</span>

                    <div style="display: flex; align-items: center; justify-content: center; width: 12px; height: 12px;">
                        <span style="display: block; width: 8px; height: 8px; background: ${def.theme.collectible}; transform: rotate(45deg); box-shadow: 0 0 6px ${def.theme.collectible};"></span>
                    </div>
                    <span><strong>CRYSTAL:</strong> +50 Pts (Collect to Score)</span>

                    <div style="display: flex; align-items: center; justify-content: center; width: 12px; height: 12px;">
                        <span style="display: block; width: 8px; height: 8px; background: #f43f5e; border-radius: 2px; box-shadow: 0 0 6px #f43f5e; display: flex; align-items: center; justify-content: center; font-size: 7px; font-weight: bold; color: white;">!</span>
                    </div>
                    <span><strong>HAZARD:</strong> HP penalty (-25 HP on contact)</span>

                    <div style="display: flex; align-items: center; justify-content: center; width: 12px; height: 12px;">
                        <span style="display: block; width: 8px; height: 8px; background: ${def.theme.enemy}; border-radius: 50%; box-shadow: 0 0 6px ${def.theme.enemy};"></span>
                    </div>
                    <span><strong>DRONE SENTINEL:</strong> Chasers (-15 HP)</span>

                    <div style="display: flex; align-items: center; justify-content: center; width: 12px; height: 12px;">
                        <span style="display: block; width: 8px; height: 8px; background: #10b981; border-radius: 2px; box-shadow: 0 0 6px #10b981; display: flex; align-items: center; justify-content: center; font-size: 7px; font-weight: bold; color: white;">+</span>
                    </div>
                    <span><strong>HEALTH PACK:</strong> Heals HP (+25 HP)</span>

                    <div style="display: flex; align-items: center; justify-content: center; width: 12px; height: 12px;">
                        <span style="display: block; width: 10px; height: 10px; border: 2px solid #2dd4bf; border-radius: 50%; box-shadow: 0 0 6px #2dd4bf;"></span>
                    </div>
                    <span><strong>PORTAL:</strong> Exit gateway (Touch to Win)</span>
                </div>
            </div>
        </div>
        
        <!-- Diagnostic Overlay (Development Only) -->
        <div id="debug-overlay" style="position: absolute; bottom: 16px; right: 16px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 8px; padding: 12px; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #38bdf8; text-shadow: 0 0 5px rgba(56,189,248,0.5); pointer-events: auto; z-index: 100; min-width: 160px; line-height: 1.5; display: none;">
            <div style="border-bottom: 1px solid rgba(6, 182, 212, 0.2); margin-bottom: 6px; padding-bottom: 4px; font-weight: bold; text-transform: uppercase; display: flex; justify-content: space-between;">
                <span>NEXUS DIAGNOSTIC</span>
                <span style="color: #22c55e;">●</span>
            </div>
            <div>FPS: <span id="debug-fps">60</span></div>
            <div>GAME LOOP: <span id="debug-loop" style="color: #22c55e;">RUNNING</span></div>
            <div>PLAYER: <span id="debug-player" style="color: #22c55e;">ACTIVE</span></div>
            <div>ENTITIES: <span id="debug-entities">0</span></div>
            <div>INPUT: <span id="debug-input" style="color: #a855f7;">STANDBY</span></div>
            <div>PHYSICS: <span id="debug-physics" style="color: #22c55e;">RUNNING</span></div>
            <div>RENDER: <span id="debug-render" style="color: #22c55e;">RUNNING</span></div>
            <button id="toggle-debug-btn" style="margin-top: 8px; padding: 3px 6px; font-size: 9px; border-radius: 4px; border: 1px solid rgba(6, 182, 212, 0.4); width: 100%; cursor: pointer; background: transparent; color: inherit;" onclick="document.getElementById('debug-overlay').style.display='none'">HIDE OVERLAY</button>
        </div>

        <div id="mobile-controls">
            <div class="d-pad">
                <div class="btn" id="btn-left">←</div>
                <div class="btn" id="btn-right">→</div>
            </div>
            <div class="action-pad">
                <div class="btn" id="btn-up">↑</div>
                <div class="btn" id="btn-down">↓</div>
            </div>
        </div>
    </div>
    
    <div id="overlay">
        <h1 id="overlay-title">GAME OVER</h1>
        <p id="overlay-desc">You died.</p>
        <button class="primary-btn" id="btn-restart-overlay">RESTART EXPEDITION</button>
    </div>

    <script>
        ${runtimeCode}
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        let width, height;

        // Canvas roundRect Polyfill for Older/Sandbox Browsers
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
                if (r === undefined) r = 0;
                if (typeof r === 'number') {
                    r = [r, r, r, r];
                } else if (Array.isArray(r)) {
                    if (r.length === 1) r = [r[0], r[0], r[0], r[0]];
                    else if (r.length === 2) r = [r[0], r[1], r[0], r[1]];
                    else if (r.length === 3) r = [r[0], r[1], r[2], r[1]];
                } else {
                    r = [0, 0, 0, 0];
                }
                const [tl, tr, br, bl] = r;
                this.moveTo(x + tl, y);
                this.lineTo(x + w - tr, y);
                this.quadraticCurveTo(x + w, y, x + w, y + tr);
                this.lineTo(x + w, y + h - br);
                this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
                this.lineTo(x + bl, y + h);
                this.quadraticCurveTo(x, y + h, x, y + h - bl);
                this.lineTo(x, y + tl);
                this.quadraticCurveTo(x, y, x + tl, y);
                return this;
            };
        }

        // Focus frame to capture keys immediately
        window.focus();
        canvas.addEventListener('mousedown', () => window.focus());
        canvas.addEventListener('touchstart', () => window.focus());

        // Game Configuration injected from definition
        const config = {
            gameType: "${def.gameType}",
            archetype: "${def.gameIdentity?.archetype || ''}",
            world: {
                width: ${def.world?.width || 800},
                height: ${def.world?.height || 600}
            },
            colors: {
                bg: "${bgColor}",
                player: "${playerColor}",
                platform: "${platformColor}",
                enemy: "${enemyColor}",
                collectible: "${def.theme.collectible}",
                particle: "${def.theme.particle}"
            },
            physics: {
                gravity: ${def.physics?.gravity || 0},
                jump: ${def.physics?.jumpForce || 0},
                speed: ${def.physics?.movementSpeed || 0},
                friction: ${def.physics?.friction || 0}
            },
            playerShape: "${def.player?.shape || 'square'}",
            cameraFollow: "${def.cameraFollow || 'static'}",
            visualExperience: ${JSON.stringify(def.visualExperience || null)},
            genreExtensions: ${JSON.stringify(def.genreExtensions || null)},
            fuelRate: 15
        };
        console.log("[NEXUS RUNTIME] Config initialized:", config);

        // Seeded Random helper inside sandbox
        let seedVal = parseInt("${def.seed}", 16) || 12345;
        function seedRandom() {
            let t = seedVal += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }

        // Procedural Spline/Noise hill curves for physical climbing
        function getGroundY(x) {
            if (config.gameType !== 'RACING') {
                return null;
            }
            let base = 750;
            let slope1 = Math.sin(x * 0.0006) * 320;
            let slope2 = Math.sin(x * 0.002) * 110;
            let slope3 = Math.cos(x * 0.00015) * 450;
            let bumps = Math.sin(x * 0.02) * 12;
            
            let chasm = 0;
            if (x > 3200 && x < 3500) {
                chasm = (Math.sin((x - 3200) / 300 * Math.PI)) * 180;
            }
            if (x > 6200 && x < 6600) {
                chasm = (Math.sin((x - 6200) / 400 * Math.PI)) * 250;
            }

            return base + slope1 + slope2 + slope3 + bumps + chasm;
        }

        // Active environment layers (stars/particles)
        const environmentStars = [];
        if (config.visualExperience?.environment?.skyEffects?.stars) {
            for (let i = 0; i < 150; i++) {
                environmentStars.push({
                    x: seedRandom() * 3000,
                    y: seedRandom() * 1000,
                    size: seedRandom() * 2 + 1,
                    alpha: seedRandom() * 0.7 + 0.3,
                    speed: seedRandom() * 0.2 + 0.05
                });
            }
        }

        // Engine State Manager
        const Game = {
            state: 'INTRO',
            score: 0,
            hp: 100,
            lastTime: 0,
            reqId: null,
            end(win, msg) {
                this.state = 'END';
                document.getElementById('overlay').style.display = 'flex';
                document.getElementById('overlay-title').innerText = win ? 'VICTORY' : 'EXPEDITION OVER';
                document.getElementById('overlay-title').style.color = win ? '#2dd4bf' : '#ef4444';
                document.getElementById('overlay-desc').innerText = msg;
                
                window.parent.postMessage({
                    type: 'GAME_OVER',
                    payload: { win, score: this.score }
                }, '*');
            },
            damage(amt) {
                this.hp = Math.max(0, this.hp - amt);
                document.getElementById('hp-bar').style.width = this.hp + '%';
                if(this.hp <= 0) this.end(false, "Chassis structural integrity compromised.");
            }
        };

        // Keyboard & Touch Inputs Manager
        const keys = {};
        const eventListeners = [];

        function addLifecycleListener(target, event, handler, options) {
            target.addEventListener(event, handler, options);
            eventListeners.push({ target, event, handler });
        }

        function cleanupLifecycle() {
            if (Game.reqId) {
                cancelAnimationFrame(Game.reqId);
                Game.reqId = null;
            }
            for (let el of eventListeners) {
                el.target.removeEventListener(el.event, el.handler);
            }
            eventListeners.length = 0;
            console.log("[NEXUS RUNTIME] Lifecycle controllers cleaned up.");
        }

        // Keydown/Keyup handlers
        addLifecycleListener(window, 'keydown', e => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'p', 'P'].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
            if (e.code) keys[e.code] = true;
            if (e.key) {
                keys[e.key] = true;
                keys[e.key.toLowerCase()] = true;
            }
            
            // Locate Player Shortcut P
            if (e.key === 'p' || e.key === 'P') {
                Camera.locate(player);
            }
        });

        addLifecycleListener(window, 'keyup', e => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
            if (e.code) keys[e.code] = false;
            if (e.key) {
                keys[e.key] = false;
                keys[e.key.toLowerCase()] = false;
            }
        });

        // Pause/Resume State Control & Key Event Bridge from Parent
        addLifecycleListener(window, 'message', e => {
            if (e.data?.type === 'PAUSE') {
                if (Game.state === 'PLAYING') {
                    Game.state = 'PAUSED';
                }
            } else if (e.data?.type === 'RESUME') {
                if (Game.state === 'INTRO' || Game.state === 'PAUSED' || Game.state === 'END') {
                    // Reset to initial conditions if starting from INTRO or END
                    if (Game.state === 'INTRO' || Game.state === 'END') {
                        if (config.archetype === 'SNAKE') {
                            SnakeGame.init();
                        } else if (config.archetype === 'TETRIS') {
                            TetrisGame.init();
                        } else {
                            player.x = ${def.player.startX};
                            player.y = ${def.player.startY};
                            player.vx = 0;
                            player.vy = 0;
                            player.hp = 100;
                            Game.hp = 100;
                            Game.score = 0;
                            document.getElementById('hp-bar').style.width = '100%';
                            document.getElementById('score-display').innerText = '0000';
                            for (let i of Level.items) i.active = true;
                            for (let o of Level.obstacles) o.active = true;
                        }
                    }
                    Game.state = 'PLAYING';
                }
            } else if (e.data?.type === 'KEY_EVENT') {
                const { subtype, code, key } = e.data;
                const isDown = subtype === 'keydown';
                if (code) keys[code] = isDown;
                if (key) {
                    keys[key] = isDown;
                    keys[key.toLowerCase()] = isDown;
                }
                if (isDown && (key === 'p' || key === 'P')) {
                    Camera.locate(player);
                }
            }
        });

        // Resize Event
        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        addLifecycleListener(window, 'resize', resize);
        resize();

        // Touch handlers for mobile buttons
        const btnMap = { 'btn-left':'ArrowLeft', 'btn-right':'ArrowRight', 'btn-up':'ArrowUp', 'btn-down':'ArrowDown' };
        for(let id in btnMap) {
            let el = document.getElementById(id);
            if(el) {
                addLifecycleListener(el, 'touchstart', e => { e.preventDefault(); keys[btnMap[id]] = true; }, { passive: false });
                addLifecycleListener(el, 'touchend', e => { e.preventDefault(); keys[btnMap[id]] = false; }, { passive: false });
            }
        }

        const Input = {
            left: () => keys['ArrowLeft'] || keys['KeyA'] || keys['a'] || keys['A'],
            right: () => keys['ArrowRight'] || keys['KeyD'] || keys['d'] || keys['D'],
            up: () => keys['ArrowUp'] || keys['KeyW'] || keys['Space'] || keys[' '] || keys['w'] || keys['W'],
            down: () => keys['ArrowDown'] || keys['KeyS'] || keys['s'] || keys['S'],
            update() {}
        };

        // Smooth Camera Follow Controller
        const Camera = {
            x: 0, 
            y: 0, 
            shakeTime: 0,
            locatePulseTime: 0,
            
            update(dt, target) {
                let tx = this.x;
                let ty = this.y;
                
                const isGridGame = (config.archetype === 'SNAKE' || config.archetype === 'TETRIS');

                if (isGridGame || config.cameraFollow === 'NONE') {
                    tx = (config.world.width - width) / 2;
                    ty = (config.world.height - height) / 2;
                } else {
                    if (config.cameraFollow === 'X' || config.cameraFollow === 'BOTH') {
                        tx = target.x - width / 2 + target.w / 2;
                    }
                    if (config.cameraFollow === 'Y' || config.cameraFollow === 'BOTH') {
                        ty = target.y - height / 2 + target.h / 2;
                    }
                    if (config.gameType === 'TOP_DOWN') {
                        tx = target.x - width / 2 + target.w / 2;
                        ty = target.y - height / 2 + target.h / 2;
                    }
                }
                
                const speedMult = this.locatePulseTime > 0 ? 10 : 4.5;
                
                if (isGridGame || config.cameraFollow === 'NONE') {
                    this.x = tx;
                    this.y = ty;
                } else {
                    this.x += (tx - this.x) * speedMult * dt;
                    this.y += (ty - this.y) * speedMult * dt;
                }
                
                // Keep Camera inside boundaries if world is larger than screen
                if (config.world.width > width) {
                    this.x = Math.max(0, Math.min(this.x, config.world.width - width));
                } else {
                    this.x = (config.world.width - width) / 2;
                }
                
                if (config.world.height > height) {
                    this.y = Math.max(0, Math.min(this.y, config.world.height - height));
                } else {
                    this.y = (config.world.height - height) / 2;
                }
                
                if (this.shakeTime > 0) this.shakeTime -= dt;
                if (this.locatePulseTime > 0) this.locatePulseTime -= dt;
            },
            
            locate(target) {
                this.locatePulseTime = 1.0;
                const tx = target.x - width / 2 + target.w / 2;
                const ty = target.y - height / 2 + target.h / 2;
                
                // Slide half-way instantly, let interpolation handle the rest
                this.x = (this.x + tx) / 2;
                this.y = (this.y + ty) / 2;
            },
            
            apply() {
                let sx = 0, sy = 0;
                if(this.shakeTime > 0) {
                    sx = (Math.random()-0.5)*15;
                    sy = (Math.random()-0.5)*15;
                }
                ctx.translate(-Math.floor(this.x) + sx, -Math.floor(this.y) + sy);
            },
            
            shake(dur) { this.shakeTime = dur; }
        };

        // Advanced Particle Engine
        const Particles = {
            list: [],
            burst(x, y, count, color) {
                for(let i=0; i<count; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const v = Math.random() * 220 + 40;
                    this.list.push({
                        x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v,
                        life: 1.2, maxLife: 1.2, color,
                        size: Math.random() * 3 + 2
                    });
                }
            },
            update(dt) {
                for(let i=this.list.length-1; i>=0; i--) {
                    let p = this.list[i];
                    p.x += p.vx * dt; p.y += p.vy * dt;
                    p.life -= dt;
                    if(config.gameType === 'PLATFORMER') p.vy += config.physics.gravity * 30 * dt;
                    if(p.life <= 0) this.list.splice(i, 1);
                }
            },
            draw() {
                for(let p of this.list) {
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
        };

        // Player Authoritative State Rig
        const player = {
            x: ${def.player.startX}, y: ${def.player.startY}, 
            w: ${def.player.width}, h: ${def.player.height},
            vx: 0, vy: 0, angle: 0, grounded: false,
            fuel: 100, maxFuel: 100, rpm: 1000, maxRpm: 8000,
            rotSum: 0, lastAngle: 0, stuntText: "", stuntTime: 0,
            wheelRotation: 0,
            outsideViewportTime: 0,
            
            update(dt) {
                if (config.gameType === 'RACING') {
                    let centerOffset = this.w / 2;
                    let frontWheelX = this.x + centerOffset;
                    let backWheelX = this.x - centerOffset;
                    
                    let gyFront = getGroundY(frontWheelX);
                    let gyBack = getGroundY(backWheelX);
                    let gyMid = (gyFront + gyBack) / 2;
                    
                    let onGround = this.y + this.h >= gyMid - 10;
                    this.grounded = onGround;
                    
                    if (!onGround) {
                        this.vy += config.physics.gravity * 70 * dt;
                        if (Input.left()) {
                            this.angle -= 4.2 * dt;
                            this.rotSum -= 4.2 * dt;
                        }
                        if (Input.right()) {
                            this.angle += 4.2 * dt;
                            this.rotSum += 4.2 * dt;
                        }
                        this.rpm += (1500 - this.rpm) * 3 * dt;
                    } else {
                        this.vy = 0;
                        this.y = gyMid - this.h;
                        
                        let terrainSlope = Math.atan2(gyFront - gyBack, frontWheelX - backWheelX);
                        this.angle += (terrainSlope - this.angle) * 11 * dt;
                        
                        if (this.fuel > 0) {
                            if (Input.up()) {
                                this.vx += config.physics.speed * 45 * dt;
                                this.fuel = Math.max(0, this.fuel - config.fuelRate * dt);
                                this.rpm += (7200 - this.rpm) * 6 * dt;
                                this.wheelRotation += this.vx * 0.1 * dt;
                                if (Math.random() < 0.4) {
                                    Particles.burst(this.x - centerOffset, this.y + this.h, 1, '#ff00ff');
                                }
                            } else {
                                this.vx *= 0.985;
                                this.rpm += (1200 - this.rpm) * 4 * dt;
                            }
                        } else {
                            this.vx *= 0.97;
                            this.rpm += (0 - this.rpm) * 3 * dt;
                        }
                        
                        if (Input.down()) {
                            this.vx -= config.physics.speed * 25 * dt;
                        }

                        if (Math.abs(this.rotSum) >= 5.8) {
                            let totalFlips = Math.floor(Math.abs(this.rotSum) / (Math.PI * 1.85));
                            if (totalFlips > 0) {
                                let pointsAwarded = totalFlips * 600;
                                Game.score += pointsAwarded;
                                document.getElementById('score-display').innerText = String(Game.score).padStart(4, '0');
                                this.stuntText = "STUNT: Flips x" + totalFlips + " landed! +" + pointsAwarded;
                                this.stuntTime = 2.5;
                                Particles.burst(this.x, this.y, 25, '#d946ef');
                            }
                        }
                        this.rotSum = 0;
                    }
                    
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                    
                } else if (config.gameType === 'TOP_DOWN') {
                    let mx = 0, my = 0;
                    if(Input.left()) mx -= 1;
                    if(Input.right()) mx += 1;
                    if(Input.up()) my -= 1;
                    if(Input.down()) my += 1;
                    
                    if(mx!==0 && my!==0) { let len = Math.sqrt(mx*mx+my*my); mx/=len; my/=len; }
                    this.vx += mx * config.physics.speed * 600 * dt;
                    this.vy += my * config.physics.speed * 600 * dt;
                    
                    this.vx *= config.physics.friction;
                    this.vy *= config.physics.friction;
                    
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                } else {
                    // Standard Platformer Movement
                    if(Input.left()) this.vx -= config.physics.speed * 120 * dt;
                    else if(Input.right()) this.vx += config.physics.speed * 120 * dt;
                    else this.vx *= config.physics.friction;
                    
                    if(Input.up() && this.grounded) {
                        this.vy = -config.physics.jump * 60;
                        this.grounded = false;
                        Particles.burst(this.x+this.w/2, this.y+this.h, 12, config.colors.player);
                    }
                    this.vy += config.physics.gravity * 60 * dt;
                    
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                }

                // Rigidly enforce world boundary clamps in gameplay logic (WORLD SPACE)
                if (config.gameType === 'RACING' || config.gameType === 'TOP_DOWN') {
                    this.x = Math.max(20, Math.min(this.x, config.world.width - this.w - 20));
                    this.y = Math.max(20, Math.min(this.y, config.world.height - this.h - 20));
                } else if (config.gameType === 'PLATFORMER') {
                    this.x = Math.max(20, Math.min(this.x, config.world.width - this.w - 20));
                    this.y = Math.max(-1000, this.y); // allow void fall
                }

                // Add active screen boundary physical walls that clamp the character within the screen viewport
                if (Camera && typeof width === 'number' && typeof height === 'number') {
                    const minScrX = Camera.x + 16;
                    const maxScrX = Camera.x + width - this.w - 16;
                    const minScrY = Camera.y + 16;
                    const maxScrY = Camera.y + height - this.h - 16;

                    if (this.x < minScrX) {
                        this.x = minScrX;
                        this.vx = 0;
                    }
                    if (this.x > maxScrX) {
                        this.x = maxScrX;
                        this.vx = 0;
                    }
                    if (this.y < minScrY) {
                        this.y = minScrY;
                        this.vy = 0;
                    }
                    if (this.y > maxScrY) {
                        this.y = maxScrY;
                        if (config.gameType === 'PLATFORMER') {
                            this.grounded = true;
                        }
                        this.vy = 0;
                    }
                }

                // Collisions for Non-Racing styles
                if (config.gameType !== 'RACING') {
                    for(let p of Level.platforms) {
                        if(this.x < p.x+p.w && this.x+this.w > p.x && this.y < p.y+p.h && this.y+this.h > p.y) {
                            if (p.t === 'wall') {
                                if(this.vx > 0) this.x = p.x - this.w;
                                else if(this.vx < 0) this.x = p.x + p.w;
                                this.vx = 0;
                            }
                        }
                    }
                    
                    this.grounded = false;
                    for(let p of Level.platforms) {
                        if(this.x < p.x+p.w && this.x+this.w > p.x && this.y < p.y+p.h && this.y+this.h > p.y) {
                            if (p.t !== 'wall') {
                                if(this.vy > 0) {
                                    this.y = p.y - this.h;
                                    this.grounded = true;
                                } else if(this.vy < 0) {
                                    this.y = p.y + p.h;
                                }
                                this.vy = 0;
                            }
                        }
                    }
                }

                if (this.stuntTime > 0) {
                    this.stuntTime -= dt;
                }

                if(this.y > config.world.height + 400) {
                    Game.end(false, "Expedition vehicle plunged into the void.");
                }
            },
            
            draw() {
                ctx.save();
                ctx.translate(this.x + this.w/2, this.y + this.h/2);
                ctx.rotate(this.angle);

                const glowColor = config.colors.player;
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 15;

                if (config.gameType === 'RACING') {
                    const halfW = this.w / 2;
                    const halfH = this.h / 2;

                    // spoiler
                    ctx.fillStyle = config.colors.player;
                    ctx.fillRect(-halfW - 5, -halfH - 8, 12, 4);
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-halfW, -halfH);
                    ctx.lineTo(-halfW - 3, -halfH - 8);
                    ctx.stroke();

                    // main chassis body
                    ctx.fillStyle = config.colors.player;
                    ctx.beginPath();
                    ctx.roundRect(-halfW, -halfH, this.w - 10, this.h - 12, 6);
                    ctx.fill();

                    // glass canopy cockpit
                    ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
                    ctx.beginPath();
                    ctx.arc(5, -4, 10, Math.PI, 0);
                    ctx.fill();

                    // metallic suspension coils
                    ctx.strokeStyle = '#64748b';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-halfW + 8, halfH - 12);
                    ctx.lineTo(-halfW + 12, halfH - 2);
                    ctx.moveTo(halfW - 18, halfH - 12);
                    ctx.lineTo(halfW - 14, halfH - 2);
                    ctx.stroke();

                    // wheels
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#0f172a';
                    ctx.strokeStyle = config.colors.player;
                    ctx.lineWidth = 3;

                    ctx.beginPath();
                    ctx.arc(-halfW + 10, halfH - 2, 10, 0, Math.PI*2);
                    ctx.fill(); ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(halfW - 12, halfH - 2, 10, 0, Math.PI*2);
                    ctx.fill(); ctx.stroke();

                    // wheel hubs
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(-halfW + 10, halfH - 12); ctx.lineTo(-halfW + 10, halfH + 8);
                    ctx.moveTo(halfW - 12, halfH - 12); ctx.lineTo(halfW - 12, halfH + 8);
                    ctx.stroke();

                } else {
                    ctx.fillStyle = config.colors.player;
                    if (config.playerShape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, this.w/2, 0, Math.PI*2);
                        ctx.fill();
                    } else if (config.playerShape === 'triangle') {
                        ctx.beginPath();
                        ctx.moveTo(-this.w/2, this.h/2);
                        ctx.lineTo(this.w/2, 0);
                        ctx.lineTo(-this.w/2, -this.h/2);
                        ctx.fill();
                    } else {
                        ctx.beginPath();
                        ctx.roundRect(-this.w/2, -this.h/2, this.w, this.h, 6);
                        ctx.fill();
                    }
                }
                
                ctx.restore();

                // Locate reticle overlay ring
                if (Camera.locatePulseTime > 0) {
                    ctx.save();
                    ctx.translate(this.x + this.w/2, this.y + this.h/2);
                    const pulseRadius = this.w * 1.6 + Math.sin(performance.now() * 0.012) * 8;
                    ctx.strokeStyle = 'var(--hud-color)';
                    ctx.lineWidth = 3;
                    ctx.globalAlpha = Camera.locatePulseTime;
                    
                    ctx.beginPath();
                    ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(0, -pulseRadius - 6); ctx.lineTo(0, -pulseRadius + 6);
                    ctx.moveTo(0, pulseRadius - 6); ctx.lineTo(0, pulseRadius + 6);
                    ctx.moveTo(-pulseRadius - 6, 0); ctx.lineTo(-pulseRadius + 6, 0);
                    ctx.moveTo(pulseRadius - 6, 0); ctx.lineTo(pulseRadius + 6, 0);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        };

        // Strict Spawn Position Validation to prevent out-of-bounds or stuck entities
        function isValidSpawn(x, y, w, h) {
            if (x < 50 || x + w > config.world.width - 50) return false;
            if (y < 50 || y + h > config.world.height - 50) return false;
            
            // Player collision check
            if (x < player.x + player.w && x + w > player.x && y < player.y + player.h && y + h > player.y) {
                return false;
            }
            
            // Solid blocks collision check
            for (let p of Level.platforms) {
                if (p.t === 'wall' || p.t === 'platform' || p.t === 'floor') {
                    if (x < p.x + p.w && x + w > p.x && y < p.y + p.h && y + h > p.y) {
                        return false;
                    }
                }
            }
            return true;
        }

        // Entity Spawn Validation and Relocation System
        const Level = {
            platforms: (${JSON.stringify(def.entities.platforms || [])} || []).map(p => ({x:p.x||0, y:p.y||0, w:p.width||100, h:p.height||20, t:p.type||'platform'})),
            enemies: (${JSON.stringify(def.entities.enemies || [])} || []).map(e => ({x:e.x||0, y:e.y||0, w:e.width||30, h:e.height||30, vx:(e.speedX !== undefined ? e.speedX : 2)*60, vy:(e.speedY !== undefined ? e.speedY : 0)*60, startX:e.x||0, startY:e.y||0})),
            items: (${JSON.stringify(def.entities.collectibles || [])} || []).map(c => ({x:c.x||0, y:c.y||0, w:c.width||16, h:c.height||16, type:c.type||'collectible', active:true})),
            obstacles: (${JSON.stringify(def.entities.obstacles || [])} || []).map(o => ({x:o.x||0, y:o.y||0, w:o.width||40, h:o.height||40, active:true})),
            portal: ${JSON.stringify(def.entities.portal || null)},
            fuelCanisters: [],
            
            init() {
                if (config.gameType === 'RACING') {
                    for (let x = 600; x < config.world.width; x += 1100 + seedRandom() * 400) {
                        this.fuelCanisters.push({
                            x: x,
                            y: getGroundY(x) - 45,
                            w: 22,
                            h: 22,
                            active: true
                        });
                    }
                    this.items = [];
                    for (let x = 400; x < config.world.width - 500; x += 220) {
                        const isHealth = (Math.floor(x / 220) % 4 === 0);
                        this.items.push({
                            x: x,
                            y: getGroundY(x) - 30,
                            w: isHealth ? 20 : 16,
                            h: isHealth ? 20 : 16,
                            type: isHealth ? 'health' : 'collectible',
                            active: true
                        });
                    }
                } else {
                    // Collectibles validation and relocation to prevent spawning behind walls or out of bounds
                    for (let i of this.items) {
                        let attempts = 0;
                        while (!isValidSpawn(i.x, i.y, i.w, i.h) && attempts < 50) {
                            i.x = 100 + seedRandom() * (config.world.width - 200);
                            i.y = 100 + seedRandom() * (config.world.height - 200);
                            attempts++;
                        }
                    }
                    // Enemies validation
                    for (let e of this.enemies) {
                        let attempts = 0;
                        while (!isValidSpawn(e.x, e.y, e.w, e.h) && attempts < 50) {
                            e.x = 200 + seedRandom() * (config.world.width - 400);
                            e.y = 200 + seedRandom() * (config.world.height - 400);
                            attempts++;
                        }
                        e.startX = e.x;
                        e.startY = e.y;
                    }
                }
            },

            update(dt) {
                // Enemies update
                for(let e of this.enemies) {
                    if (config.gameType === 'TOP_DOWN') {
                        let dx = player.x - e.x;
                        let dy = player.y - e.y;
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < 400) {
                            e.x += (dx/dist) * 90 * dt;
                            e.y += (dy/dist) * 90 * dt;
                        }
                    } else {
                        e.x += e.vx * dt;
                        if(Math.abs(e.x - e.startX) > 150) e.vx *= -1;
                    }

                    // Damage
                    if (player.x < e.x + e.w && player.x + player.w > e.x && 
                        player.y < e.y + e.h && player.y + player.h > e.y) {
                        Game.damage(15);
                        Camera.shake(0.18);
                        player.vx = player.x < e.x ? -250 : 250;
                        Particles.burst(player.x, player.y, 8, '#ef4444');
                    }
                }

                // Obstacles
                for(let o of this.obstacles) {
                    if(!o.active) continue;
                    if (player.x < o.x + o.w && player.x + player.w > o.x && 
                        player.y < o.y + o.h && player.y + player.h > o.y) {
                        Game.damage(25);
                        Camera.shake(0.25);
                        player.vx = -180;
                        Particles.burst(o.x+o.w/2, o.y+o.h/2, 15, '#fbbf24');
                        o.active = false;
                    }
                }

                // Collectibles
                for(let i of this.items) {
                    if(i.active && player.x < i.x + i.w && player.x + player.w > i.x &&
                        player.y < i.y + i.h && player.y + player.h > i.y) {
                        i.active = false;
                        if (i.type === 'health') {
                            Game.hp = Math.min(100, Game.hp + 25);
                            document.getElementById('hp-bar').style.width = Game.hp + '%';
                            Particles.burst(i.x + i.w/2, i.y + i.h/2, 15, '#10b981');
                        } else {
                            Game.score += 50;
                            document.getElementById('score-display').innerText = String(Game.score).padStart(4, '0');
                            Particles.burst(i.x + i.w/2, i.y + i.h/2, 10, config.colors.collectible || '#f59e0b');
                        }
                    }
                }

                // Fuel
                for(let fc of this.fuelCanisters) {
                    if (fc.active && player.x < fc.x + fc.w && player.x + player.w > fc.x &&
                        player.y < fc.y + fc.h && player.y + player.h > fc.y) {
                        fc.active = false;
                        player.fuel = Math.min(player.maxFuel, player.fuel + 60);
                        Game.score += 150;
                        document.getElementById('score-display').innerText = String(Game.score).padStart(4, '0');
                        Particles.burst(fc.x, fc.y, 25, '#22c55e');
                    }
                }

                // Victory check
                if(this.portal) {
                    let p = this.portal;
                    if(player.x < p.x + p.w && player.x + player.w > p.x &&
                        player.y < p.y + p.h && player.y + player.h > p.y) {
                        Game.end(true, "Stage complete! Cosmic milestone unlocked.");
                    }
                }
            },
            
            draw(time) {
                ctx.save();
                ctx.fillStyle = config.colors.bg;
                ctx.fillRect(0, 0, width, height);

                if (config.visualExperience?.environment?.skyEffects?.stars) {
                    ctx.fillStyle = '#ffffff';
                    for (let s of environmentStars) {
                        let sx = (s.x - Camera.x * s.speed) % width;
                        if (sx < 0) sx += width;
                        ctx.globalAlpha = s.alpha * (0.6 + Math.sin(time * 0.003 + s.x) * 0.4);
                        ctx.fillRect(sx, s.y, s.size, s.size);
                    }
                    ctx.globalAlpha = 1;
                }

                // Themes
                if (config.visualExperience?.environment?.atmosphereType === 'synthwave') {
                    const sunGrad = ctx.createLinearGradient(width/2, 100, width/2, 450);
                    sunGrad.addColorStop(0, '#f43f5e');
                    sunGrad.addColorStop(0.5, '#ec4899');
                    sunGrad.addColorStop(1, '#eab308');
                    ctx.fillStyle = sunGrad;
                    ctx.beginPath();
                    ctx.arc(width/2, 350, 140, 0, Math.PI, true);
                    ctx.fill();

                    ctx.fillStyle = config.colors.bg;
                    for (let sy = 250; sy < 350; sy += 12) {
                        ctx.fillRect(width/2 - 150, sy, 300, 3);
                    }
                } else if (config.visualExperience?.environment?.atmosphereType === 'aurora') {
                    ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)';
                    ctx.lineWidth = 18;
                    ctx.beginPath();
                    for (let lx = 0; lx < width; lx += 20) {
                        let ly = 150 + Math.sin(lx * 0.003 + time * 0.001) * 45;
                        if (lx === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly);
                    }
                    ctx.stroke();
                }

                ctx.restore();

                ctx.save();
                Camera.apply();

                if (config.gameType === 'RACING') {
                    const terrainColor = config.colors.platform;
                    ctx.fillStyle = terrainColor;
                    ctx.strokeStyle = config.colors.player;
                    ctx.lineWidth = 4;
                    
                    const drawStep = 8;
                    const startX = Math.floor(Camera.x - 200);
                    const endX = Math.floor(Camera.x + width + 200);

                    ctx.beginPath();
                    ctx.moveTo(startX, getGroundY(startX));
                    for (let lx = startX; lx <= endX; lx += drawStep) {
                        ctx.lineTo(lx, getGroundY(lx));
                    }
                    ctx.lineTo(endX, config.world.height + 500);
                    ctx.lineTo(startX, config.world.height + 500);
                    ctx.closePath();
                    ctx.fill();

                    if (config.visualExperience?.environment?.groundStyle?.pattern === 'wireframe') {
                        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
                        ctx.lineWidth = 1;
                        for (let lx = startX - (startX % 40); lx <= endX; lx += 40) {
                            ctx.beginPath();
                            ctx.moveTo(lx, getGroundY(lx));
                            ctx.lineTo(lx, getGroundY(lx) + 350);
                            ctx.stroke();
                        }
                    } else if (config.visualExperience?.environment?.groundStyle?.pattern === 'layered-stripes') {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                        for (let sy = 700; sy < 1400; sy += 35) {
                            ctx.fillRect(startX, sy, endX - startX, 8);
                        }
                    }

                    for(let fc of this.fuelCanisters) {
                        if (!fc.active) continue;
                        ctx.save();
                        ctx.translate(fc.x + fc.w/2, fc.y + fc.h/2 + Math.sin(time/220)*6);
                        ctx.rotate(time * 0.003);
                        ctx.fillStyle = '#22c55e';
                        ctx.shadowColor = '#22c55e';
                        ctx.shadowBlur = 12;
                        ctx.beginPath();
                        ctx.roundRect(-fc.w/2, -fc.h/2, fc.w, fc.h, 4);
                        ctx.fill();
                        
                        ctx.fillStyle = '#fff';
                        ctx.font = '10px monospace';
                        ctx.fillText('F', -3, 3);
                        ctx.restore();
                    }

                } else {
                    for(let p of this.platforms) {
                        ctx.fillStyle = config.colors.platform;
                        if(p.t === 'wall') ctx.fillStyle = '#1e293b';
                        ctx.beginPath();
                        ctx.roundRect(p.x, p.y, p.w, p.h, 6);
                        ctx.fill();
                    }
                }

                for(let o of this.obstacles) {
                    if(!o.active) continue;
                    ctx.save();
                    ctx.translate(o.x, o.y);
                    
                    // Danger border glow
                    ctx.shadowColor = '#ef4444';
                    ctx.shadowBlur = 10;
                    
                    // Base hazard structure
                    ctx.fillStyle = '#f43f5e';
                    ctx.beginPath();
                    ctx.roundRect(0, 0, o.w, o.h, 6);
                    ctx.fill();
                    
                    // Disable shadow for inner patterns
                    ctx.shadowBlur = 0;
                    
                    // Clip caution stripes to obstacle bounds
                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(0, 0, o.w, o.h, 6);
                    ctx.clip();
                    
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 4;
                    for (let lx = -o.h; lx < o.w + o.h; lx += 12) {
                        ctx.beginPath();
                        ctx.moveTo(lx, 0);
                        ctx.lineTo(lx + o.h, o.h);
                        ctx.stroke();
                    }
                    ctx.restore();
                    
                    // High-contrast caution border
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(0, 0, o.w, o.h, 6);
                    ctx.stroke();

                    // Warning exclamation indicator
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 14px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('!', o.w/2, o.h/2);
                    
                    ctx.restore();
                }

                for(let i of this.items) {
                    if(!i.active) continue;
                    ctx.save();
                    const bobY = Math.sin(time / 200 + i.x) * 4;
                    ctx.translate(i.x + i.w/2, i.y + i.h/2 + bobY);
                    
                    if (i.type === 'health') {
                        // Glowing Green Health pack
                        ctx.shadowColor = '#10b981';
                        ctx.shadowBlur = 12;
                        
                        // Rounded box shape
                        ctx.fillStyle = '#10b981';
                        ctx.beginPath();
                        ctx.roundRect(-i.w/2, -i.h/2, i.w, i.h, 4);
                        ctx.fill();
                        
                        // White cross inside
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = '#ffffff';
                        const cw = i.w / 4;
                        const ch = i.h / 1.5;
                        ctx.fillRect(-cw/2, -ch/2, cw, ch);
                        ctx.fillRect(-ch/2, -cw/2, ch, cw);
                    } else {
                        // Spinning rotation
                        ctx.rotate(time * 0.003 + i.x);
                        
                        // Soft collectible glow
                        ctx.shadowColor = config.colors.collectible || '#f59e0b';
                        ctx.shadowBlur = 10;
                        
                        // High fidelity gem shape (Diamond)
                        ctx.fillStyle = config.colors.collectible || '#f59e0b';
                        ctx.beginPath();
                        ctx.moveTo(0, -i.h/2 - 2);
                        ctx.lineTo(i.w/2 + 2, 0);
                        ctx.lineTo(0, i.h/2 + 2);
                        ctx.lineTo(-i.w/2 - 2, 0);
                        ctx.closePath();
                        ctx.fill();

                        // Shiny inner facet core
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.moveTo(0, -i.h/4);
                        ctx.lineTo(i.w/4, 0);
                        ctx.lineTo(0, i.h/4);
                        ctx.lineTo(-i.w/4, 0);
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    ctx.restore();
                }

                if(this.portal) {
                    let p = this.portal;
                    ctx.save();
                    if(config.gameType === 'RACING') {
                        ctx.fillStyle = 'rgba(45, 212, 191, 0.15)';
                        ctx.fillRect(p.x, p.y - 200, 80, 500);
                        
                        ctx.fillStyle = '#ffffff';
                        for (let cy = p.y - 200; cy < p.y + 300; cy += 20) {
                            if ((cy/20)%2===0) {
                                ctx.fillRect(p.x, cy, 40, 20);
                            } else {
                                ctx.fillRect(p.x + 40, cy, 40, 20);
                            }
                        }
                    } else {
                        // High fidelity spinning portal
                        ctx.translate(p.x + p.w/2, p.y + p.h/2);
                        ctx.rotate(time * 0.001);
                        
                        // Outer event horizon glow
                        const pulse = 40 + Math.sin(time / 150) * 5;
                        const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, pulse);
                        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                        grad.addColorStop(0.3, 'rgba(45, 212, 191, 0.85)');
                        grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
                        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                        
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(0, 0, pulse, 0, Math.PI*2);
                        ctx.fill();
                    }
                    ctx.restore();
                }

                for(let e of this.enemies) {
                    ctx.save();
                    ctx.translate(e.x + e.w/2, e.y + e.h/2);
                    
                    // Animated range sensor pulse
                    const rangePulse = e.w/2 + 6 + Math.sin(time / 120) * 4;
                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, rangePulse, 0, Math.PI*2);
                    ctx.stroke();

                    // Drone threat sentinel body
                    ctx.shadowColor = config.colors.enemy || '#ef4444';
                    ctx.shadowBlur = 12;
                    ctx.fillStyle = config.colors.enemy || '#b91c1c';
                    ctx.beginPath();
                    ctx.arc(0, 0, e.w/2, 0, Math.PI*2);
                    ctx.fill();
                    
                    // Secondary protective chassis ring
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, e.w/2 - 2, 0, Math.PI*2);
                    ctx.stroke();

                    // Central blinking mechanical eye core
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(0, 0, e.w/5, 0, Math.PI*2);
                    ctx.fill();

                    // Blinking indicator
                    if (Math.floor(time / 300) % 2 === 0) {
                        ctx.fillStyle = '#ef4444';
                        ctx.beginPath();
                        ctx.arc(0, 0, e.w/10, 0, Math.PI*2);
                        ctx.fill();
                    }

                    // Threat sensor crosshair markers
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(-e.w/2 - 3, 0); ctx.lineTo(-e.w/2 + 2, 0);
                    ctx.moveTo(e.w/2 - 2, 0); ctx.lineTo(e.w/2 + 3, 0);
                    ctx.moveTo(0, -e.h/2 - 3); ctx.lineTo(0, -e.h/2 + 2);
                    ctx.moveTo(0, e.h/2 - 2); ctx.lineTo(0, e.h/2 + 3);
                    ctx.stroke();
                    
                    ctx.restore();
                }

                ctx.restore();
            }
        };

        // SNAKE GAME Engine Branch
        const SnakeGame = {
            gridSize: 25,
            cols: 0,
            rows: 0,
            body: [],
            dir: {x: 1, y: 0},
            nextDir: {x: 1, y: 0},
            food: {x: 5, y: 5},
            tickTimer: 0,
            tickRate: 0.15,
            
            init() {
                this.cols = Math.floor(config.world.width / this.gridSize);
                this.rows = Math.floor(config.world.height / this.gridSize);
                const cx = Math.floor(this.cols / 2);
                const cy = Math.floor(this.rows / 2);
                this.body = [
                    {x: cx, y: cy},
                    {x: cx - 1, y: cy},
                    {x: cx - 2, y: cy}
                ];
                this.dir = {x: 1, y: 0};
                this.nextDir = {x: 1, y: 0};
                this.spawnFood();
                Game.hp = 100;
                Game.score = 0;
            },
            
            spawnFood() {
                let attempts = 0;
                while (attempts < 100) {
                    const fx = Math.floor(seedRandom() * (this.cols - 2)) + 1;
                    const fy = Math.floor(seedRandom() * (this.rows - 2)) + 1;
                    
                    let onSnake = false;
                    for (let segment of this.body) {
                        if (segment.x === fx && segment.y === fy) {
                            onSnake = true;
                            break;
                        }
                    }
                    if (!onSnake) {
                        this.food = {x: fx, y: fy};
                        return;
                    }
                    attempts++;
                }
            },
            
            update(dt) {
                this.tickTimer += dt;
                
                if (Game.state === 'INTRO') {
                    // Smart pathfinding step for autoplay demo
                    const head = this.body[0];
                    if (head) {
                        const tx = this.food.x;
                        const ty = this.food.y;
                        let possibleDirs = [
                            {x: 1, y: 0},
                            {x: -1, y: 0},
                            {x: 0, y: 1},
                            {x: 0, y: -1}
                        ];
                        // Filter out reverse dir and collisions
                        possibleDirs = possibleDirs.filter(d => {
                            if (d.x === -this.dir.x && d.y === -this.dir.y) return false;
                            const nx = head.x + d.x;
                            const ny = head.y + d.y;
                            if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) return false;
                            for (let segment of this.body) {
                                if (segment.x === nx && segment.y === ny) return false;
                            }
                            return true;
                        });
                        if (possibleDirs.length > 0) {
                            // Sort by Manhattan distance to food
                            possibleDirs.sort((a, b) => {
                                const distA = Math.abs((head.x + a.x) - tx) + Math.abs((head.y + a.y) - ty);
                                const distB = Math.abs((head.x + b.x) - tx) + Math.abs((head.y + b.y) - ty);
                                return distA - distB;
                            });
                            this.nextDir = possibleDirs[0];
                        }
                    }
                } else {
                    if (Input.left() && this.dir.x === 0) this.nextDir = {x: -1, y: 0};
                    if (Input.right() && this.dir.x === 0) this.nextDir = {x: 1, y: 0};
                    if (Input.up() && this.dir.y === 0) this.nextDir = {x: 0, y: -1};
                    if (Input.down() && this.dir.y === 0) this.nextDir = {x: 0, y: 1};
                }
                
                if (this.tickTimer >= this.tickRate) {
                    this.tickTimer = 0;
                    this.dir = this.nextDir;
                    
                    const head = this.body[0];
                    const newHead = {x: head.x + this.dir.x, y: head.y + this.dir.y};
                    
                    if (newHead.x < 0 || newHead.x >= this.cols || newHead.y < 0 || newHead.y >= this.rows) {
                        if (Game.state !== 'INTRO') {
                            Game.end(false, "Boundary collision detected. Mission over.");
                        }
                        return;
                    }
                    
                    for (let segment of this.body) {
                        if (segment.x === newHead.x && segment.y === newHead.y) {
                            if (Game.state !== 'INTRO') {
                                Game.end(false, "Self-intersection detected. Mission over.");
                            }
                            return;
                        }
                    }
                    
                    this.body.unshift(newHead);
                    
                    if (newHead.x === this.food.x && newHead.y === this.food.y) {
                        Game.score += 100;
                        document.getElementById('score-display').innerText = String(Game.score).padStart(4, '0');
                        Particles.burst(this.food.x * this.gridSize + this.gridSize/2, this.food.y * this.gridSize + this.gridSize/2, 15, '#22c55e');
                        this.spawnFood();
                        this.tickRate = Math.max(0.06, 0.15 - Math.floor(Game.score / 1000) * 0.01);
                    } else {
                        this.body.pop();
                    }
                }
            },
            
            draw() {
                ctx.save();
                ctx.fillStyle = config.colors.bg;
                ctx.fillRect(0, 0, width, height);

                ctx.save();
                Camera.apply();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
                for (let c = 0; c < this.cols; c++) {
                    for (let r = 0; r < this.rows; r++) {
                        if ((c + r) % 2 === 0) {
                            ctx.fillRect(c * this.gridSize, r * this.gridSize, this.gridSize, this.gridSize);
                        }
                    }
                }
                
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
                ctx.lineWidth = 4;
                ctx.strokeRect(0, 0, this.cols * this.gridSize, this.rows * this.gridSize);
                
                ctx.fillStyle = '#ef4444';
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(this.food.x * this.gridSize + this.gridSize/2, this.food.y * this.gridSize + this.gridSize/2, this.gridSize/2 - 2, 0, Math.PI*2);
                ctx.fill();
                
                ctx.shadowBlur = 0;
                for (let i = 0; i < this.body.length; i++) {
                    const segment = this.body[i];
                    ctx.fillStyle = i === 0 ? 'var(--glow-color)' : 'var(--player-color)';
                    ctx.beginPath();
                    ctx.roundRect(segment.x * this.gridSize + 1, segment.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2, 4);
                    ctx.fill();
                }
                ctx.restore();
                ctx.restore();
            }
        };

        // TETRIS GAME Engine Branch
        const TetrisGame = {
            gridSize: 26,
            cols: 10,
            rows: 20,
            grid: [],
            currentPiece: null,
            tickTimer: 0,
            tickRate: 0.8,
            
            SHAPES: {
                I: { matrix: [[1,1,1,1]], color: '#06b6d4' },
                O: { matrix: [[1,1],[1,1]], color: '#eab308' },
                T: { matrix: [[0,1,0],[1,1,1]], color: '#a855f7' },
                S: { matrix: [[0,1,1],[1,1,0]], color: '#22c55e' },
                Z: { matrix: [[1,1,0],[0,1,1]], color: '#ef4444' },
                J: { matrix: [[1,0,0],[1,1,1]], color: '#3b82f6' },
                L: { matrix: [[0,0,1],[1,1,1]], color: '#f97316' }
            },
            
            init() {
                this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
                this.spawnPiece();
                Game.hp = 100;
                Game.score = 0;
                this.tickRate = 0.8;
            },
            
            spawnPiece() {
                const keysList = Object.keys(this.SHAPES);
                const rKey = keysList[Math.floor(seedRandom() * keysList.length)];
                const shape = this.SHAPES[rKey];
                
                this.currentPiece = {
                    matrix: shape.matrix,
                    color: shape.color,
                    x: Math.floor((this.cols - shape.matrix[0].length) / 2),
                    y: 0
                };
                
                if (this.checkCollision(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y)) {
                    Game.end(false, "Grid fully occupied. Mission over.");
                }
            },
            
            checkCollision(matrix, px, py) {
                for (let r = 0; r < matrix.length; r++) {
                    for (let c = 0; c < matrix[r].length; c++) {
                        if (matrix[r][c]) {
                            const nextX = px + c;
                            const nextY = py + r;
                            
                            if (nextX < 0 || nextX >= this.cols || nextY >= this.rows) {
                                return true;
                            }
                            if (nextY >= 0 && this.grid[nextY][nextX]) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            },
            
            rotate(matrix) {
                const n = matrix.length;
                const m = matrix[0].length;
                const rotated = Array(m).fill(null).map(() => Array(n).fill(0));
                for (let r = 0; r < n; r++) {
                    for (let c = 0; c < m; c++) {
                        rotated[c][n - 1 - r] = matrix[r][c];
                    }
                }
                return rotated;
            },
            
            merge() {
                const m = this.currentPiece.matrix;
                for (let r = 0; r < m.length; r++) {
                    for (let c = 0; c < m[r].length; c++) {
                        if (m[r][c]) {
                            const gy = this.currentPiece.y + r;
                            const gx = this.currentPiece.x + c;
                            if (gy >= 0) {
                                this.grid[gy][gx] = this.currentPiece.color;
                            }
                        }
                    }
                }
            },
            
            clearLines() {
                let linesCleared = 0;
                for (let r = this.rows - 1; r >= 0; r--) {
                    if (this.grid[r].every(cell => cell !== null)) {
                        this.grid.splice(r, 1);
                        this.grid.unshift(Array(this.cols).fill(null));
                        linesCleared++;
                        r++;
                    }
                }
                if (linesCleared > 0) {
                    const points = [0, 100, 300, 500, 800];
                    Game.score += points[Math.min(linesCleared, 4)];
                    document.getElementById('score-display').innerText = String(Game.score).padStart(4, '0');
                    this.tickRate = Math.max(0.15, 0.8 - Math.floor(Game.score / 1000) * 0.08);
                }
            },
            
            lastInputTime: 0,
            
            update(dt) {
                const now = performance.now();
                
                if (now - this.lastInputTime > 120) {
                    if (Input.left()) {
                        if (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x - 1, this.currentPiece.y)) {
                            this.currentPiece.x--;
                            this.lastInputTime = now;
                        }
                    }
                    if (Input.right()) {
                        if (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x + 1, this.currentPiece.y)) {
                            this.currentPiece.x++;
                            this.lastInputTime = now;
                        }
                    }
                    if (Input.up()) {
                        const rotated = this.rotate(this.currentPiece.matrix);
                        if (!this.checkCollision(rotated, this.currentPiece.x, this.currentPiece.y)) {
                            this.currentPiece.matrix = rotated;
                            this.lastInputTime = now;
                        }
                    }
                }
                
                const currentTickRate = Input.down() ? 0.05 : this.tickRate;
                
                this.tickTimer += dt;
                if (this.tickTimer >= currentTickRate) {
                    this.tickTimer = 0;
                    if (!this.checkCollision(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y + 1)) {
                        this.currentPiece.y++;
                    } else {
                        this.merge();
                        this.clearLines();
                        this.spawnPiece();
                    }
                }
            },
            
            draw() {
                ctx.save();
                ctx.fillStyle = config.colors.bg;
                ctx.fillRect(0, 0, width, height);

                ctx.save();
                Camera.apply();

                const boardWidth = this.cols * this.gridSize;
                const boardHeight = this.rows * this.gridSize;
                const startX = (config.world.width - boardWidth) / 2;
                const startY = (config.world.height - boardHeight) / 2;
                
                ctx.translate(startX, startY);
                
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, boardWidth, boardHeight);
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                for (let c = 0; c <= this.cols; c++) {
                    ctx.beginPath();
                    ctx.moveTo(c * this.gridSize, 0);
                    ctx.lineTo(c * this.gridSize, boardHeight);
                    ctx.stroke();
                }
                for (let r = 0; r <= this.rows; r++) {
                    ctx.beginPath();
                    ctx.moveTo(0, r * this.gridSize);
                    ctx.lineTo(boardWidth, r * this.gridSize);
                    ctx.stroke();
                }
                
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
                ctx.lineWidth = 4;
                ctx.strokeRect(0, 0, boardWidth, boardHeight);
                
                for (let r = 0; r < this.rows; r++) {
                    for (let c = 0; c < this.cols; c++) {
                        const cellColor = this.grid[r][c];
                        if (cellColor) {
                            ctx.fillStyle = cellColor;
                            ctx.fillRect(c * this.gridSize + 1, r * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
                        }
                    }
                }
                
                if (this.currentPiece) {
                    const m = this.currentPiece.matrix;
                    ctx.fillStyle = this.currentPiece.color;
                    for (let r = 0; r < m.length; r++) {
                        for (let c = 0; c < m[r].length; c++) {
                            if (m[r][c]) {
                                const px = (this.currentPiece.x + c) * this.gridSize;
                                const py = (this.currentPiece.y + r) * this.gridSize;
                                ctx.fillRect(px + 1, py + 1, this.gridSize - 2, this.gridSize - 2);
                            }
                        }
                    }
                }
                
                ctx.restore();
                ctx.restore();
            }
        };

        // Draw Automotive Sci-Fi Dashboard & Gauge layers
        function drawAutomotiveHUD() {
            if (config.gameType !== 'RACING') return;

            const hudX = width - 260;
            const hudY = height - 160;

            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(hudX, hudY, 240, 140, 12);
            ctx.fill(); ctx.stroke();

            const speedKph = Math.floor(Math.abs(player.vx) * 0.4);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(hudX + 70, hudY + 70, 45, Math.PI * 0.8, Math.PI * 2.2);
            ctx.stroke();

            const needleAngle = Math.PI * 0.8 + (Math.min(speedKph, 180) / 180) * (Math.PI * 1.4);
            ctx.strokeStyle = 'var(--hud-color)';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(hudX + 70, hudY + 70);
            ctx.lineTo(hudX + 70 + Math.cos(needleAngle)*42, hudY + 70 + Math.sin(needleAngle)*42);
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = '700 24px "Share Tech Mono", monospace';
            ctx.fillText(String(speedKph).padStart(3, '0'), hudX + 48, hudY + 130);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px monospace';
            ctx.fillText('KPH', hudX + 94, hudY + 128);

            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(hudX + 160, hudY + 30, 16, 80);
            const fuelHeight = (player.fuel / player.maxFuel) * 80;
            const fuelCol = player.fuel < 25 ? '#ef4444' : 'var(--glow-color)';
            ctx.fillStyle = fuelCol;
            ctx.fillRect(hudX + 160, hudY + 30 + (80 - fuelHeight), 16, fuelHeight);

            ctx.fillStyle = '#fff';
            ctx.font = '700 11px sans-serif';
            ctx.fillText('FUEL', hudX + 154, hudY + 124);

            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '10px monospace';
            ctx.fillText('RPM: ' + Math.floor(player.rpm), hudX + 135, hudY + 20);

            let pitchDeg = Math.floor(player.angle * (180 / Math.PI));
            ctx.fillText('PITCH: ' + pitchDeg + '°', hudX + 25, hudY + 20);

            ctx.restore();

            if (player.stuntTime > 0) {
                ctx.save();
                ctx.fillStyle = '#fde047';
                ctx.shadowColor = '#fde047';
                ctx.shadowBlur = 15;
                ctx.font = '700 28px "Rajdhani", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(player.stuntText, width/2, 140 + (2.5 - player.stuntTime) * 15);
                ctx.restore();
            }
        }

        // Draw Screen Boundary Energy Walls
        function drawScreenBoundaryWalls(time) {
            if (config.archetype === 'SNAKE' || config.archetype === 'TETRIS') return;
            if (Game.state === 'END') return;

            ctx.save();
            ctx.shadowColor = config.colors.player || '#26f';
            ctx.shadowBlur = 12;
            ctx.lineWidth = 4;
            
            const borderGlow = ctx.createLinearGradient(0, 0, width, 0);
            borderGlow.addColorStop(0, config.colors.hud || '#2dd4bf');
            borderGlow.addColorStop(0.5, config.colors.player || '#38bdf8');
            borderGlow.addColorStop(1, config.colors.hud || '#2dd4bf');
            
            ctx.strokeStyle = borderGlow;
            ctx.strokeRect(8, 8, width - 16, height - 16);
            ctx.shadowBlur = 0;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 2;
            const stripeSpacing = 40;
            const offset = (time * 0.03) % stripeSpacing;

            // Draw stripes along Top wall
            ctx.save();
            ctx.beginPath();
            ctx.rect(8, 8, width - 16, 8);
            ctx.clip();
            for (let sx = -stripeSpacing; sx < width + stripeSpacing; sx += stripeSpacing) {
                ctx.moveTo(sx + offset, 8);
                ctx.lineTo(sx + offset - 8, 16);
            }
            ctx.stroke();
            ctx.restore();

            // Draw stripes along Bottom wall
            ctx.save();
            ctx.beginPath();
            ctx.rect(8, height - 16, width - 16, 8);
            ctx.clip();
            for (let sx = -stripeSpacing; sx < width + stripeSpacing; sx += stripeSpacing) {
                ctx.moveTo(sx - offset, height - 16);
                ctx.lineTo(sx - offset - 8, height - 8);
            }
            ctx.stroke();
            ctx.restore();

            // Draw stripes along Left wall
            ctx.save();
            ctx.beginPath();
            ctx.rect(8, 8, 8, height - 16);
            ctx.clip();
            for (let sy = -stripeSpacing; sy < height + stripeSpacing; sy += stripeSpacing) {
                ctx.moveTo(8, sy + offset);
                ctx.lineTo(16, sy + offset - 8);
            }
            ctx.stroke();
            ctx.restore();

            // Draw stripes along Right wall
            ctx.save();
            ctx.beginPath();
            ctx.rect(width - 16, 8, 8, height - 16);
            ctx.clip();
            for (let sy = -stripeSpacing; sy < height + stripeSpacing; sy += stripeSpacing) {
                ctx.moveTo(width - 16, sy - offset);
                ctx.lineTo(width - 8, sy - offset - 8);
            }
            ctx.stroke();
            ctx.restore();

            ctx.restore();
        }

        let fpsCounter = 0;
        let lastFpsUpdate = performance.now();
        let activeFps = 60;

        // Initialize Game Runtime
        const canvas = document.getElementById('gameCanvas');
        canvas.width = canvas.clientWidth * window.devicePixelRatio;
        canvas.height = canvas.clientHeight * window.devicePixelRatio;
        
        console.log("[NEXUS RUNTIME] Canvas initialized:", canvas.width, canvas.height);
        
        const ctx = canvas.getContext('2d', { alpha: false });
        
        const Game = RuntimeFactory.createRuntime(config);
        
        // Add interactive HUD button events
        document.getElementById('btn-locate').addEventListener('click', () => {
            // Camera.locate(player); // This needs to be handled by Game
        });
        document.getElementById('btn-restart').addEventListener('click', () => {
            location.reload();
        });
        document.getElementById('btn-restart-overlay').addEventListener('click', () => {
            location.reload();
        });
        document.getElementById('btn-home').addEventListener('click', () => {
            window.parent.postMessage({ type: 'HOME' }, '*');
        });

        // Main game tick function
        function gameLoop(time) {
            const dt = Math.min((time - Game.lastTime) / 1000, 0.08);
            Game.lastTime = time;
            
            Input.update();
            
            Game.update(dt);
            
            // Draw
            Game.render(ctx);
            
            // Atmospheric cinematic vignette
            const grad = ctx.createRadialGradient(width/2, height/2, height*0.4, width/2, height/2, height);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.65)');
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,width,height);

            // Calculate active FPS
            fpsCounter++;
            if (time - lastFpsUpdate >= 1000) {
                activeFps = Math.round((fpsCounter * 1000) / (time - lastFpsUpdate));
                fpsCounter = 0;
                lastFpsUpdate = time;
                const fpsEl = document.getElementById('debug-fps');
                if (fpsEl) fpsEl.innerText = activeFps;
            }

            // Update debug overlay
            const loopEl = document.getElementById('debug-loop');
            if (loopEl) {
                loopEl.innerText = Game.state;
                loopEl.style.color = Game.state === 'PLAYING' ? '#22c55e' : (Game.state === 'PAUSED' ? '#38bdf8' : '#ef4444');
            }
            const playerEl = document.getElementById('debug-player');
            if (playerEl) {
                if (Game.entities.player && Game.state === 'PLAYING') {
                    playerEl.innerText = 'ACTIVE';
                    playerEl.style.color = '#22c55e';
                } else if (Game.state === 'END') {
                    playerEl.innerText = 'DESTROYED';
                    playerEl.style.color = '#ef4444';
                } else {
                    playerEl.innerText = 'STATIC';
                    playerEl.style.color = '#eab308';
                }
            }
            const entitiesEl = document.getElementById('debug-entities');
            if (entitiesEl) {
                const totalEntities = (Game.entities.player ? 1 : 0) + Game.entities.collectibles.length + Game.entities.hazards.length + Game.entities.environment.length;
                entitiesEl.innerText = totalEntities;
            }
            const inputEl = document.getElementById('debug-input');
            if (inputEl) {
                const isInputActive = Input.left() || Input.right() || Input.up() || Input.down();
                if (isInputActive) {
                    inputEl.innerText = 'ACTIVE';
                    inputEl.style.color = '#22c55e';
                } else {
                    inputEl.innerText = 'STANDBY';
                    inputEl.style.color = '#a855f7';
                }
            }
            
            Game.reqId = requestAnimationFrame(gameLoop);
        }
        
        Game.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    </script>
</body>
</html>`;
}
