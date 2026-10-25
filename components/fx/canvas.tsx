import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

/* ------------------------------------------------------------------ */
/* WebGL smoke shader background                                        */
/* ------------------------------------------------------------------ */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 R=mat2(.8,.6,-.6,.8); for(int i=0;i<5;i++){ v+=a*n(p); p=R*p*2.02; a*=.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / r.xy;
  vec2 p = (gl_FragCoord.xy - .5*r.xy) / r.y;
  p += (m - .5) * .08;
  float tt = t*.045;
  vec2 q = vec2(fbm(p*1.6 + vec2(0., -tt*2.)), fbm(p*1.6 + vec2(5.2, 1.3 - tt*1.6)));
  vec2 s = vec2(fbm(p*2. + 3.*q + vec2(1.7, 9.2) - vec2(0., tt*3.)), fbm(p*2. + 3.*q + vec2(8.3, 2.8)));
  float f = fbm(p*1.4 + 2.6*s);
  float rise = smoothstep(1.1, -.25, uv.y);
  float smoke = smoothstep(.35, 1.05, f) * (.35 + .65*rise);
  vec3 ink = vec3(.051,.039,.031);
  vec3 ember = vec3(.55,.20,.10);
  vec3 candle = vec3(.85,.62,.34);
  vec3 col = ink;
  col = mix(col, ember*.55, smoothstep(.0,.9,smoke)*.7);
  col = mix(col, candle*.45, pow(smoke, 3.)*.9);
  float glow = exp(-3.2*length(p - vec2(0., -.15)));
  col += vec3(.33,.12,.06)*glow*.35;
  float vig = smoothstep(1.25, .25, length(p*vec2(.9,1.1)));
  col *= .55 + .45*vig;
  gl_FragColor = vec4(col, 1.);
}`;

export const SmokeShader: React.FC<{ className?: string }> = ({ className = '' }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const gl = c.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) {
      setFailed(true);
      return;
    }
    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, 'r');
    const uT = gl.getUniformLocation(prog, 't');
    const uM = gl.getUniformLocation(prog, 'm');

    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5; // render at half resolution, it's smoke
    const resize = () => {
      c.width = Math.max(1, Math.floor(c.clientWidth * scale));
      c.height = Math.max(1, Math.floor(c.clientHeight * scale));
      gl.viewport(0, 0, c.width, c.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onMove);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);

    const reduced = prefersReducedMotion();
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform2f(uR, c.width, c.height);
      gl.uniform1f(uT, reduced ? 20 : (now - t0) / 1000);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (reduced) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, []);
  if (failed) return <div className={`hero-smoke-fallback ${className}`} />;
  return <canvas ref={ref} className={`hero-smoke ${className}`} aria-hidden="true" />;
};

/* ------------------------------------------------------------------ */
/* Dust particles drifting through light                                */
/* ------------------------------------------------------------------ */
export const DustCanvas: React.FC<{ count?: number; beams?: number[] }> = ({ count = 90, beams = [0.25, 0.5, 0.75] }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const ps = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: -Math.random() * 0.0004 - 0.0001,
      ph: Math.random() * Math.PI * 2,
    }));
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);
    const reduced = prefersReducedMotion();
    let raf = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (!reduced) {
          p.x += p.vx + Math.sin(t / 2000 + p.ph) * 0.00015;
          p.y += p.vy;
          if (p.y < -0.02) {
            p.y = 1.02;
            p.x = Math.random();
          }
        }
        // brighter inside a beam
        let light = 0.15;
        for (const b of beams) light = Math.max(light, 1 - Math.min(1, Math.abs(p.x - b) / (0.08 + p.y * 0.12)));
        const tw = 0.6 + 0.4 * Math.sin(t / 600 + p.ph);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 226, 180, ${0.08 + light * 0.6 * tw})`;
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (reduced) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [count, beams]);
  return <canvas ref={ref} className="dust" aria-hidden="true" />;
};

/* ------------------------------------------------------------------ */
/* Particle logo intro                                                  */
/* ------------------------------------------------------------------ */
export const ParticleIntro: React.FC<{ text: string; tagline: string; skipLabel: string; onDone: () => void }> = ({
  text,
  tagline,
  skipLabel,
  onDone,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setDone(true);
    window.setTimeout(onDone, 800);
  };

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return finish();
    let raf = 0;
    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Sample the wordmark into target points
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const o = off.getContext('2d')!;
      let size = Math.min(w / (text.length * 0.52), 170);
      o.fillStyle = '#fff';
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.font = `italic 600 ${size}px "Bodoni Moda Variable", "Bodoni Moda", Didot, serif`;
      while (o.measureText(text).width > w * 0.88 && size > 20) {
        size -= 4;
        o.font = `italic 600 ${size}px "Bodoni Moda Variable", "Bodoni Moda", Didot, serif`;
      }
      o.fillText(text, w / 2, h / 2);
      const data = o.getImageData(0, 0, w, h).data;
      const gap = w < 600 ? 3 : 4;
      let targets: { x: number; y: number }[] = [];
      for (let y = 0; y < h; y += gap) for (let x = 0; x < w; x += gap) if (data[(y * w + x) * 4 + 3] > 128) targets.push({ x, y });
      const MAX = w < 600 ? 3200 : 7000; // keep it light on phones
      if (targets.length > MAX) {
        // random sample, so the letters stay evenly filled
        for (let i = targets.length - 1; i > 0; i--) {
          const j = (Math.random() * (i + 1)) | 0;
          [targets[i], targets[j]] = [targets[j], targets[i]];
        }
        targets = targets.slice(0, MAX);
      }

      const colors = ['#f3e7d3', '#d9a85b', '#c8233f', '#f3e7d3'];
      const ps = targets.map((t) => {
        const a = Math.random() * Math.PI * 2;
        const d = Math.max(w, h) * (0.4 + Math.random() * 0.6);
        const sx = w / 2 + Math.cos(a) * d;
        const sy = h / 2 + Math.sin(a) * d;
        return {
          sx,
          sy,
          x: sx,
          y: sy,
          tx: t.x,
          ty: t.y,
          vx: 0,
          vy: 0,
          c: colors[(Math.random() * colors.length) | 0],
          s: Math.random() * 0.6 + 0.9,
          delay: Math.random() * 0.35,
        };
      });

      const t0 = performance.now();
      const FORM = 1500;
      // short trails while flying in, crisp once formed
      const phaseTrail = (ms: number) => `rgba(13,10,8,${ms < FORM - 200 ? 0.35 : 0.85})`;
      const HOLD = 700;
      const frame = (now: number) => {
        const el = (now - t0) / 1000;
        ctx.fillStyle = phaseTrail(now - t0);
        ctx.fillRect(0, 0, w, h);
        const phaseBurst = now - t0 > FORM + HOLD;
        for (const p of ps) {
          if (!phaseBurst) {
            // time-based so the word forms on time even at low frame rates
            const k = Math.min(1, Math.max(0, (el - p.delay) / (FORM / 1000 - 0.35)));
            const e = 1 - Math.pow(1 - k, 4);
            const swirl = (1 - e) * 60;
            p.x = p.sx + (p.tx - p.sx) * e + Math.sin(el * 3 + p.delay * 20) * swirl;
            p.y = p.sy + (p.ty - p.sy) * e + Math.cos(el * 3 + p.delay * 20) * swirl;
          } else {
            if (p.vx === 0 && p.vy === 0) {
              const a = Math.atan2(p.y - h / 2, p.x - w / 2) + (Math.random() - 0.5) * 0.6;
              const sp = 4 + Math.random() * 9;
              p.vx = Math.cos(a) * sp;
              p.vy = Math.sin(a) * sp - 2;
            }
            p.vy += 0.12;
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.985;
          }
          ctx.fillStyle = p.c;
          ctx.fillRect(p.x, p.y, 2 * p.s, 2 * p.s);
        }
        if (now - t0 > FORM + HOLD + 450) finish();
        if (!finished.current || now - t0 < FORM + HOLD + 1200) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    // wait for the display font so the sampled shape is right
    const fontLoad: Promise<unknown> | undefined = (document as any).fonts?.load?.('italic 600 120px "Bodoni Moda Variable"');
    if (fontLoad) fontLoad.then(setup, setup);
    else setup();
    const safety = window.setTimeout(finish, 5000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`intro ${done ? 'is-done' : ''}`} role="presentation">
      <canvas ref={ref} />
      <div className="intro-tag">{tagline}</div>
      <button type="button" className="btn btn--ghost btn--sm intro-skip" onClick={finish}>
        {skipLabel}
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Canvas confetti — folk flowers and pierogi                           */
/* ------------------------------------------------------------------ */
export function fireConfetti(origin?: { x: number; y: number }, amount = 160) {
  if (prefersReducedMotion() || typeof document === 'undefined') return;
  const c = document.createElement('canvas');
  c.className = 'confetti-canvas';
  document.body.appendChild(c);
  const ctx = c.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  c.width = w * dpr;
  c.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const ox = origin?.x ?? w / 2;
  const oy = origin?.y ?? h * 0.55;
  const palette = ['#c8233f', '#d9a85b', '#f3e7d3', '#2f7d4f', '#1f6fb2', '#e2007a'];
  const kinds = ['flower', 'pierog', 'leaf', 'dot'] as const;
  const ps = Array.from({ length: amount }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const sp = 8 + Math.random() * 13;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      s: 6 + Math.random() * 9,
      c: palette[(Math.random() * palette.length) | 0],
      k: kinds[(Math.random() * kinds.length) | 0],
      flip: Math.random() * Math.PI,
    };
  });
  const draw = (p: (typeof ps)[number]) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.8 + 0.2);
    ctx.fillStyle = p.c;
    if (p.k === 'flower') {
      for (let i = 0; i < 5; i++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -p.s * 0.55, p.s * 0.28, p.s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffd100';
      ctx.beginPath();
      ctx.arc(0, 0, p.s * 0.22, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.k === 'pierog') {
      ctx.fillStyle = '#efdcb8';
      ctx.beginPath();
      ctx.arc(0, 0, p.s * 0.7, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c99a5b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        ctx.lineTo(Math.cos(a) * p.s * 0.7, Math.sin(a) * p.s * 0.7 - 1);
      }
      ctx.stroke();
    } else if (p.k === 'leaf') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.s * 0.25, p.s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.s * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  const t0 = performance.now();
  const frame = (now: number) => {
    ctx.clearRect(0, 0, w, h);
    let alive = 0;
    for (const p of ps) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.flip += 0.12;
      if (p.y < h + 40) alive++;
      draw(p);
    }
    if (alive > 0 && now - t0 < 6000) requestAnimationFrame(frame);
    else c.remove();
  };
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ */
/* Fly-to-tray — a dish photo flies into the header tray               */
/* ------------------------------------------------------------------ */
export function flyToTray(fromEl: HTMLElement | null, src: string, onLand?: () => void) {
  const target = document.getElementById('tray-button');
  if (!fromEl || !target || prefersReducedMotion() || !('animate' in Element.prototype)) {
    onLand?.();
    return;
  }
  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = Math.min(a.width, a.height, 160);
  const ghost = document.createElement('img');
  ghost.src = src;
  ghost.className = 'fly-ghost';
  ghost.style.width = ghost.style.height = `${size}px`;
  ghost.style.left = `${a.left + a.width / 2 - size / 2}px`;
  ghost.style.top = `${a.top + a.height / 2 - size / 2}px`;
  document.body.appendChild(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const end = 24 / size;
  ghost
    .animate(
      [
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 140}px) scale(${(1 + end) / 1.6}) rotate(200deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(${end}) rotate(360deg)`, opacity: 0.6 },
      ],
      { duration: 900, easing: 'cubic-bezier(.55,0,.35,1)' }
    )
    .finished.then(() => {
      ghost.remove();
      target.classList.remove('tray-bump');
      void target.offsetWidth;
      target.classList.add('tray-bump');
      onLand?.();
    });
}
