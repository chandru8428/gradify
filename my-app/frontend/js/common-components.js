const { createElement: e, useState, useEffect } = React;

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root {
  --bg: #0a0a0a;
  --bg-gradient: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
  --glass-light: rgba(255, 255, 255, 0.08);
  --glass-lighter: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.15);
  --s1: rgba(20, 20, 30, 0.55);
  --s2: rgba(30, 30, 45, 0.65);
  --s3: rgba(40, 40, 60, 0.7);
  --bdr: rgba(255, 255, 255, 0.1);
  --bdr-thick: rgba(255, 255, 255, 0.25);
  --t1: #ffffff;
  --t2: #b8b8cc;
  --t3: #7a7a8e;
  --blue: #00d4ff;
  --blue-glow: #0099ff;
  --blue2: #0066ff;
  --purple: #b84aff;
  --purple-glow: #d970ff;
  --green: #00ff9f;
  --gold: #ffb800;
  --red: #ff4757;
  --shadow-sm: 0 4px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 20px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 30px rgba(0, 212, 255, 0.2);
  --radius: 16px;
  --radius-lg: 24px;
  --radius-sm: 12px;
  --font-h: 'Space Grotesk', 'Poppins', sans-serif;
  --font-b: 'Inter', sans-serif;
  --font-m: 'JetBrains Mono', monospace;
  --text-scale: 1rem;
  --transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  --transition-fast: all 0.2s ease;
  --transition-slow: all 0.5s ease;
}

:root.light {
  --bg: #FAFAFA;
  --s1: rgba(255, 255, 255, 0.95);
  --s2: rgba(243, 244, 246, 0.9);
  --s3: rgba(229, 231, 235, 0.9);
  --bdr: #D1D5DB;
  --t1: #111827;
  --t2: #374151;
  --t3: #6B7280;
  --blue: #0ACF83;
  --blue2: #08A467;
  --green: #84CC16;
  --gold: #EAB308;
  --red: #EF4444;
  --purple: #F97316;
}

html { font-size: 100%; line-height: 1.6; min-width: 0; overflow-x: hidden; }
body, #root { min-height: 100vh; width: 100%; background: var(--bg-gradient); position: relative; transition: background 0.5s ease; overflow-x: hidden; }
body { font-family: var(--font-b); color: var(--t1); -webkit-text-size-adjust: 100%; cursor: none; }
* { box-sizing: border-box; }

/* Prevent horizontal scroll on narrow devices */
img, video, canvas, iframe { max-width: 100%; height: auto; }

/* GLASSMORPHISM + BRUTALISM ANIMATIONS */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
@keyframes glassSlide { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(16px); } }
@keyframes brutalScale { from { transform: scale(0.92) rotate(-2deg); opacity: 0; } to { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes brutalPulse { 0%, 100% { border-color: rgba(255, 255, 255, 0.15); } 50% { border-color: rgba(0, 212, 255, 0.4); } }
@keyframes neonGlow { 0%, 100% { text-shadow: 0 0 10px rgba(0, 212, 255, 0.5), 0 0 20px rgba(184, 74, 255, 0.3); } 50% { text-shadow: 0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(184, 74, 255, 0.6); } }
@keyframes floatUp { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
@keyframes shimmerFlow { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes cursorTrail { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.2); } }
@keyframes hoverMagnet { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(var(--tx, 0), var(--ty, 0)); } }

/* SCROLLBAR STYLING */
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
::-webkit-scrollbar-thumb { background: var(--blue); border-radius: 8px; transition: all 0.3s ease; }
::-webkit-scrollbar-thumb:hover { background: var(--purple); box-shadow: 0 0 15px rgba(0, 212, 255, 0.3); }

/* BRUTALIST CARDS - Thick Borders, Strong Presence */
.card, .stat, .qc, .upload-bar, .signin-card { 
  background: var(--s1);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 2.5px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: var(--transition);
  overflow: hidden;
  position: relative;
  animation: glassSlide 0.6s ease-out;
}

.card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(184, 74, 255, 0.05) 100%); opacity: 0; transition: opacity 0.4s ease; pointer-events: none; }
.card:hover::before { opacity: 1; }

.card { margin-bottom: 24px; }
.card:hover { 
  transform: translateY(-6px) scale(1.01);
  border-color: var(--blue);
  box-shadow: var(--shadow-lg), 0 0 40px rgba(0, 212, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.card-h { 
  padding: 18px 22px;
  background: linear-gradient(90deg, var(--s2) 0%, var(--s3) 100%);
  border-bottom: 2px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.card-ht { font-family: var(--font-h); font-size: 17px; font-weight: 700; background: linear-gradient(90deg, var(--blue), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.card-b { padding: 24px; }

.field { margin-bottom: 20px; }
.fl { display: block; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--blue); margin-bottom: 10px; font-family: var(--font-h); }

/* BRUTALIST FORM INPUTS - Thick borders, strong contrast */
input[type=text], input[type=password], input[type=number], input[type=email], select, textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 2.5px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--t1);
  font-family: var(--font-b);
  font-size: 15px;
  padding: 14px 16px;
  outline: none;
  transition: var(--transition-fast);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

input::placeholder, textarea::placeholder { color: var(--t3); }

input:focus, textarea:focus, select:focus {
  border-color: var(--blue);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(0, 212, 255, 0.2);
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.01);
}

.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

/* BRUTALIST BUTTONS - Bold, High Contrast */
.btn {
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  padding: 13px 24px;
  font-family: var(--font-h);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.btn:active::before { opacity: 1; }

.btn-blue {
  background: linear-gradient(135deg, var(--blue) 0%, var(--purple) 100%);
  color: #fff;
  border-color: var(--blue);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2);
  font-weight: 700;
}

.btn-blue:hover:not(:disabled) {
  box-shadow: 0 16px 40px rgba(0, 212, 255, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  border-color: var(--purple);
}

.btn-blue:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
}

.btn-ghost {
  background: transparent;
  border: 2.5px solid var(--glass-border);
  color: var(--t2);
  backdrop-filter: blur(8px);
}

.btn-ghost:hover:not(:disabled) {
  border-color: var(--blue);
  color: var(--t1);
  background: rgba(0, 212, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2);
}

.btn-danger {
  background: rgba(255, 71, 87, 0.15);
  border: 2.5px solid rgba(255, 71, 87, 0.4);
  color: var(--red);
}

.btn-danger:hover:not(:disabled) {
  background: rgba(255, 71, 87, 0.3);
  border-color: var(--red);
  box-shadow: 0 8px 24px rgba(255, 71, 87, 0.3);
}

/* DROPZONE - Dashed border brutalism */
.dz {
  border: 3px dashed var(--glass-border);
  border-radius: var(--radius);
  padding: 40px 28px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: rgba(0, 212, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.dz:hover {
  border-color: var(--blue);
  background: rgba(0, 212, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.15);
}

.dz input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.dz-icon { font-size: 48px; margin-bottom: 12px; animation: floatUp 2s ease-in-out infinite; }
.dz-text { font-size: 15px; margin-bottom: 8px; }
.dz-text b { color: var(--blue); font-weight: 700; }

/* SCORE BANNER - Premium gradient */
.score-banner {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(184, 74, 255, 0.15) 100%);
  border: 3px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 48px 36px;
  text-align: center;
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 12px 48px rgba(0, 212, 255, 0.2);
  animation: brutalScale 0.6s ease-out;
}

.sb-num {
  font-family: var(--font-m);
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: neonGlow 2s ease-in-out infinite;
}

.sb-den { font-size: 36px; color: var(--t3); font-family: var(--font-m); }
.sb-pct { font-size: 18px; color: var(--blue); margin: 12px 0 20px; font-weight: 700; font-family: var(--font-h); letter-spacing: 1px; }
.sb-grade { display: inline-block; font-family: var(--font-h); font-size: 26px; padding: 10px 32px; border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50px; margin-bottom: 16px; backdrop-filter: blur(10px); }
.sb-text { font-size: 14px; color: var(--t2); margin-top: 16px; line-height: 1.6; }

.gA { background: rgba(0, 255, 159, 0.2); color: var(--green); border: 2px solid var(--green); }
.gB { background: rgba(0, 212, 255, 0.2); color: var(--blue); border: 2px solid var(--blue); }
.gC { background: rgba(255, 184, 0, 0.2); color: var(--gold); border: 2px solid var(--gold); }
.gD { background: rgba(255, 100, 100, 0.2); color: #ff6464; border: 2px solid #ff6464; }
.gF { background: rgba(255, 71, 87, 0.2); color: var(--red); border: 2px solid var(--red); }

.pie-row { display: flex; justify-content: center; gap: 50px; flex-wrap: wrap; padding: 32px 0 20px; }

/* QUESTION CARD - Collapsible with glassmorphism */
.qc {
  margin-bottom: 20px;
  background: var(--s1);
  backdrop-filter: blur(16px);
  border: 2.5px solid var(--glass-border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: var(--transition);
  animation: fadeInUp 0.6s ease-out;
}

.qc:hover { border-color: var(--blue); box-shadow: 0 8px 32px rgba(0, 212, 255, 0.15); }

.qc-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: linear-gradient(90deg, var(--s2), var(--s3));
  border-bottom: 2px solid var(--glass-border);
  cursor: pointer;
  transition: var(--transition-fast);
}

.qc-h:hover { background: linear-gradient(90deg, var(--s3), rgba(0, 212, 255, 0.1)); }

.qc-label { font-family: var(--font-h); font-size: 15px; font-weight: 700; letter-spacing: 0.5px; }
.qc-b { padding: 24px; }
.mk { font-family: var(--font-m); font-size: 13px; font-weight: 700; }

/* STATS GRID */
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 28px; }

.stat {
  padding: 24px;
  background: var(--s1);
  backdrop-filter: blur(16px);
  border: 2.5px solid var(--glass-border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  animation: fadeInUp 0.6s ease-out;
  position: relative;
}

.stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--blue), var(--purple));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.stat:hover::before { transform: scaleX(1); }
.stat:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg), 0 0 40px rgba(0, 212, 255, 0.2); border-color: var(--blue); }

.stat-v { font-family: var(--font-m); font-size: 36px; font-weight: 800; line-height: 1; background: linear-gradient(135deg, var(--blue), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 6px; }
.stat-l { font-size: 11px; color: var(--t3); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 12px; font-weight: 600; }
.stat-i { width: 52px; height: 52px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 24px; background: linear-gradient(135deg, var(--s3), var(--s2)); border: 2px solid var(--glass-border); margin-bottom: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }

/* TABLE */
.tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
.tbl th { text-align: left; font-family: var(--font-h); font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--blue); padding: 14px 18px; border-bottom: 2px solid var(--glass-border); font-weight: 700; }
.tbl td { padding: 16px 18px; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: var(--t2); transition: background 0.2s ease; }
.tbl tr:hover td { background: rgba(0, 212, 255, 0.08); }

/* BADGE */
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 50px;
  letter-spacing: 0.8px;
  font-family: var(--font-b);
  text-transform: uppercase;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1.5px solid;
  backdrop-filter: blur(8px);
}

.bg-green { background: rgba(0, 255, 159, 0.15); color: var(--green); border-color: var(--green); }
.bg-gold { background: rgba(255, 184, 0, 0.15); color: var(--gold); border-color: var(--gold); }
.bg-blue { background: rgba(0, 212, 255, 0.15); color: var(--blue); border-color: var(--blue); }
.bg-purple { background: rgba(184, 74, 255, 0.15); color: var(--purple); border-color: var(--purple); }

/* LOGIN PAGE */
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-gradient);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.signin-card {
  background: var(--s1);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 3px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 56px 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-lg), 0 0 60px rgba(0, 212, 255, 0.15);
  animation: brutalScale 0.8s ease-out;
  position: relative;
  z-index: 10;
}

.signin-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(184, 74, 255, 0.1) 100%);
  border-radius: var(--radius-lg);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.signin-card:hover::before { opacity: 1; }

.login-logo {
  font-family: var(--font-h);
  font-size: 36px;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: neonGlow 2.5s ease-in-out infinite;
}

.login-tag { font-size: 12px; color: var(--blue); margin-top: 8px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
.login-sub { font-size: 26px; color: var(--t1); font-weight: 700; font-family: var(--font-h); margin-bottom: 4px; letter-spacing: -0.5px; }
.login-p { font-size: 14px; color: var(--t3); margin-bottom: 28px; line-height: 1.6; }

.glass-input {
  background: rgba(0, 0, 0, 0.3);
  border: 2.5px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--t1);
  padding: 14px 16px;
  width: 100%;
  transition: var(--transition-fast);
  font-family: var(--font-b);
  font-size: 15px;
  outline: none;
  backdrop-filter: blur(8px);
}

.glass-input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.2);
  background: rgba(0, 0, 0, 0.4);
}

.signin-btn {
  width: 100%;
  padding: 15px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--blue) 0%, var(--purple) 100%);
  color: white;
  font-family: var(--font-h);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
  border: 2.5px solid var(--blue);
  cursor: pointer;
  transition: var(--transition);
  margin-top: 28px;
  box-shadow: 0 8px 28px rgba(0, 212, 255, 0.35);
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}

.signin-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.15) 50%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.signin-btn:active::before { opacity: 1; }
.signin-btn:hover:not(:disabled) { box-shadow: 0 14px 45px rgba(0, 212, 255, 0.5); transform: translateY(-2px); border-color: var(--purple); }
.signin-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.spin { width: 18px; height: 18px; border: 2.5px solid rgba(255, 255, 255, 0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-banner, .success-banner {
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  border: 2px solid;
  backdrop-filter: blur(10px);
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  animation: slideInLeft 0.4s ease-out;
}

.error-banner { background: rgba(255, 71, 87, 0.15); border-color: var(--red); color: var(--red); }
.success-banner { background: rgba(0, 255, 159, 0.15); border-color: var(--green); color: var(--green); }

/* SIDEBAR */
.shell { display: flex; min-height: 100vh; width: 100%; overflow-x: hidden; }

.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--s1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 3px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 60;
}

.sidebar.open { transform: translateX(0); opacity: 1; }
.sidebar.closed { transform: translateX(-105%); opacity: 0; }

.content { flex: 1; overflow-y: auto; background: transparent; position: relative; min-height: 100vh; width: 100%; }
.pad { padding: 24px 28px; }

.sb-brand {
  padding: 28px 22px 20px;
  border-bottom: 2px solid var(--glass-border);
}

.sb-brand-name {
  font-family: var(--font-h);
  font-weight: 800;
  font-size: 22px;
  background: linear-gradient(135deg, var(--blue), var(--green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1.5px;
  animation: neonGlow 2s ease-in-out infinite;
}

.sb-user {
  padding: 18px 22px;
  border-bottom: 2px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 14px;
}

.av {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.sb-uname { font-size: 14px; font-weight: 700; line-height: 1.3; }
.sb-usub { font-size: 12px; color: var(--t3); }

.sb-nav { flex: 1; padding: 16px 0; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--t2);
  transition: var(--transition);
  user-select: none;
  position: relative;
  margin: 0 8px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.5px;
}

.nav-item:hover {
  background: rgba(0, 212, 255, 0.1);
  color: var(--t1);
  border: 2px solid var(--blue);
  transform: translateX(6px);
}

.nav-item.on {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(184, 74, 255, 0.2));
  border: 2px solid var(--blue);
  color: var(--blue);
  box-shadow: inset 0 0 20px rgba(0, 212, 255, 0.15);
}

.nav-ic { font-size: 18px; width: 24px; text-align: center; transition: var(--transition-fast); }

.sb-foot { padding: 18px 22px; border-top: 2px solid var(--glass-border); }

.logout {
  width: 100%;
  background: transparent;
  border: 2.5px solid var(--glass-border);
  color: var(--t2);
  border-radius: var(--radius-sm);
  padding: 12px;
  font-size: 13px;
  cursor: pointer;
  font-family: var(--font-h);
  font-weight: 700;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.logout:hover { border-color: var(--red); color: var(--red); background: rgba(255, 71, 87, 0.15); box-shadow: 0 6px 20px rgba(255, 71, 87, 0.2); }

.ph { margin-bottom: 32px; }
.ph h2 { font-family: var(--font-h); font-size: 32px; font-weight: 800; letter-spacing: -1px; background: linear-gradient(135deg, var(--blue), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.ph p { font-size: 14px; color: var(--t3); margin-top: 8px; }

/* MOBILE RESPONSIVE */
.mobile-sidebar-toggle { display: none; }
.sidebar-backdrop { display: none; }

@media (max-width: 900px) {
  .shell { flex-direction: column; }
  .sidebar { position: fixed; inset: 0 auto 0 0; height: 100vh; width: 280px; transform: translateX(-105%); box-shadow: 4px 0 30px rgba(0, 0, 0, 0.5); }
  .sidebar.open { transform: translateX(0); }
  .sidebar-backdrop { display: block; position: fixed; inset: 0; z-index: 55; background: rgba(0, 0, 0, 0.5); animation: fadeInUp 0.3s ease-out; }
  .sidebar-backdrop.hidden { display: none; }
  .mobile-sidebar-toggle { display: inline-flex; position: fixed; top: 16px; left: 16px; z-index: 70; width: 48px; height: 48px; border: 2.5px solid var(--blue); background: rgba(0, 0, 0, 0.6); border-radius: var(--radius-sm); color: var(--blue); font-size: 20px; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(10px); box-shadow: 0 4px 16px rgba(0, 212, 255, 0.2); transition: var(--transition-fast); }
  .mobile-sidebar-toggle:hover { background: rgba(0, 212, 255, 0.2); }
  .content { padding-top: 60px; }
  .pad { padding: 16px 14px; }
  .stats { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .g2 { grid-template-columns: 1fr; gap: 16px; }
  .card { margin-bottom: 16px; }
}

@media (max-width: 768px) {
  .stats { grid-template-columns: 1fr; }
  .signin-card { padding: 32px 24px; }
  .login-Logo { font-size: 28px; }
  .sb-brand-name { font-size: 18px; }
  .tbl { font-size: 13px; }
  .tbl th, .tbl td { padding: 10px 12px; }
}

@media (max-width: 576px) {
  .signin-card { padding: 24px 16px; }
  .login-wrap { padding: 12px; }
  .login-logo { font-size: 24px; gap: 10px; }
  .login-sub { font-size: 20px; }
  .field { margin-bottom: 14px; }
  .btn { padding: 12px 18px; font-size: 13px; }
  .dz { padding: 28px 16px; }
  .score-banner { padding: 28px 16px; }
  .sb-num { font-size: 48px; }
}

/* ENHANCED CUSTOM CURSOR - Animated, Glowing, Magnetic */
#custom-cursor-root {
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  mix-blend-mode: screen;
}

#cursor-dot {
  position: fixed;
  pointer-events: none;
  border-radius: 50%;
  width: 8px;
  height: 8px;
  background: var(--blue);
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.9), inset 0 0 6px rgba(0, 212, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.15s ease, height 0.15s ease;
  will-change: transform;
 }

#cursor-ring {
  position: fixed;
  pointer-events: none;
  width: 32px;
  height: 32px;
  border: 2.5px solid var(--blue);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.2s ease, height 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4), inset 0 0 10px rgba(0, 212, 255, 0.1);
  will-change: transform;
  opacity: 0.8;
}

.cursor-hover #cursor-dot {
  width: 12px;
  height: 12px;
  background: var(--purple);
  box-shadow: 0 0 18px rgba(184, 74, 255, 0.95), inset 0 0 8px rgba(184, 74, 255, 0.6);
}

.cursor-hover #cursor-ring {
  width: 48px;
  height: 48px;
  border-color: var(--purple);
  box-shadow: 0 0 30px rgba(184, 74, 255, 0.6), inset 0 0 15px rgba(184, 74, 255, 0.2);
}

.cursor-disabled-mode, #custom-cursor-root.disabled {
  display: none !important;
}

`;
    try { initScrollReveal(); } catch (e) { /* ignore */ }
    // Add click animation handler (with guard to prevent duplicates)
    if (!window._clickAnimInitialized) {
        window._clickAnimInitialized = true;
        document.addEventListener('click', e => {
            const btn = e.target.closest('button, .btn, .nav-item, .rt');
            if (btn) {
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = '', 100);
            }
        });
    }
};

// Enhanced custom cursor with magnetic hover effect
export const initCustomCursor = () => {
    if ('ontouchstart' in window || window.matchMedia('(hover: none)').matches) return;

    if (document.getElementById('custom-cursor-root')) return;
    const root = document.createElement('div');
    root.id = 'custom-cursor-root';
    root.className = 'cursor-enabled';

    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    const ring = document.createElement('div');
    ring.id = 'cursor-ring';
    const trail = document.createElement('div');
    trail.id = 'cursor-trail';
    trail.style.cssText = 'position:fixed;width:6px;height:6px;border-radius:50%;background:rgba(0,212,255,0.6);pointer-events:none;z-index:99998;display:none;box-shadow:0 0 12px rgba(0,212,255,0.8);';

    root.append(dot, ring, trail);
    document.body.appendChild(root);

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, dotX = 0, dotY = 0;
    const speed = 0.25;
    let isHovering = false;
    let trailTimeout;

    const createTrail = (x, y) => {
        const trailDot = document.createElement('div');
        trailDot.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:4px;height:4px;border-radius:50%;background:rgba(0,212,255,0.4);pointer-events:none;z-index:99997;box-shadow:0 0 8px rgba(0,212,255,0.6);`;
        document.body.appendChild(trailDot);
        
        setTimeout(() => {
            trailDot.style.transition = 'opacity 0.5s ease';
            trailDot.style.opacity = '0';
        }, 10);
        setTimeout(() => trailDot.remove(), 600);
    };

    const render = () => {
        ringX += (mouseX - ringX) * speed;
        ringY += (mouseY - ringY) * speed;
        dotX += (mouseX - dotX) * 0.4;
        dotY += (mouseY - dotY) * 0.4;
        
        dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
        ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
        
        requestAnimationFrame(render);
    };
    render();

    const update = e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        root.classList.add('cursor-enabled');
        
        // Trail effect
        if (Math.random() > 0.8) createTrail(mouseX - 2, mouseY - 2);
    };
    window.addEventListener('mousemove', update);

    const hoverable = 'button, a, .btn, .nav-item, input, select, textarea, .card, .stat, .qc';
    document.addEventListener('mouseover', event => {
        const target = event.target.closest(hoverable);
        if (target) {
            root.classList.add('cursor-hover');
            isHovering = true;
            
            // Magnetic effect - pull cursor towards clickable
            const rect = target.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distX = centerX - mouseX;
            const distY = centerY - mouseY;
            const dist = Math.sqrt(distX * distX + distY * distY);
            
            if (dist < 100) {
                mouseX += distX * 0.15;
                mouseY += distY * 0.15;
            }
        }
    });
    
    document.addEventListener('mouseout', event => {
        if (event.target.closest(hoverable)) {
            root.classList.remove('cursor-hover');
            isHovering = false;
        }
    });

    const toggle = () => {
        const isDisabled = document.body.classList.toggle('cursor-disabled-mode');
        if (isDisabled) {
            root.style.display = 'none';
        } else {
            root.style.display = 'block';
        }
        return !isDisabled;
    };

    let btn = document.getElementById('cursor-toggle-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'cursor-toggle-btn';
        btn.className = 'cursor-toggle-btn';
        btn.innerText = '✨ Custom Cursor';
        btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10000;padding:12px 18px;border:2.5px solid var(--blue);border-radius:var(--radius-sm);background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);color:var(--blue);font-size:12px;font-family:var(--font-h);user-select:none;cursor:pointer;box-shadow:0 0 30px rgba(0,212,255,0.3);transition:all 0.3s ease;font-weight:700;letter-spacing:0.8px;';
        btn.onclick = () => {
            const active = toggle();
            btn.innerText = active ? '✨ Cursor: ON' : '✨ Cursor: OFF';
            btn.style.borderColor = active ? 'var(--blue)' : 'var(--t3)';
            btn.style.color = active ? 'var(--blue)' : 'var(--t3)';
        };
        document.body.appendChild(btn);
    }
    btn.innerText = document.body.classList.contains('cursor-disabled-mode') ? '✨ Cursor: OFF' : '✨ Cursor: ON';
    window.toggleCustomCursor = toggle;
};

export const gradeOf = p => {
    if (p >= 75) return { g: 'A', cls: 'gA', e: '🏆' };
    if (p >= 60) return { g: 'B', cls: 'gB', e: '📘' };
    if (p >= 50) return { g: 'C', cls: 'gC', e: '📗' };
    if (p >= 35) return { g: 'D', cls: 'gD', e: '📙' };
    return { g: 'F', cls: 'gF', e: '📕' };
};

export const mkCls = (got, max) => {
    const p = got / max;
    return p >= .7 ? 'mh' : p >= .4 ? 'mm' : 'ml';
};

export function AnimatedNumber({ value, duration = 1500 }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = null, frameId;
        const finalVal = parseInt(value, 10);
        if (isNaN(finalVal)) {
            setCount(value);
            return;
        }
        const animate = time => {
            if (!start) start = time;
            const progress = Math.min((time - start) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(easeProgress * finalVal));
            if (progress < 1) frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [value, duration]);
    return e(React.Fragment, null, count);
}

export function Donut({ value = 0, color = 'var(--blue)', label = '', size = 128 }) {
    const r = 42, circ = 2 * Math.PI * r, pct = Math.min(100, Math.max(0, value)), dash = pct / 100 * circ;
    const [drawn, setDrawn] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setDrawn(true), 50);
        return () => clearTimeout(t);
    }, []);
    return e("div", {
        style: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }
    }, e("div", {
        style: { width: size, height: size, borderRadius: '50%', animation: 'pulseGlow 3s infinite', position: 'relative' }
    }, e("svg", {
        width: size, height: size, viewBox: "0 0 100 100", style: { transform: 'rotate(-90deg)', overflow: 'visible' }
    }, e("circle", { cx: "50", cy: "50", r: r, fill: "none", stroke: "var(--bdr)", strokeWidth: "12" }), e("circle", {
        cx: "50", cy: "50", r: r, fill: "none", stroke: color, strokeWidth: "12", strokeLinecap: "round",
        strokeDasharray: circ, strokeDashoffset: drawn ? circ - dash : circ,
        style: { transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }
    }), e("text", {
        x: "50", y: "50", transform: "rotate(90 50 50)", textAnchor: "middle", fill: "var(--t1)", fontSize: "17", fontWeight: "700", fontFamily: "var(--font-m)"
    }, e(AnimatedNumber, { value: Math.round(pct) }), "%"), e("text", {
        x: "50", y: "65", transform: "rotate(90 50 50)", textAnchor: "middle", fill: "var(--t3)", fontSize: "9", fontFamily: "var(--font-b)"
    }, e(AnimatedNumber, { value: value }), "/100"))), e("div", {
        style: { fontSize: 10, color: 'var(--t3)', marginTop: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-b)' }
    }, label));
}

export function Orbs() {
  return e("div", { className: "orbs" }, 
    e("div", { className: "orb o1" }), 
    e("div", { className: "orb o2" }), 
    e("div", { className: "orb o3" }), 
    e("div", { className: "orb o4" })
  );
}

export const initPageTransitions = () => {
    document.body.classList.add('page-transition-enter');
    setTimeout(() => document.body.classList.remove('page-transition-enter'), 450);

    document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (!a || a.target || a.href.indexOf(location.origin) !== 0 || a.href.includes('#')) return;
        e.preventDefault();
        document.body.classList.add('page-transition-exit');
        setTimeout(() => { window.location.href = a.href; }, 300);
    });
};

export const initPageLoader = () => {
    if (document.getElementById('page-loader')) return;
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="page-loader-dots"><div class="page-loader-dot"></div><div class="page-loader-dot"></div><div class="page-loader-dot"></div></div>';
    document.body.appendChild(loader);

    // Hide loader function - use flag to prevent double execution
    let loaderHidden = false;
    const hideLoader = () => {
        if (loaderHidden) return;
        loaderHidden = true;
        loader.classList.add('hidden');
        setTimeout(() => { loader.remove(); }, 350);
    };

    // If page already loaded, hide immediately
    if (document.readyState === 'complete') {
        setTimeout(hideLoader, 300);
    } else {
        // Wait for load event
        window.addEventListener('load', () => {
            setTimeout(hideLoader, 300);
        });
        // Fallback: hide after 3 seconds anyway
        setTimeout(hideLoader, 3000);
    }
};

export const initScrollReveal = () => {
    const candidateSelector = '.reveal, .card, .stat, .qc, .signin-card, .ph, .sb-nav';
    const items = Array.from(document.querySelectorAll(candidateSelector));

    items.forEach(el => el.classList.add('reveal')); // apply default property

    if (!items.length || !('IntersectionObserver' in window)) {
        items.forEach(i => i.classList.add('reveal-visible'));
        return;
    }
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    items.forEach(item => { obs.observe(item); });
};

export function Shell({ sidebar, children }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeSidebar = () => setMobileOpen(false);

    return e("div", { className: "shell" }, 
        e("div", { className: `sidebar ${mobileOpen ? 'open' : 'closed'}` }, sidebar), 
        e("div", { className: mobileOpen ? 'sidebar-backdrop' : 'sidebar-backdrop hidden', onClick: closeSidebar }),
        e("button", { className: "mobile-sidebar-toggle", onClick: () => setMobileOpen(open => !open), type: 'button' }, mobileOpen ? '✕' : '☰'),
        e("div", { className: "content bg-grid", onClick: closeSidebar }, children)
    );
}

export function SidebarBrand({ role }) {
    return e("div", { className: "sb-brand" }, 
        e("div", { className: "sb-brand-name" }, "GRADIFY"), 
        e("div", { className: `sb-brand-role role-c-${role}` }, role + " Portal")
    );
}
