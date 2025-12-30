import React, { useEffect, useRef, useMemo } from 'react';
import { fadeColor } from '@/core/utils/colorUtils';
import { BRAND_COLORS } from '@/core/constants/colorPacks';

/**
 * LIQUID FRACTAL FUSION BANNER (V9 - Dynamic Balance)
 * 
 * - Composition Modes: 
 *   - Symmetric (~30%): Perfectly mirrored.
 *   - Balanced Unsymmetric (~60%): Weighted across the center, but organic.
 *   - Unbalanced (~10%): Weighted heavily to one side.
 * - See-Thru Glass: 50% opacity.
 * - Optimized 4-Tap SSAA: Smooth but fast.
 */

const LiquidFractalBanner = ({
    seed = 'panospace',
    color = '#7FFFD4',
    color2 = '#5A3FFF',
    speed = 1.0
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const glRef = useRef(null);
    const programRef = useRef(null);
    const frameRef = useRef(null);

    const seededRandom = (s) => {
        let h = 0xdeadbeef;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
        return () => {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h >>> 0) / 4294967296;
        };
    };

    /**
     * DYNAMIC GENERATION ENGINE
     */
    const { points, pointColors } = useMemo(() => {
        const rng = seededRandom(seed);
        const pts = [];
        const clrs = [];

        // GENERATE PALETTE (1-4 colors from BRAND_COLORS, no yellow, no white-ish)
        // Filter: No #FF914D (orange/yellow), No #FFB7D5 (light pink), No #A7B6FF (light periwinkle), No #7FDBFF (light blue)
        const availablePool = BRAND_COLORS.filter(c => !['#FF914D', '#FFB7D5', '#A7B6FF', '#7FDBFF'].includes(c));

        const colorCount = 1 + Math.floor(rng() * 4);
        const palette = [];

        const hexToRgb = (hex) => {
            const clean = hex.startsWith('#') ? hex : '#7FFFD4';
            const r = parseInt(clean.slice(1, 3), 16) / 255;
            const g = parseInt(clean.slice(3, 5), 16) / 255;
            const b = parseInt(clean.slice(5, 7), 16) / 255;
            return [isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b];
        };

        for (let i = 0; i < colorCount; i++) {
            const hex = availablePool[Math.floor(rng() * availablePool.length)];
            palette.push(hexToRgb(hex));
        }

        // FORMATION TIERING
        const formationRoll = rng();
        let mode = 'balanced'; // Default
        if (formationRoll < 0.3) mode = 'symmetric';
        else if (formationRoll > 0.9) mode = 'unbalanced';

        const addPt = (x, y, r) => {
            const pColor = palette[Math.floor(rng() * palette.length)];
            const scaledR = r * 1.5; // Reduced from 2.5 for smaller, softer blobs
            pts.push(x, y, scaledR);
            clrs.push(...pColor);

            if (mode === 'symmetric') {
                pts.push(1.0 - x, y, scaledR);
                clrs.push(...pColor);
            }
        };

        const generateCluster = (centerX, centerY, scale, count) => {
            for (let i = 0; i < count; i++) {
                const ox = (rng() - 0.5) * scale;
                const oy = (rng() - 0.5) * scale * 0.5;
                addPt(centerX + ox, centerY + oy, 0.05 + rng() * 0.1);
            }
        };

        if (mode === 'symmetric') {
            generateCluster(0.25 + rng() * 0.15, 0.3 + rng() * 0.4, 0.2, 8 + Math.floor(rng() * 6));
        } else if (mode === 'balanced') {
            generateCluster(0.2 + rng() * 0.2, 0.3 + rng() * 0.4, 0.2, 6 + Math.floor(rng() * 4));
            generateCluster(0.6 + rng() * 0.2, 0.3 + rng() * 0.4, 0.2, 6 + Math.floor(rng() * 4));
        } else {
            const side = rng() > 0.5 ? 0.25 : 0.75;
            generateCluster(side + (rng() - 0.5) * 0.1, 0.3 + rng() * 0.4, 0.3, 15 + Math.floor(rng() * 10));
        }

        return {
            points: new Float32Array(pts.slice(0, 192)),
            pointColors: new Float32Array(clrs.slice(0, 192))
        };
    }, [seed]);

    const fragSource = `
        precision highp float;
        varying vec2 v_uv;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec3 u_points[64];
        uniform vec3 u_colors[64];
        uniform int u_point_count;
        uniform float u_speed;
        uniform float u_softness;

        vec4 getField(vec2 uv) {
            float aspect = u_resolution.x / u_resolution.y;
            vec2 p_uv = uv * vec2(aspect, 1.0);
            
            float field = 0.0;
            vec3 blendedColor = vec3(0.0);
            float weightSum = 0.0;
            float t = u_time * u_speed * 0.3;

            for(int i = 0; i < 64; i++) {
                if(i >= u_point_count) break;
                vec3 pt = u_points[i];
                vec2 pos = vec2(pt.x * aspect, pt.y);
                pos += vec2(sin(t + pt.y*8.0), cos(t*0.7 + pt.x*8.0)) * 0.02;
                
                float d = distance(p_uv, pos);
                float r = pt.z;
                
                // LAVA LAMP GAUSSIAN FALLOFF
                // Gentler decay allows for a more "filled" look with a soft halo.
                float dist = d / r;
                float f = exp(-dist * dist * 4.0); 
                
                field += f;
                blendedColor += f * u_colors[i];
                weightSum += f;
            }

            if (field <= 0.0001) return vec4(0.0);

            vec3 baseCol = blendedColor / (weightSum + 0.001);
            
            // LAVA LAMP ALPHA MAPPING
            // We want a very smooth fade that feels voluminous.
            float alpha = smoothstep(0.0, 2.0, field);
            alpha = pow(alpha, 0.7); // High transparency at edges, solid-ish core
            
            return vec4(baseCol * 1.5, alpha * 0.75);
        }

        void main() {
            vec2 d = vec2(0.25, 0.25) / u_resolution;
            vec4 s1 = getField(v_uv + vec2(-d.x, -d.y));
            vec4 s2 = getField(v_uv + vec2( d.x, -d.y));
            vec4 s3 = getField(v_uv + vec2(-d.x,  d.y));
            vec4 s4 = getField(v_uv + vec2( d.x,  d.y));
            
            gl_FragColor = (s1 + s2 + s3 + s4) * 0.25;
        }
    `;

    const vertSource = `
        attribute vec2 position;
        varying vec2 v_uv;
        void main() {
            v_uv = position * 0.5 + 0.5;
            v_uv.y = 1.0 - v_uv.y;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;
        const canvas = canvasRef.current;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        const gl = canvas.getContext('webgl', { alpha: true });
        if (!gl) return;
        glRef.current = gl;

        const compile = (s, t) => {
            const sh = gl.createShader(t);
            gl.shaderSource(sh, s);
            gl.compileShader(sh);
            return sh;
        };

        const vs = compile(vertSource, gl.VERTEX_SHADER);
        const fs = compile(fragSource, gl.FRAGMENT_SHADER);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const pos = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

        const uniforms = {
            res: gl.getUniformLocation(program, 'u_resolution'),
            time: gl.getUniformLocation(program, 'u_time'),
            pts: gl.getUniformLocation(program, 'u_points'),
            clrs: gl.getUniformLocation(program, 'u_colors'),
            cnt: gl.getUniformLocation(program, 'u_point_count'),
            spd: gl.getUniformLocation(program, 'u_speed')
        };

        gl.uniform2f(uniforms.res, canvas.width, canvas.height);
        gl.uniform3fv(uniforms.pts, points);
        gl.uniform3fv(uniforms.clrs, pointColors);
        gl.uniform1i(uniforms.cnt, points.length / 3);
        gl.uniform1f(uniforms.spd, speed);

        const start = Date.now();
        const render = () => {
            const time = (Date.now() - start) / 1000;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform1f(uniforms.time, time);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            frameRef.current = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(frameRef.current);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(buf);
        };
    }, [points, pointColors, speed]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
};

export default LiquidFractalBanner;
