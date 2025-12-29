import React, { useRef, useEffect, useMemo } from 'react';

// Brand Colors
const BRAND = {
    MINT: '#7FFFD4',
    ION_BLUE: '#1B82FF',
    SOLAR_PINK: '#FF5C8A',
    DEEP_PURPLE: '#5A3FFF',
    AURORA: '#7FDBFF',
    WHITE: '#FFFFFF'
};

const HyperplexBanner = ({ color = 'math_tesseract', profileBorderColor, starSettings }) => {
    const canvasRef = useRef(null);
    const stateRef = useRef({ time: 0 });

    const world = useMemo(() => {
        // High-Dimensional Geometry Logic
        const configs = {
            math_tesseract: {
                id: 'Tesseract',
                dim: 4,
                scale: 120,
                // 16 vertices for a 4D Cube
                vertices: (() => {
                    const v = [];
                    for (let i = 0; i < 16; i++) {
                        v.push([
                            (i & 1) ? 1 : -1,
                            (i & 2) ? 1 : -1,
                            (i & 4) ? 1 : -1,
                            (i & 8) ? 1 : -1
                        ]);
                    }
                    return v;
                })(),
                edges: (() => {
                    const e = [];
                    for (let i = 0; i < 16; i++) {
                        for (let j = i + 1; j < 16; j++) {
                            let diff = 0;
                            for (let k = 0; k < 4; k++) if ((i & (1 << k)) !== (j & (1 << k))) diff++;
                            if (diff === 1) e.push([i, j]);
                        }
                    }
                    return e;
                })()
            },
            math_pentachoron: {
                id: '5-Cell',
                dim: 4,
                scale: 180,
                // 5 vertices for a 4D Simplex
                vertices: [
                    [1, 1, 1, -1 / Math.sqrt(5)],
                    [1, -1, -1, -1 / Math.sqrt(5)],
                    [-1, 1, -1, -1 / Math.sqrt(5)],
                    [-1, -1, 1, -1 / Math.sqrt(5)],
                    [0, 0, 0, Math.sqrt(5) - 1 / Math.sqrt(5)]
                ],
                edges: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
            },
            math_24cell: {
                id: '24-Cell',
                dim: 4,
                scale: 140,
                vertices: (() => {
                    const v = [];
                    // All permutations of (+-1, +-1, 0, 0) - 24 vertices
                    const p = [1, -1, 0, 0];
                    const perms = [];
                    const generatePerms = (arr, m = []) => {
                        if (arr.length === 0) perms.push(m);
                        else {
                            const seen = new Set();
                            for (let i = 0; i < arr.length; i++) {
                                if (seen.has(arr[i])) continue;
                                seen.add(arr[i]);
                                let curr = arr.slice();
                                let next = curr.splice(i, 1);
                                generatePerms(curr.slice(), m.concat(next));
                            }
                        }
                    };
                    generatePerms([1, 1, 0, 0]); // Base for +1,+1
                    generatePerms([1, -1, 0, 0]);
                    generatePerms([-1, -1, 0, 0]);

                    return perms;
                })(),
                edges: [] // Will calc on distance
            }
        };

        const current = configs[color] || configs.math_tesseract;

        // Auto-edge for 24-cell based on distance (sqrt(2))
        if (color === 'math_24cell') {
            const e = [];
            const v = current.vertices;
            for (let i = 0; i < v.length; i++) {
                for (let j = i + 1; j < v.length; j++) {
                    const d = Math.sqrt(v[i].reduce((acc, val, k) => acc + (val - v[j][k]) ** 2, 0));
                    if (Math.abs(d - Math.sqrt(2)) < 0.1) e.push([i, j]);
                }
            }
            current.edges = e;
        }

        return current;
    }, [color]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrame;

        const rotate4D = (v, angle, p1, p2) => {
            const result = [...v];
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            const a = v[p1];
            const b = v[p2];
            result[p1] = a * c - b * s;
            result[p2] = a * s + b * c;
            return result;
        };

        const project = (v, w, h) => {
            // 4D to 3D
            const d4 = 3;
            const factor4 = 1 / (d4 - v[3]);
            const x3 = v[0] * factor4;
            const y3 = v[1] * factor4;
            const z3 = v[2] * factor4;

            // 3D to 2D
            const d3 = 2;
            const factor3 = 1 / (d3 - z3);
            const x2 = x3 * factor3 * world.scale;
            const y2 = y3 * factor3 * world.scale;

            return { x: x2 + w / 2, y: y2 + h / 2, z: z3 };
        };

        const render = () => {
            stateRef.current.time += 0.008;
            const t = stateRef.current.time;
            const w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;

            ctx.clearRect(0, 0, w, h);
            const activeColor = profileBorderColor || BRAND.MINT;

            const drawStructure = (cX, cY, speedMult) => {
                const rotated = world.vertices.map(v => {
                    let rv = rotate4D(v, t * 0.5 * speedMult, 0, 3); // XY
                    rv = rotate4D(rv, t * 0.3 * speedMult, 1, 2); // YZ
                    rv = rotate4D(rv, t * 0.4 * speedMult, 0, 2); // XZ
                    rv = rotate4D(rv, t * 0.2 * speedMult, 1, 3); // YW
                    return rv;
                });

                const projected = rotated.map(v => project(v, w, h));

                // Draw Edges
                ctx.lineWidth = 1 * dpr;
                world.edges.forEach(([i, j]) => {
                    const p1 = projected[i], p2 = projected[j];
                    const dist = Math.abs(p1.z + p2.z) / 2; // Simple depth shading

                    ctx.beginPath();
                    ctx.strokeStyle = activeColor;
                    ctx.globalAlpha = 0.1 + (1 - (dist + 0.5)) * 0.8;
                    ctx.moveTo(p1.x + cX, p1.y + cY);
                    ctx.lineTo(p2.x + cX, p2.y + cY);
                    ctx.stroke();
                });

                // Draw Vertices (Glow points)
                projected.forEach(p => {
                    ctx.beginPath();
                    ctx.fillStyle = activeColor;
                    ctx.globalAlpha = 0.8;
                    ctx.arc(p.x + cX, p.y + cY, 2 * dpr, 0, Math.PI * 2);
                    ctx.fill();

                    // Bloom
                    ctx.shadowBlur = 15 * dpr;
                    ctx.shadowColor = activeColor;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                });
            };

            // Double Structure - UI Framing
            drawStructure(-w * 0.28, 0, 1.0);
            drawStructure(w * 0.28, 0, -0.8);

            // Subtle Background Connections (Matrix of reality)
            ctx.globalAlpha = 0.05;
            ctx.strokeStyle = activeColor;
            for (let i = 0; i < w; i += 40 * dpr) {
                ctx.beginPath();
                ctx.moveTo(i, 0); ctx.lineTo(i, h);
                ctx.stroke();
            }

            animationFrame = requestAnimationFrame(render);
        };

        const res = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr;
        };
        window.addEventListener('resize', res); res(); render();
        return () => { window.removeEventListener('resize', res); cancelAnimationFrame(animationFrame); };
    }, [world, color, profileBorderColor]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default HyperplexBanner;
