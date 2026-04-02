import { useState, useRef, useEffect, useCallback } from "react";
import { signIn, signOutUser, addUser as fbAddUser, removeUser as fbRemoveUser, updateUser as fbUpdateUser, addMessage as fbAddMessage, addExam as fbAddExam, updateExam as fbUpdateExam, removeExam as fbRemoveExam, onUsersChange, onMessagesChange, onExamsChange, seedDataIfEmpty, addSubject as fbAddSubject, removeSubject as fbRemoveSubject, onSubjectsChange, addSubjectExam as fbAddSubjectExam, removeSubjectExam as fbRemoveSubjectExam, onSubjectExamsChange } from "./firebaseService.js";

/* ══════════════════════════════════════════════════════════════
   STYLES — injected once via useEffect
══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root {
  /* Image Inspired Dark Mode (Default) - Midnight Orange */
  --bg: #111111;
  --s1: rgba(26, 26, 26, 0.85);
  --s2: rgba(36, 36, 36, 0.9);
  --s3: rgba(48, 48, 48, 0.9);
  --bdr: #2A2A2A;
  --t1: #F5F5F5;
  --t2: #A3A3A3;
  --t3: #737373;
  
  --blue: #F94C24;   /* Primary: Bright Bold Orange from image */
  --blue2: #D43916;  /* Primary darker (Deep Orange) */
  --green: #E86638;  /* Secondary: Soft Orange */
  --gold: #F5A623;   /* Accent: Yellow/Gold */
  --red: #EF4444;    /* Alert: Red */
  --purple: #8B5CF6;

  --font-h: 'Sora', sans-serif;
  --font-b: 'Inter', sans-serif;
  --font-m: 'JetBrains Mono', monospace;
}

:root.light {
  /* Secondary Light Mode configuration - Vibrant Green */
  --bg: #FAFAFA;
  --s1: rgba(255, 255, 255, 0.95);
  --s2: rgba(243, 244, 246, 0.9);
  --s3: rgba(229, 231, 235, 0.9);
  --bdr: #D1D5DB;
  --t1: #111827;
  --t2: #374151;
  --t3: #6B7280;

  --blue: #0ACF83;   /* Primary: Vibrant Bright Green */
  --blue2: #08A467;
  --green: #84CC16;
  --gold: #EAB308;
  --red: #EF4444;
  --purple: #F97316;
}

html,body,#root{height:100%;background-color:var(--bg);position:relative;transition:background-color 0.4s ease;}
body{font-family:var(--font-b);color:var(--t1);}

@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideLeftIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulseGlow { 0% { box-shadow: 0 0 0px rgba(108,99,255,0.25); } 50% { box-shadow: 0 0 20px rgba(108,99,255,0.55); } 100% { box-shadow: 0 0 0px rgba(108,99,255,0.25); } }
@keyframes popIn { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
@keyframes rotatePop { from { transform: rotate(-90deg) scale(0); } to { transform: rotate(0deg) scale(1); } }
@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
@keyframes floatOrb { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-30px) translateX(15px); } }
@keyframes growDown { from { transform: scaleY(0); } to { transform: scaleY(1); } }

.orbs { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.05; animation: floatOrb 12s ease-in-out infinite; }
.o1 { width: 400px; height: 400px; background: var(--blue); top: -10%; left: -5%; animation-duration: 14s; }
.o2 { width: 500px; height: 500px; background: var(--green); bottom: -10%; right: -10%; animation-duration: 18s; animation-delay: -5s; }
.o3 { width: 300px; height: 300px; background: var(--purple); top: 30%; left: 20%; animation-duration: 11s; animation-delay: -2s; }
.o4 { width: 600px; height: 600px; background: var(--gold); top: 5%; right: 5%; animation-duration: 20s; animation-delay: -7s; }

/* Subtle academic grid texture */
#root::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: linear-gradient(var(--bdr) 1px, transparent 1px), linear-gradient(90deg, var(--bdr) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:6px;}

/* ── SHELL ── */
.shell{display:flex;height:100vh;overflow:hidden;}
.sidebar{width:240px;flex-shrink:0;background:var(--s1);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-right:1px solid var(--bdr);display:flex;flex-direction:column;overflow-y:auto;transition:all 0.3s ease;}
.content{flex:1;overflow-y:auto;background:transparent;position:relative;}
.pad{padding:32px 36px;}

/* ── SIDEBAR ── */
.sb-brand{padding:24px 20px 16px;border-bottom:1px solid var(--bdr);}
.sb-brand-name{font-family:var(--font-h);font-weight:800;font-size:20px;background:linear-gradient(135deg,var(--blue),var(--green));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.sb-brand-role{font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;font-weight:600;}
.role-c-admin{color:var(--gold)!important;}
.role-c-teacher{color:var(--blue)!important;}
.role-c-student{color:var(--green)!important;}
.sb-user{padding:16px 20px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:12px;}
.av{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}
.av-admin{background:rgba(245,166,35,0.15);color:var(--gold);border:1px solid rgba(245,166,35,0.3);}
.av-teacher{background:rgba(108,99,255,0.15);color:var(--blue);border:1px solid rgba(108,99,255,0.3);}
.av-student{background:rgba(0,212,170,0.15);color:var(--green);border:1px solid rgba(0,212,170,0.3);}
.sb-uname{font-size:14px;font-weight:600;line-height:1.3;}
.sb-usub{font-size:12px;color:var(--t3);}
.sb-nav{flex:1;padding:12px 0;}
.nav-item{display:flex;align-items:center;gap:12px;padding:12px 20px;cursor:pointer;font-size:14px;color:var(--t2);transition:all 0.3s ease;user-select:none;font-weight:500;position:relative;opacity:0;animation:slideLeftIn 0.5s ease forwards;}
.nav-item:nth-child(1) { animation-delay: 0.1s; }
.nav-item:nth-child(2) { animation-delay: 0.15s; }
.nav-item:nth-child(3) { animation-delay: 0.2s; }
.nav-item:nth-child(4) { animation-delay: 0.25s; }
.nav-item:hover{background:var(--s2);color:var(--t1);transform:translateX(4px);}
.nav-item::before{content:"";position:absolute;left:0;top:0;height:100%;width:3px;background:transparent;transform:scaleY(0);transform-origin:top;transition:all 0.3s ease;}

.nav-item.on{background:var(--s2);color:var(--blue);text-shadow:0 0 12px rgba(108,99,255,0.3);}
.nav-item.on::before{background:var(--blue);transform:scaleY(1);animation:growDown 0.3s ease forwards;}

.nav-item.on.na{color:var(--gold);text-shadow:0 0 12px rgba(245,166,35,0.3);}
.nav-item.on.na::before{background:var(--gold);}
.nav-item.on.nt{color:var(--blue);}
.nav-item.on.nt::before{background:var(--blue);}
.nav-item.on.ns{color:var(--green);text-shadow:0 0 12px rgba(0,212,170,0.3);}
.nav-item.on.ns::before{background:var(--green);}
.nav-ic{font-size:18px;width:24px;text-align:center;transition:all 0.3s ease;}
.nav-item.on .nav-ic{filter:drop-shadow(0 0 4px currentColor);}
.nav-badge{margin-left:auto;border-radius:12px;font-size:11px;padding:2px 8px;font-weight:700;}
.sb-foot{padding:16px 20px;border-top:1px solid var(--bdr);}
.logout{width:100%;background:var(--s2);border:1px solid var(--bdr);color:var(--t2);border-radius:10px;padding:10px;font-size:13px;cursor:pointer;font-family:var(--font-b);font-weight:600;transition:all 0.3s ease;}
.logout:hover{border-color:var(--red);color:var(--red);background:rgba(239,68,68,0.05);}

/* ── PAGE HEADER ── */
.ph{margin-bottom:28px;}
.ph h2{font-family:var(--font-h);font-size:28px;font-weight:700;letter-spacing:-0.5px;}
.ph p{font-size:14px;color:var(--t3);margin-top:6px;}

/* ── THEME TOGGLE ── */
.theme-toggle{background:var(--s1);backdrop-filter:blur(12px);border:1px solid var(--bdr);color:var(--t1);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s ease;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.05);margin-left:auto;}
.theme-toggle:hover{transform:scale(1.05);border-color:var(--blue);color:var(--blue);}

/* ── CARDS (GLASSMORPHISM) ── */
.card, .stat, .qc, .msg-wrap, .login-box, .edit-panel, .upload-bar{
  background:var(--s1);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
  border:1px solid var(--bdr);
  border-radius:16px;
  box-shadow:0 8px 32px 0 rgba(0,0,0,0.04);
  transition:all 0.3s ease;
  overflow:hidden;
}
.card{margin-bottom:20px;opacity:0;animation:fadeInUp 0.6s ease forwards;}
.g2 > .card:nth-child(1) { animation-delay: 0.1s; }
.g2 > .card:nth-child(2) { animation-delay: 0.2s; }
.card:hover{border-color:rgba(108,99,255,0.2);}
.card-h{padding:16px 20px;background:var(--s2);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;gap:12px;}
.card-ht{font-family:var(--font-h);font-size:16px;font-weight:600;}
.card-b{padding:20px;}

/* ── STATS ── */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:28px;}
.stat{padding:20px;border-top:2px solid transparent;opacity:0;animation:fadeInUp 0.6s ease forwards;}
.stats > .stat:nth-child(1){animation-delay:0.05s;}
.stats > .stat:nth-child(2){animation-delay:0.1s;}
.stats > .stat:nth-child(3){animation-delay:0.15s;}
.stats > .stat:nth-child(4){animation-delay:0.2s;}
.stat:hover{transform:translateY(-2px);border-top-color:var(--blue);box-shadow:0 12px 40px rgba(0,0,0,0.08);}
.stat-v{font-family:var(--font-m);font-size:32px;font-weight:700;line-height:1;margin-bottom:4px;}
.stat-l{font-size:12px;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-top:8px;font-weight:600;}
.stat-i{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;background:linear-gradient(135deg,var(--s3),var(--s2));border:1px solid var(--bdr);margin-bottom:16px;box-shadow:0 4px 12px rgba(0,0,0,0.05);}

/* ── TABLE ── */
.tbl{width:100%;border-collapse:separate;border-spacing:0;}
.tbl th{text-align:left;font-family:var(--font-h);font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--t3);padding:12px 18px;border-bottom:1px solid var(--bdr);font-weight:700;}
.tbl td{padding:14px 18px;font-size:14px;border-bottom:1px solid var(--bdr);color:var(--t2);transition:background 0.2s ease;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr{transition:all 0.2s ease;}
.tbl tr:hover td{background:var(--s2);}
.tbl tbody tr:hover td:first-child{box-shadow:inset 3px 0 0 0 var(--blue);}
.tbl td b{color:var(--t1);font-weight:600;}

/* ── BADGES ── */
.badge{display:inline-flex;align-items:center;font-size:11px;font-weight:700;padding:4px 10px;border-radius:24px;letter-spacing:0.5px;font-family:var(--font-b);animation:popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;}
.bg-admin{background:rgba(245,166,35,0.1);color:var(--gold);border:1px solid rgba(245,166,35,0.2);}
.bg-teacher{background:rgba(108,99,255,0.1);color:var(--blue);border:1px solid rgba(108,99,255,0.2);}
.bg-student{background:rgba(0,212,170,0.1);color:var(--green);border:1px solid rgba(0,212,170,0.2);}
.bg-green{background:rgba(0,212,170,0.15);color:var(--green);border:1px solid rgba(0,212,170,0.3);}
.bg-gold{background:rgba(245,166,35,0.15);color:var(--gold);border:1px solid rgba(245,166,35,0.3);}
.bg-red{background:rgba(239,68,68,0.15);color:var(--red);border:1px solid rgba(239,68,68,0.3);}
.bg-purple{background:rgba(139,92,246,0.15);color:var(--purple);border:1px solid rgba(139,92,246,0.3);}

/* ── FORM ── */
.field{margin-bottom:18px;}
.fl{display:block;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--blue);margin-bottom:8px;font-family:var(--font-h);}
input[type=text],input[type=password],input[type=number],select,textarea{
  width:100%;background:var(--bg);border:1px solid var(--bdr);border-radius:10px;
  color:var(--t1);font-family:var(--font-b);font-size:14px;padding:12px 14px;
  outline:none;transition:all 0.3s ease;box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);
}
input:focus,textarea:focus,select:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(108,99,255,0.15);}
input::placeholder,textarea::placeholder{color:var(--t3);}
select option{background:var(--bg);color:var(--t1);}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;}

/* ── BUTTONS ── */
.btn{border:none;border-radius:10px;padding:10px 18px;font-family:var(--font-h);font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all 0.3s ease;}
.btn:disabled{opacity:0.5;cursor:not-allowed;}
.btn-blue{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;background-size:200% auto;animation:shimmer 8s linear infinite;box-shadow:0 4px 12px rgba(0,0,0,0.25);} 
.btn-blue:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,0.35);}
.btn-gold{background:var(--gold);color:#fff;} .btn-gold:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px);}
.btn-green{background:linear-gradient(135deg,var(--green),var(--blue2));color:#fff;background-size:200% auto;animation:shimmer 8s linear infinite;box-shadow:0 4px 12px rgba(0,0,0,0.25);} 
.btn-green:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,0.35);}
.btn-ghost{background:var(--s2);border:1px solid var(--bdr);color:var(--t2);}
.btn-ghost:hover:not(:disabled){border-color:var(--blue);color:var(--t1);background:var(--s3);}
.btn-danger{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:var(--red);}
.btn-danger:hover:not(:disabled){background:rgba(239,68,68,0.2);transform:translateY(-1px);}
.btn-sm{padding:8px 14px;font-size:13px;}
.btn-lg{padding:14px 28px;font-size:16px;font-family:var(--font-h);font-weight:700;}
button:active, .btn:active, .signin-btn:active, .logout:active, .add-q-btn:active, .add-part-btn:active, .theme-toggle:active, .rt:active { transform: scale(0.95) !important; transition: transform 0.1s ease !important; }

/* ── DROPZONE ── */
.dz{border:2px dashed var(--bdr);border-radius:14px;padding:32px 24px;text-align:center;cursor:pointer;transition:all 0.3s ease;background:var(--bg);position:relative;}
.dz:hover,.dz.over{border-color:var(--blue);background:rgba(108,99,255,0.05);}
.dz input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
.dz-icon{font-size:32px;margin-bottom:10px;transition:transform 0.3s ease;}
.dz:hover .dz-icon{transform:translateY(-4px);}
.dz-text{font-size:14px;color:var(--t2);font-weight:500;}
.dz-text b{color:var(--blue);}
.dz-hint{font-size:12px;color:var(--t3);margin-top:6px;}
.fp{display:flex;align-items:center;gap:12px;background:var(--s2);border:1px solid var(--bdr);border-radius:10px;padding:12px 16px;}
.fp-info{flex:1;min-width:0;}
.fp-name{font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fp-size{font-size:12px;color:var(--t3);margin-top:2px;}

/* ── PART-WISE MARK BUILDER ── */
.part-list{display:flex;flex-direction:column;gap:16px;}
.part-box{background:var(--bg);border:1px solid var(--bdr);border-radius:12px;overflow:hidden;transition:all 0.3s ease;}
.part-box:focus-within{border-color:var(--blue);box-shadow:0 0 0 3px rgba(108,99,255,0.1);}
.part-head{display:flex;align-items:center;gap:12px;padding:12px 18px;background:var(--s2);border-bottom:1px solid var(--bdr);}
.part-head-label{font-family:var(--font-h);font-size:14px;font-weight:600;color:var(--t1);flex:1;}
.part-marks-chip{background:rgba(108,99,255,0.15);border:1px solid rgba(108,99,255,0.3);color:var(--blue);font-size:12px;font-weight:700;padding:4px 12px;border-radius:24px;font-family:var(--font-m);}
.part-body{padding:16px 18px;}
.q-row{display:grid;grid-template-columns:1fr 90px 40px;gap:10px;align-items:center;margin-bottom:10px;}
.q-row:last-child{margin-bottom:0;}
.add-q-btn{display:flex;align-items:center;gap:8px;background:transparent;border:1px dashed var(--t3);color:var(--t2);border-radius:8px;padding:10px 14px;cursor:pointer;font-size:13px;font-family:var(--font-b);font-weight:500;transition:all 0.3s ease;margin-top:10px;}
.add-q-btn:hover{border-color:var(--blue);color:var(--blue);background:rgba(108,99,255,0.05);}
.add-part-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;background:var(--s1);border:2px dashed var(--bdr);color:var(--t2);border-radius:12px;padding:16px;cursor:pointer;font-size:15px;font-family:var(--font-h);font-weight:600;transition:all 0.3s ease;margin-top:8px;}
.add-part-btn:hover{border-color:var(--blue);color:var(--blue);background:rgba(108,99,255,0.05);}
.total-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(245,166,35,0.15);border:1px solid rgba(245,166,35,0.3);color:var(--gold);font-size:13px;font-weight:700;padding:6px 16px;border-radius:24px;font-family:var(--font-m);}

/* ── PROGRESS ── */
.prog{margin:16px 0;}
.prog-lbl{font-size:12px;font-weight:600;color:var(--t3);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;}
.prog-track{height:6px;background:var(--bdr);border-radius:6px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--green));border-radius:6px;transition:width 0.8s cubic-bezier(0.4, 0, 0.2, 1);box-shadow:0 0 10px rgba(0,212,170,0.5);}

/* ── SCORE BANNER ── */
.score-banner{background:linear-gradient(135deg,var(--s2),var(--s3));border:1px solid var(--bdr);border-radius:16px;padding:36px;text-align:center;margin-bottom:20px;position:relative;overflow:hidden;}
.score-banner::before{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(transparent,rgba(108,99,255,0.1),transparent 30%);animation:rotate 10s linear infinite;}
@keyframes rotate{100%{transform:rotate(360deg);}}
.sb-num{font-family:var(--font-m);font-size:72px;font-weight:800;line-height:1;position:relative;}
.sb-den{font-size:32px;color:var(--t3);font-family:var(--font-m);}
.sb-pct{font-size:16px;color:var(--blue);margin:8px 0 16px;font-weight:700;font-family:var(--font-m);}
.sb-grade{display:inline-block;font-family:var(--font-h);font-size:24px;padding:8px 28px;border-radius:32px;margin-bottom:16px;box-shadow:0 4px 15px rgba(0,0,0,0.1);position:relative;}
.gA{background:rgba(0,212,170,0.15);color:var(--green);border:1px solid rgba(0,212,170,0.4);box-shadow:0 0 20px rgba(0,212,170,0.2);}
.gB{background:rgba(139,92,246,0.15);color:var(--purple);border:1px solid rgba(139,92,246,0.4);box-shadow:0 0 20px rgba(139,92,246,0.2);}
.gC{background:rgba(245,166,35,0.15);color:var(--gold);border:1px solid rgba(245,166,35,0.4);box-shadow:0 0 20px rgba(245,166,35,0.2);}
.gD{background:rgba(230,126,34,0.15);color:#E67E22;border:1px solid rgba(230,126,34,0.4);}
.gF{background:rgba(239,68,68,0.15);color:var(--red);border:1px solid rgba(239,68,68,0.4);box-shadow:0 0 20px rgba(239,68,68,0.2);}
.sb-text{font-size:15px;color:var(--t1);max-width:600px;margin:0 auto;line-height:1.7;}

/* ── PIE ROW ── */
.pie-row{display:flex;justify-content:center;gap:40px;flex-wrap:wrap;padding:28px 0 16px;}

/* ── Q CARD ── */
.qc{margin-bottom:16px;}
.qc-h{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px 20px;background:var(--s2);border-bottom:1px solid var(--bdr);cursor:pointer;transition:background 0.3s ease;}
.qc-h:hover{background:var(--s3);}
.qc-label{font-family:var(--font-h);font-size:15px;font-weight:600;}
.qc-sub{font-size:12px;color:var(--t3);margin-top:4px;}
.qc-b{padding:20px;}
.qc-lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--blue);margin-bottom:8px;font-family:var(--font-h);}
.qc-text{font-size:14px;color:var(--t1);line-height:1.7;margin-bottom:16px;}
.sw2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.sw-s{background:rgba(0,212,170,0.05);border:1px solid rgba(0,212,170,0.2);border-radius:10px;padding:14px 16px;font-size:14px;line-height:1.6;color:var(--green);}
.sw-w{background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 16px;font-size:14px;line-height:1.6;color:var(--red);}
.sw-lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:800;margin-bottom:8px;font-family:var(--font-h);}
.sw-s .sw-lbl{color:var(--green);} .sw-w .sw-lbl{color:var(--red);}
.sug{background:rgba(108,99,255,0.08);border:1px solid rgba(108,99,255,0.2);border-radius:10px;padding:14px 16px;margin-top:14px;font-size:14px;color:var(--t1);line-height:1.7;}
.mk{font-family:var(--font-m);font-size:13px;font-weight:700;padding:4px 14px;border-radius:24px;}
.mh{background:rgba(0,212,170,0.15);color:var(--green);border:1px solid rgba(0,212,170,0.3);}
.mm{background:rgba(245,166,35,0.15);color:var(--gold);border:1px solid rgba(245,166,35,0.3);}
.ml{background:rgba(239,68,68,0.15);color:var(--red);border:1px solid rgba(239,68,68,0.3);}

/* ── UPLOAD RESULT BAR ── */
.upload-bar{padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;}
.upload-bar-title{font-family:var(--font-h);font-size:16px;font-weight:700;}
.upload-bar-sub{font-size:13px;color:var(--t3);margin-top:4px;}
.success-banner{background:rgba(0,212,170,0.1);border:1px solid rgba(0,212,170,0.3);border-radius:12px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:12px;color:var(--green);font-size:15px;font-weight:600;}
.error-banner{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px 20px;margin-bottom:16px;color:var(--red);font-size:14px;}

/* ── EDIT MARKS PANEL ── */
.edit-panel{margin-bottom:20px;}
.edit-panel-h{padding:14px 20px;background:var(--s2);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;}
.edit-panel-ht{font-family:var(--font-h);font-size:14px;font-weight:700;color:var(--blue);}
.edit-q-row{display:grid;grid-template-columns:1fr 90px 90px;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--bdr);}
.edit-q-row:last-child{border-bottom:none;}
.edit-q-name{font-size:14px;color:var(--t1);font-weight:500;}
.edit-total{margin-top:16px;padding:16px 20px;background:var(--s2);border-radius:12px;display:flex;gap:32px;align-items:center;border:1px solid var(--bdr);}

/* ── MESSAGING ── */
.msg-wrap{height:calc(100vh - 160px);display:grid;grid-template-columns:280px 1fr;}
.msg-list{background:var(--s1);border-right:1px solid var(--bdr);overflow-y:auto;}
.msg-list-hd{padding:12px 18px;font-size:11px;font-family:var(--font-h);letter-spacing:1px;text-transform:uppercase;color:var(--t3);border-bottom:1px solid var(--bdr);font-weight:700;}
.msg-contact{padding:14px 18px;cursor:pointer;border-bottom:1px solid var(--bdr);transition:all 0.2s ease;}
.msg-contact:hover{background:var(--s2);}
.msg-contact.active{background:var(--s3);border-left:3px solid var(--blue);}
.msg-cname{font-size:14px;font-weight:600;margin-bottom:4px;color:var(--t1);}
.msg-cprev{font-size:13px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-udot{width:10px;height:10px;background:var(--blue);border-radius:50%;flex-shrink:0;box-shadow:0 0 8px rgba(108,99,255,0.5);}
.msg-main{display:flex;flex-direction:column;background:transparent;}
.msg-mhd{padding:16px 24px;background:var(--s2);border-bottom:1px solid var(--bdr);font-family:var(--font-h);font-size:16px;font-weight:600;}
.msg-body{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:12px;}
.bubble{max-width:70%;padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.6;}
.bm{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;align-self:flex-end;border-bottom-right-radius:4px;box-shadow:0 4px 12px rgba(108,99,255,0.2);}
.bt{background:var(--s1);border:1px solid var(--bdr);color:var(--t1);align-self:flex-start;border-bottom-left-radius:4px;}
.bubble-time{font-size:11px;opacity:0.6;margin-top:6px;font-family:var(--font-m);}
.msg-compose{padding:16px 24px;border-top:1px solid var(--bdr);display:flex;gap:12px;background:var(--s2);}
.msg-input{flex:1;background:var(--bg);border:1px solid var(--bdr);border-radius:12px;color:var(--t1);font-family:var(--font-b);font-size:14px;padding:12px 16px;outline:none;resize:none;transition:all 0.3s ease;}
.msg-input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(108,99,255,0.15);}

/* ── MODAL ── */
.modal-bg{position:fixed;inset:0;background:rgba(8,11,18,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;}
.modal{background:var(--s1);border:1px solid var(--bdr);border-radius:20px;width:100%;max-width:500px;box-shadow:0 24px 60px rgba(0,0,0,0.2);animation:modalFade 0.3s cubic-bezier(0.16, 1, 0.3, 1);}
@keyframes modalFade{from{opacity:0;transform:translateY(20px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
.modal-h{padding:20px 24px;background:var(--s2);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;border-radius:20px 20px 0 0;}
.modal-ht{font-family:var(--font-h);font-size:18px;font-weight:700;}
.modal-x{background:none;border:none;color:var(--t3);font-size:22px;cursor:pointer;line-height:1;transition:color 0.2s;}
.modal-x:hover{color:var(--t1);}
.modal-b{padding:24px;}
.modal-f{padding:16px 24px;border-top:1px solid var(--bdr);display:flex;justify-content:flex-end;gap:12px;}

/* ── LOGIN ── */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden;padding:20px;}
.login-orb{position:absolute;border-radius:50%;filter:blur(60px);animation:floatOrb 15s ease-in-out infinite;pointer-events:none;}
.lo1{width:400px;height:400px;background:var(--blue);opacity:0.1;top:-10%;right:-10%;animation-duration:14s;}
.lo2{width:500px;height:500px;background:var(--green);opacity:0.08;bottom:-15%;left:-10%;animation-duration:18s;animation-delay:-5s;}
.lo3{width:300px;height:300px;background:var(--gold);opacity:0.05;top:40%;left:30%;animation-duration:11s;animation-delay:-2s;}

.signin-card{background:var(--s1);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid var(--bdr);border-radius:24px;padding:48px 40px;width:100%;max-width:420px;box-shadow:0 8px 32px rgba(0,0,0,0.1);animation:fadeInUp 0.8s ease forwards;position:relative;z-index:10;}
.login-top{text-align:center;margin-bottom:28px;}
.login-logo{font-family:var(--font-h);font-size:32px;font-weight:800;display:flex;flex-direction:column;align-items:center;gap:12px;}
.login-logo img{max-height:80px;object-fit:contain;}
.login-logo span{color:var(--t1);}
.login-tag{font-size:13px;color:var(--blue);margin-top:8px;font-weight:600;letter-spacing:1px;text-transform:uppercase;}

.login-sub{font-size:24px;color:var(--t1);font-weight:700;font-family:var(--font-h);margin-bottom:4px;}
.login-p{font-size:14px;color:var(--t3);margin-bottom:24px;}

.role-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;}
.rt{padding:12px 8px;border-radius:12px;border:1px solid var(--bdr);background:var(--bg);cursor:pointer;text-align:center;font-size:12px;font-weight:700;color:var(--t2);transition:all 0.3s ease;user-select:none;font-family:var(--font-b);}
.rt:hover{color:var(--t1);background:var(--s2);}
.rt-emoji{font-size:20px;margin-bottom:6px;}
.rt.on-admin{border-color:var(--gold);background:rgba(245,166,35,0.1);color:var(--gold);box-shadow:0 0 16px rgba(245,166,35,0.15);}
.rt.on-teacher{border-color:var(--blue);background:var(--s2);border:1px solid var(--blue);color:var(--blue);box-shadow:0 0 16px rgba(0,0,0,0.1);}
.rt.on-student{border-color:var(--green);background:var(--s2);border:1px solid var(--green);color:var(--green);}

.glass-input{background:var(--bg);border:1px solid var(--bdr);border-radius:12px;color:var(--t1);padding:14px 16px;width:100%;transition:all 0.3s ease;font-family:var(--font-b);font-size:14px;outline:none;box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);opacity:0;animation:slideLeftIn 0.5s ease forwards;}
.glass-input:focus{border-color:var(--blue);background:var(--bg);box-shadow:0 0 0 3px var(--s3);}
.glass-input::placeholder{color:var(--t3);}
.gi-1{animation-delay:0.2s;}.gi-2{animation-delay:0.3s;}

.signin-btn{width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,var(--blue),var(--blue2));background-size:200% auto;color:white;font-family:var(--font-h);font-weight:600;font-size:15px;border:none;cursor:pointer;transition:all 0.4s ease;animation:shimmer 8s linear infinite;margin-top:24px;}
.signin-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.2);}
.signin-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none;}

/* ── RECENTS & MISC ── */
.recent-exam-row{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-bottom:1px solid var(--bdr);cursor:pointer;transition:all 0.3s ease;border-radius:12px;}
.recent-exam-row:hover{background:var(--s2);transform:translateX(4px);}
.recent-sub{font-size:14px;font-weight:600;font-family:var(--font-h);margin-bottom:4px;}
.recent-date{font-size:12px;color:var(--t3);font-family:var(--font-m);}
.recent-score{font-family:var(--font-m);font-size:15px;font-weight:700;}

.spin{width:18px;height:18px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;}
@keyframes spin{to{transform:rotate(360deg);}}
.empty{text-align:center;padding:40px 24px;color:var(--t3);font-size:14px;font-weight:500;}
.flex{display:flex;}.fac{align-items:center;}.fjb{justify-content:space-between;}.gap{gap:12px;}
.mt8{margin-top:8px;}.mt12{margin-top:12px;}.mt16{margin-top:16px;}.mt20{margin-top:20px;}
@media(max-width:768px){
  .stats{grid-template-columns:1fr 1fr;}
  .g2,.g3{grid-template-columns:1fr;}
  .sw2{grid-template-columns:1fr;}
  .msg-wrap{grid-template-columns:1fr;height:calc(100vh - 120px);}
  .sidebar{display:none;}
  .pad{padding:20px;}
}
`;

/* Seed data moved to firebaseService.js — seeded to Firestore on first run */

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const NOW = () => new Date().toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit'
});
const TODAY = () => new Date().toLocaleDateString('en-GB');
const ini = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmtSz = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const toB64 = f => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(',')[1]);
  r.onerror = rej;
  r.readAsDataURL(f);
});
const gradeOf = p => {
  if (p >= 75) return {
    g: 'A',
    cls: 'gA',
    e: '🏆'
  };
  if (p >= 60) return {
    g: 'B',
    cls: 'gB',
    e: '📘'
  };
  if (p >= 50) return {
    g: 'C',
    cls: 'gC',
    e: '📗'
  };
  if (p >= 35) return {
    g: 'D',
    cls: 'gD',
    e: '📙'
  };
  return {
    g: 'F',
    cls: 'gF',
    e: '📕'
  };
};
const mkCls = (got, max) => {
  const p = got / max;
  return p >= .7 ? 'mh' : p >= .4 ? 'mm' : 'ml';
};

/* Reducer removed — now using Firebase Firestore for state management */

/* ══════════════════════════════════════════════════════════════
   SMALL REUSABLES
══════════════════════════════════════════════════════════════ */
function AnimatedNumber({
  value,
  duration = 1500
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null,
      frameId;
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
function Donut({
  value = 0,
  color = 'var(--blue)',
  label = '',
  size = 128
}) {
  const r = 42,
    circ = 2 * Math.PI * r,
    pct = Math.min(100, Math.max(0, value)),
    dash = pct / 100 * circ;
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 50);
    return () => clearTimeout(t);
  }, []);
  return e("div", {
    style: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, e("div", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      animation: 'pulseGlow 3s infinite',
      position: 'relative'
    }
  }, e("svg", {
    width: size,
    height: size,
    viewBox: "0 0 100 100",
    style: {
      transform: 'rotate(-90deg)',
      overflow: 'visible'
    }
  }, e("circle", {
    cx: "50",
    cy: "50",
    r: r,
    fill: "none",
    stroke: "var(--bdr)",
    strokeWidth: "12"
  }), e("circle", {
    cx: "50",
    cy: "50",
    r: r,
    fill: "none",
    stroke: color,
    strokeWidth: "12",
    strokeLinecap: "round",
    strokeDasharray: circ,
    strokeDashoffset: drawn ? circ - dash : circ,
    style: {
      transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }), e("text", {
    x: "50",
    y: "50",
    transform: "rotate(90 50 50)",
    textAnchor: "middle",
    fill: "var(--t1)",
    fontSize: "17",
    fontWeight: "700",
    fontFamily: "var(--font-m)"
  }, e(AnimatedNumber, {
    value: Math.round(pct)
  }), "%"), e("text", {
    x: "50",
    y: "65",
    transform: "rotate(90 50 50)",
    textAnchor: "middle",
    fill: "var(--t3)",
    fontSize: "9",
    fontFamily: "var(--font-b)"
  }, e(AnimatedNumber, {
    value: value
  }), "/100"))), e("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)',
      marginTop: 8,
      fontWeight: 700,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-b)'
    }
  }, label));
}
function DropZone({
  file,
  onChange,
  onRemove
}) {
  const [drag, setDrag] = useState(false);
  if (file) return e("div", {
    className: "fp"
  }, e("span", {
    style: {
      fontSize: 22
    }
  }, file.type === 'application/pdf' ? '📄' : '🖼️'), e("div", {
    className: "fp-info"
  }, e("div", {
    className: "fp-name"
  }, file.name), e("div", {
    className: "fp-size"
  }, fmtSz(file.size))), e("button", {
    className: "btn btn-danger btn-sm",
    onClick: onRemove
  }, "\u2715 Remove"));
  return e("div", {
    className: `dz${drag ? ' over' : ''}`,
    onDragOver: e => {
      e.preventDefault();
      setDrag(true);
    },
    onDragLeave: () => setDrag(false),
    onDrop: e => {
      e.preventDefault();
      setDrag(false);
      e.dataTransfer.files[0] && onChange(e.dataTransfer.files[0]);
    }
  }, e("input", {
    type: "file",
    accept: "image/*,.pdf",
    onChange: e => e.target.files[0] && onChange(e.target.files[0])
  }), e("div", {
    className: "dz-icon"
  }, "\uD83D\uDCE4"), e("div", {
    className: "dz-text"
  }, e("b", null, "Click or drag"), " file here"), e("div", {
    className: "dz-hint"
  }, "PDF, JPG or PNG \u2014 handwritten or typed"));
}
function QCard({
  q,
  idx
}) {
  const [open, setOpen] = useState(true);
  return e("div", {
    className: "qc"
  }, e("div", {
    className: "qc-h",
    onClick: () => setOpen(o => !o)
  }, e("div", null, e("div", {
    className: "qc-label"
  }, q.questionText || `Question ${idx + 1}`)), e("div", {
    className: "flex fac gap"
  }, e("span", {
    className: `mk ${mkCls(q.marksAwarded, q.maxMarks)}`
  }, q.marksAwarded, "/", q.maxMarks), e("span", {
    style: {
      fontSize: 11,
      color: '#4a5878'
    }
  }, open ? '▲' : '▼'))), open && e("div", {
    className: "qc-b"
  }, e("div", {
    className: "qc-lbl"
  }, "Examiner Feedback"), e("div", {
    className: "qc-text"
  }, q.feedback), e("div", {
    className: "sw2"
  }, e("div", {
    className: "sw-s"
  }, e("div", {
    className: "sw-lbl"
  }, "\u2713 Strengths"), q.strengths), e("div", {
    className: "sw-w"
  }, e("div", {
    className: "sw-lbl"
  }, "\u26A0 Needs Improvement"), q.weaknesses)), q.suggestions && e("div", {
    className: "sug"
  }, e("span", {
    style: {
      fontSize: 9,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--blue)',
      fontWeight: 700,
      display: 'block',
      marginBottom: 4
    }
  }, "\uD83D\uDCA1 Suggestions"), q.suggestions)));
}
function ExamView({
  exam
}) {
  const gi = gradeOf(exam.pct);
  return e("div", null, e("div", {
    className: "score-banner"
  }, e("div", {
    className: "sb-num"
  }, exam.totalScore, e("span", {
    className: "sb-den"
  }, "/", exam.maxScore)), e("div", {
    className: "sb-pct"
  }, exam.pct, "%"), e("div", {
    className: `sb-grade ${gi.cls}`
  }, gi.e, " Grade ", gi.g), e("p", {
    className: "sb-text"
  }, exam.overallFeedback)), e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "\u2726 Performance Scores")), e("div", {
    className: "pie-row"
  }, e(Donut, {
    value: exam.handwriting || 0,
    color: "#a78bfa",
    label: "Handwriting"
  }), e(Donut, {
    value: exam.presentation || 0,
    color: "#3b9eff",
    label: "Presentation"
  }), e(Donut, {
    value: exam.demonstration || 0,
    color: "#22d07a",
    label: "Demonstration"
  }))), e("div", {
    className: "mt12"
  }, (exam.questions || []).map((q, i) => e(QCard, {
    key: i,
    q: q,
    idx: i
  }))));
}

/* ══════════════════════════════════════════════════════════════
   PART-WISE MARK BUILDER COMPONENT
══════════════════════════════════════════════════════════════ */
function MarkBuilder({
  parts,
  setParts
}) {
  const total = parts.reduce((s, p) => s + p.questions.reduce((ss, q) => ss + Number(q.marks || 0), 0), 0);
  const addPart = () => setParts(ps => [...ps, {
    id: Date.now(),
    name: `Part ${String.fromCharCode(65 + ps.length)}`,
    questions: [{
      id: Date.now() + 1,
      text: '',
      marks: ''
    }]
  }]);
  const delPart = pid => setParts(ps => ps.filter(p => p.id !== pid));
  const updPName = (pid, v) => setParts(ps => ps.map(p => p.id === pid ? {
    ...p,
    name: v
  } : p));
  const addQ = pid => setParts(ps => ps.map(p => p.id === pid ? {
    ...p,
    questions: [...p.questions, {
      id: Date.now(),
      text: '',
      marks: ''
    }]
  } : p));
  const delQ = (pid, qid) => setParts(ps => ps.map(p => p.id === pid ? {
    ...p,
    questions: p.questions.filter(q => q.id !== qid)
  } : p));
  const updQ = (pid, qid, f, v) => setParts(ps => ps.map(p => p.id === pid ? {
    ...p,
    questions: p.questions.map(q => q.id === qid ? {
      ...q,
      [f]: v
    } : q)
  } : p));
  const partTotal = p => p.questions.reduce((s, q) => s + Number(q.marks || 0), 0);
  return e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "\u2462 Part-wise Mark Allocation"), e("span", {
    className: "total-chip"
  }, "\uD83D\uDCCA Total: ", total, " marks")), e("div", {
    className: "card-b"
  }, e("p", {
    style: {
      fontSize: 12,
      color: 'var(--t3)',
      marginBottom: 14,
      lineHeight: 1.6
    }
  }, "Add each ", e("b", {
    style: {
      color: 'var(--t2)'
    }
  }, "Part / Section"), ", then add ", e("b", {
    style: {
      color: 'var(--t2)'
    }
  }, "questions inside"), " with marks. AI will follow this exact scheme when grading."), e("div", {
    className: "part-list"
  }, parts.map((part, pi) => e("div", {
    key: part.id,
    className: "part-box"
  }, e("div", {
    className: "part-head"
  }, e("input", {
    type: "text",
    value: part.name,
    onChange: e => updPName(part.id, e.target.value),
    placeholder: "e.g. Part A / Section 1",
    style: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      color: 'var(--t1)',
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 600,
      outline: 'none',
      padding: 0
    }
  }), e("span", {
    className: "part-marks-chip"
  }, partTotal(part), " marks"), parts.length > 1 && e("button", {
    onClick: () => delPart(part.id),
    style: {
      background: '#2a0808',
      border: '1px solid #5a1010',
      color: 'var(--red)',
      borderRadius: 6,
      padding: '4px 10px',
      cursor: 'pointer',
      fontSize: 12,
      fontFamily: 'inherit'
    }
  }, "\u2715 Remove Part")), e("div", {
    className: "part-body"
  }, e("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px 36px',
      gap: 8,
      marginBottom: 6
    }
  }, e("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      fontWeight: 700
    }
  }, "Question / Description"), e("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      fontWeight: 700
    }
  }, "Marks"), e("div", null)), part.questions.map((q, qi) => e("div", {
    key: q.id,
    className: "q-row"
  }, e("input", {
    type: "text",
    value: q.text,
    onChange: e => updQ(part.id, q.id, 'text', e.target.value),
    placeholder: `e.g. Explain photosynthesis (Q${qi + 1})`,
    style: {
      padding: '8px 10px',
      fontSize: 13
    }
  }), e("input", {
    type: "number",
    value: q.marks,
    onChange: e => updQ(part.id, q.id, 'marks', e.target.value),
    min: "0",
    placeholder: "10",
    style: {
      padding: '8px 10px',
      fontSize: 13,
      textAlign: 'center'
    }
  }), part.questions.length > 1 ? e("button", {
    onClick: () => delQ(part.id, q.id),
    style: {
      background: '#2a0808',
      border: '1px solid #5a1010',
      color: 'var(--red)',
      borderRadius: 6,
      padding: '7px',
      cursor: 'pointer',
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\u2715") : e("div", null))), e("button", {
    className: "add-q-btn",
    onClick: () => addQ(part.id)
  }, "\uFF0B Add Question"))))), e("button", {
    className: "add-part-btn",
    onClick: addPart
  }, "\uFF0B Add Part / Section")));
}

/* ══════════════════════════════════════════════════════════════
   EXAM ANALYSER
══════════════════════════════════════════════════════════════ */
function ExamAnalyser({
  currentUser,
  users,
  onSave,
  subjects,
  subjectExams
}) {
  const myStudents = users.filter(u => u.role === 'student' && u.teacherId === currentUser.id);
  const [sid, setSid] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [gstyle, setGstyle] = useState('balanced');
  const [keyFile, setKeyFile] = useState(null);
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prog, setProg] = useState(0);
  const [result, setResult] = useState(null);
  const [editR, setEditR] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sucMsg, setSucMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const ref = useRef(null);

  // Derived data from selections
  const filteredExams = subjectExams.filter(e => String(e.subjectId) === String(selectedSubjectId));
  const selectedSubject = subjects.find(s => String(s.id) === String(selectedSubjectId));
  const selectedExam = subjectExams.find(e => String(e.id) === String(selectedExamId));
  const parts = selectedExam?.parts || [];
  const subject = selectedSubject?.name || '';
  const totalMarks = parts.reduce((s, p) => s + p.questions.reduce((ss, q) => ss + Number(q.marks || 0), 0), 0);
  const schemeText = parts.length > 0 ? parts.map(p => {
    const qs = p.questions.map((q, i) => {
      const qtxt = q.text ? ' "' + q.text + '"' : '';
      return '    Q' + (i + 1) + qtxt + ': ' + (q.marks || '?') + ' marks';
    }).join('\n');
    const ptotal = p.questions.reduce((s, q) => s + Number(q.marks || 0), 0);
    return '  ' + p.name + ' (' + ptotal + ' marks total):\n' + qs;
  }).join('\n') : '';
  const buildExam = r => ({
    id: Date.now(),
    studentId: Number(sid) || null,
    teacherId: currentUser.id,
    subject: subject || 'Exam',
    date: TODAY(),
    totalScore: r.totalMarksAwarded,
    maxScore: r.totalMarksAvailable,
    pct: r.percentage,
    handwriting: r.handwritingScore,
    presentation: r.presentationScore,
    demonstration: r.demonstrationScore,
    grade: gradeOf(r.percentage).g,
    overallFeedback: r.overallFeedback,
    questions: r.questions || []
  });
  const run = async () => {
    if (!apiKey.trim()) {
      setErrMsg('Gemini API key missing. Add VITE_GEMINI_API_KEY to your .env file and restart the dev server.');
      return;
    }
    if (!script) {
      setErrMsg('Please upload the student answer script first.');
      return;
    }
    if (!selectedSubjectId) {
      setErrMsg('Please select a subject.');
      return;
    }
    setErrMsg('');
    setSucMsg('');
    setLoading(true);
    setProg(10);
    setResult(null);
    setSaved(false);
    setEditing(false);
    try {
      const contentParts = [];
      const hasScheme = parts.length > 0 && totalMarks > 0;
      const prompt = `You are a strict but fair examiner. Carefully read and evaluate the student's answer script.

SUBJECT: ${subject || 'General'}
${selectedExam ? `EXAM: ${selectedExam.name}` : ''}
TOTAL MARKS AVAILABLE: ${hasScheme ? totalMarks : 100}
GRADING STYLE: ${gstyle}
${!keyFile ? 'NOTE: No answer key provided — evaluate using your subject knowledge.' : ''}
${hasScheme ? `
PART-WISE MARK ALLOCATION — follow this exactly:
${schemeText}
` : 'NOTE: No mark allocation provided — determine questions and marks from the script.'}

INSTRUCTIONS:
1. Match each student answer to its corresponding part/question${hasScheme ? ' above' : ''}.
2. Award marks strictly within each question's allocated marks.
3. Total awarded marks must NOT exceed ${hasScheme ? totalMarks : 100}.
4. Also score (0-100): handwriting quality, presentation quality, demonstration of understanding.

Return ONLY valid JSON — no markdown, no backticks, no extra text:
{"totalMarksAwarded":<n>,"totalMarksAvailable":${hasScheme ? totalMarks : 100},"percentage":<n>,"handwritingScore":<n>,"presentationScore":<n>,"demonstrationScore":<n>,"overallFeedback":"<2-3 sentences>","questions":[{"questionText":"<part+question>","marksAwarded":<n>,"maxMarks":<n>,"feedback":"<text>","strengths":"<text>","weaknesses":"<text>","suggestions":"<text>"}]}`;
      if (keyFile) {
        setProg(20);
        const d = await toB64(keyFile);
        contentParts.push({
          text: 'ANSWER KEY / MARKING SCHEME:'
        });
        contentParts.push({
          inline_data: {
            mime_type: keyFile.type,
            data: d
          }
        });
      }
      setProg(45);
      const sd = await toB64(script);
      contentParts.push({
        text: 'STUDENT ANSWER SCRIPT:'
      });
      contentParts.push({
        inline_data: {
          mime_type: script.type,
          data: sd
        }
      });
      contentParts.push({
        text: prompt
      });
      setProg(70);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: contentParts
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json'
          }
        })
      });
      setProg(90);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || 'Gemini API error');
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(txt.replace(/```json|```/g, '').trim());
      setResult(parsed);
      setEditR(JSON.parse(JSON.stringify(parsed)));
      setProg(100);
      setTimeout(() => ref.current?.scrollIntoView({
        behavior: 'smooth'
      }), 200);
    } catch (e) {
      setErrMsg('AI evaluation failed. Check your files are clear and readable. ' + e.message);
    } finally {
      setLoading(false);
    }
  };
  const doUpload = r => {
    if (!sid) {
      setErrMsg('⚠ Please select a student from the dropdown before uploading.');
      setSucMsg('');
      return;
    }
    onSave(buildExam(r));
    setSaved(true);
    setEditing(false);
    setSucMsg('✅ Result uploaded successfully to the student\'s dashboard!');
    setErrMsg('');
  };
  const recalc = qs => {
    const tot = qs.reduce((s, q) => s + Number(q.marksAwarded || 0), 0);
    const mx = qs.reduce((s, q) => s + Number(q.maxMarks || 0), 0) || editR.totalMarksAvailable;
    return {
      ...editR,
      questions: qs,
      totalMarksAwarded: tot,
      totalMarksAvailable: mx,
      percentage: Math.round(tot / mx * 100)
    };
  };
  return e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "Exam Script Analyser"), e("p", null, "Select subject & exam \u2192 upload files \u2192 AI grades \u2192 review \u2192 upload to student")), e("div", {
    className: "g2"
  }, e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "\u2460 Exam Info")), e("div", {
    className: "card-b"
  }, e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Student"), e("select", {
    value: sid,
    onChange: e => {
      setSid(e.target.value);
      setErrMsg('');
      setSucMsg('');
    }
  }, e("option", {
    value: ""
  }, "\u2014 Select student \u2014"), myStudents.map(s => e("option", {
    key: s.id,
    value: s.id
  }, s.name))), myStudents.length === 0 && e("div", {
    style: {
      fontSize: 11,
      color: 'var(--t3)',
      marginTop: 5
    }
  }, "No students assigned to you yet.")), e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Subject"), e("select", {
    value: selectedSubjectId,
    onChange: e => {
      setSelectedSubjectId(e.target.value);
      setSelectedExamId('');
    }
  }, e("option", {
    value: ""
  }, "\u2014 Select subject \u2014"), subjects.filter(s => String(s.createdBy) === String(currentUser.id)).map(s => e("option", {
    key: s.id,
    value: s.id
  }, s.name)))), e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Exam (optional \u2014 includes mark allocation)"), e("select", {
    value: selectedExamId,
    onChange: e => setSelectedExamId(e.target.value),
    disabled: !selectedSubjectId
  }, e("option", {
    value: ""
  }, "\u2014 No specific exam \u2014"), filteredExams.map(e => e("option", {
    key: e.id,
    value: e.id
  }, e.name)))), e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Grading Style"), e("select", {
    value: gstyle,
    onChange: e => setGstyle(e.target.value)
  }, e("option", {
    value: "strict"
  }, "Strict \u2014 exact answers only"), e("option", {
    value: "balanced"
  }, "Balanced \u2014 standard marking"), e("option", {
    value: "lenient"
  }, "Lenient \u2014 reward partial answers"))))), e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "\u2461 Upload Files")), e("div", {
    className: "card-b"
  }, e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Answer Key / Marking Scheme (optional)"), e(DropZone, {
    file: keyFile,
    onChange: setKeyFile,
    onRemove: () => setKeyFile(null)
  })), e("div", {
    className: "field mt12"
  }, e("label", {
    className: "fl"
  }, "Student Answer Script \u2731 Required"), e(DropZone, {
    file: script,
    onChange: setScript,
    onRemove: () => setScript(null)
  }))))), selectedExam && parts.length > 0 && e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "\u2462 Mark Allocation (from ", selectedExam.name, ")"), e("span", {
    className: "total-chip"
  }, "\uD83D\uDCCA Total: ", totalMarks, " marks")), e("div", {
    className: "card-b"
  }, parts.map((part, pi) => e("div", {
    key: pi,
    style: {
      marginBottom: 12
    }
  }, e("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--t1)',
      marginBottom: 6
    }
  }, part.name, " ", e("span", {
    className: "part-marks-chip"
  }, part.questions.reduce((s, q) => s + Number(q.marks || 0), 0), " marks")), part.questions.map((q, qi) => e("div", {
    key: qi,
    style: {
      display: 'flex',
      gap: 12,
      fontSize: 13,
      color: 'var(--t2)',
      padding: '4px 0 4px 16px'
    }
  }, e("span", {
    style: {
      color: 'var(--t3)'
    }
  }, "Q", qi + 1), e("span", {
    style: {
      flex: 1
    }
  }, q.text || '—'), e("span", {
    style: {
      fontFamily: 'var(--font-m)',
      fontWeight: 700,
      color: 'var(--blue)'
    }
  }, q.marks, " marks"))))))), errMsg && !result && e("div", {
    className: "error-banner mt12"
  }, errMsg), loading && e("div", {
    className: "prog mt12"
  }, e("div", {
    className: "prog-lbl"
  }, "AI evaluating\u2026 ", prog, "%"), e("div", {
    className: "prog-track"
  }, e("div", {
    className: "prog-fill",
    style: {
      width: `${prog}%`
    }
  }))), e("button", {
    className: "btn btn-blue btn-lg",
    style: {
      width: '100%',
      marginTop: 14,
      justifyContent: 'center'
    },
    onClick: run,
    disabled: loading || !script || !selectedSubjectId
  }, loading ? e(React.Fragment, null, e("span", {
    className: "spin"
  }), "AI Evaluating\u2026") : e(React.Fragment, null, "\u2726 Analyse & Grade Script", totalMarks > 0 ? ` (${totalMarks} marks)` : '')), result && e("div", {
    ref: ref,
    className: "mt20"
  }, errMsg && e("div", {
    className: "error-banner"
  }, errMsg), sucMsg && e("div", {
    className: "success-banner"
  }, e("span", {
    style: {
      fontSize: 24
    }
  }, "\u2705"), e("div", null, e("div", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, sucMsg), e("div", {
    style: {
      fontSize: 12,
      color: '#5dba6a',
      marginTop: 2
    }
  }, "Student can now see this result in their dashboard under \"My Results\"."))), !saved && e("div", {
    className: "upload-bar"
  }, e("div", null, e("div", {
    className: "upload-bar-title"
  }, "\u2726 AI Evaluation Complete"), e("div", {
    className: "upload-bar-sub"
  }, "Review the result below. Edit marks if needed, then upload to student.")), e("div", {
    className: "flex fac gap",
    style: {
      flexWrap: 'wrap'
    }
  }, e("button", {
    className: "btn btn-ghost",
    onClick: () => {
      setEditing(e => !e);
      setEditR(JSON.parse(JSON.stringify(result)));
    },
    style: {
      borderColor: editing ? 'var(--blue)' : '',
      color: editing ? 'var(--blue)' : ''
    }
  }, "\u270F\uFE0F ", editing ? 'Close Editor' : 'Edit Marks'), e("button", {
    className: "btn btn-blue",
    onClick: () => doUpload(editing ? editR : result)
  }, "\uD83D\uDCE4 Upload to Student"))), editing && editR && !saved && e("div", {
    className: "edit-panel"
  }, e("div", {
    className: "edit-panel-h"
  }, e("span", {
    className: "edit-panel-ht"
  }, "\u270F\uFE0F Adjust Marks \u2014 changes update the total automatically"), e("button", {
    className: "btn btn-blue btn-sm",
    onClick: () => doUpload(editR)
  }, "\uD83D\uDCE4 Upload Edited Result")), e("div", {
    style: {
      padding: '14px 18px'
    }
  }, e("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px 80px',
      gap: 8,
      marginBottom: 8
    }
  }, e("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      fontWeight: 700
    }
  }, "Question"), e("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      fontWeight: 700
    }
  }, "Awarded"), e("div", {
    style: {
      fontSize: 10,
      color: 'var(--t3)',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      fontWeight: 700
    }
  }, "Max")), editR.questions.map((q, i) => e("div", {
    key: i,
    className: "edit-q-row"
  }, e("div", {
    className: "edit-q-name"
  }, q.questionText || `Q${i + 1}`), e("input", {
    type: "number",
    min: "0",
    max: q.maxMarks,
    value: q.marksAwarded,
    onChange: e => {
      const qs = editR.questions.map((qq, ii) => ii === i ? {
        ...qq,
        marksAwarded: Number(e.target.value)
      } : qq);
      setEditR(recalc(qs));
    },
    style: {
      padding: '7px 10px',
      fontSize: 13,
      borderColor: 'var(--blue)'
    }
  }), e("input", {
    type: "number",
    min: "1",
    value: q.maxMarks,
    onChange: e => {
      const qs = editR.questions.map((qq, ii) => ii === i ? {
        ...qq,
        maxMarks: Number(e.target.value)
      } : qq);
      setEditR(recalc(qs));
    },
    style: {
      padding: '7px 10px',
      fontSize: 13
    }
  }))), e("div", {
    className: "edit-total"
  }, e("span", {
    style: {
      fontSize: 14
    }
  }, e("b", {
    style: {
      color: 'var(--blue)'
    }
  }, editR.totalMarksAwarded), " ", e("span", {
    style: {
      color: 'var(--t3)'
    }
  }, "/ ", editR.totalMarksAvailable, " marks")), e("span", {
    style: {
      fontSize: 14
    }
  }, e("b", {
    style: {
      color: 'var(--gold)'
    }
  }, editR.percentage, "%"), " ", e("span", {
    style: {
      color: 'var(--t3)'
    }
  }, "\xB7 Grade ", gradeOf(editR.percentage).g))))), e(ExamView, {
    exam: {
      totalScore: result.totalMarksAwarded,
      maxScore: result.totalMarksAvailable,
      pct: result.percentage,
      handwriting: result.handwritingScore,
      presentation: result.presentationScore,
      demonstration: result.demonstrationScore,
      overallFeedback: result.overallFeedback,
      questions: result.questions || []
    }
  })));
}

/* ══════════════════════════════════════════════════════════════
   MESSAGING
══════════════════════════════════════════════════════════════ */
function Messaging({
  currentUser,
  users,
  messages,
  onSend
}) {
  const [active, setActive] = useState(null);
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const contacts = users.filter(u => {
    if (u.id === currentUser.id) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'teacher') return u.role === 'admin' || u.role === 'student' && u.teacherId === currentUser.id;
    if (currentUser.role === 'student') return u.role === 'teacher' && u.id === currentUser.teacherId;
    return false;
  });
  const thread = active ? messages.filter(m => m.from === currentUser.id && m.to === active || m.from === active && m.to === currentUser.id) : [];
  const lastMsg = id => {
    const ms = messages.filter(m => m.from === currentUser.id && m.to === id || m.from === id && m.to === currentUser.id);
    return ms[ms.length - 1];
  };
  const unread = id => messages.filter(m => m.from === id && m.to === currentUser.id && !m.read).length;
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [thread.length, active]);
  const send = () => {
    if (!text.trim() || !active) return;
    onSend({
      id: Date.now(),
      from: currentUser.id,
      to: active,
      text: text.trim(),
      time: NOW(),
      read: false
    });
    setText('');
  };
  return e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "Messages"), e("p", null, "Communicate with your contacts")), e("div", {
    className: "msg-wrap"
  }, e("div", {
    className: "msg-list"
  }, e("div", {
    className: "msg-list-hd"
  }, "Contacts (", contacts.length, ")"), contacts.length === 0 && e("div", {
    className: "empty"
  }, "No contacts available"), contacts.map(c => {
    const lm = lastMsg(c.id),
      u = unread(c.id);
    return e("div", {
      key: c.id,
      className: `msg-contact${active === c.id ? ' active' : ''}`,
      onClick: () => setActive(c.id)
    }, e("div", {
      className: "flex fjb fac gap"
    }, e("div", {
      style: {
        minWidth: 0
      }
    }, e("div", {
      className: "msg-cname"
    }, c.name, " ", e("span", {
      className: `badge bg-${c.role}`
    }, c.role)), e("div", {
      className: "msg-cprev"
    }, lm ? lm.text : 'Say hello!')), u > 0 && e("div", {
      className: "msg-udot"
    })));
  })), e("div", {
    className: "msg-main"
  }, !active ? e("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--t3)',
      fontSize: 13
    }
  }, "Select a contact to start chatting") : e(React.Fragment, null, e("div", {
    className: "msg-mhd"
  }, (() => {
    const c = users.find(u => u.id === active);
    return c ? e(React.Fragment, null, e("b", null, c.name), " ", e("span", {
      className: `badge bg-${c.role}`
    }, c.role)) : null;
  })()), e("div", {
    className: "msg-body"
  }, thread.length === 0 && e("div", {
    style: {
      textAlign: 'center',
      color: 'var(--t3)',
      fontSize: 13,
      marginTop: 20
    }
  }, "No messages yet."), thread.map(m => e("div", {
    key: m.id,
    className: `bubble ${m.from === currentUser.id ? 'bm' : 'bt'}`
  }, m.text, e("div", {
    className: "bubble-time"
  }, m.time))), e("div", {
    ref: endRef
  })), e("div", {
    className: "msg-compose"
  }, e("textarea", {
    className: "msg-input",
    rows: 2,
    placeholder: "Type a message\u2026 (Enter to send)",
    value: text,
    onChange: e => setText(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    }
  }), e("button", {
    className: "btn btn-blue",
    onClick: send,
    disabled: !text.trim()
  }, "Send"))))));
}

/* ══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════════════ */
function AdminDash({
  currentUser,
  appState,
  dispatch
}) {
  const {
    users,
    messages,
    exams
  } = appState;
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: 'pass123',
    subject: '',
    teacherId: ''
  });
  const [formErr, setFormErr] = useState('');
  const [bcast, setBcast] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  const unread = messages.filter(m => m.to === currentUser.id && !m.read).length;
  const addUser = async role => {
    if (!form.name.trim() || !form.username.trim()) {
      setFormErr('Name and username are required.');
      return;
    }
    if (users.find(u => u.username === form.username)) {
      setFormErr('Username already taken.');
      return;
    }
    const nu = {
      id: Date.now(),
      role,
      name: form.name,
      username: form.username,
      password: form.password || 'pass123',
      avatar: ini(form.name)
    };
    if (role === 'teacher' && form.subject) nu.subject = form.subject;
    if (role === 'student' && form.teacherId) nu.teacherId = Number(form.teacherId);
    try {
      await fbAddUser(nu);
    } catch (e) {
      setFormErr('Error adding user: ' + e.message);
      return;
    }
    setModal(null);
    setForm({
      name: '',
      username: '',
      password: 'pass123',
      subject: '',
      teacherId: ''
    });
    setFormErr('');
  };
  const editUser = async () => {
    if (!form.name.trim() || !form.username.trim()) {
      setFormErr('Name and username are required.');
      return;
    }
    if (users.find(u => u.username === form.username && u.id !== form.id)) {
      setFormErr('Username already taken by someone else.');
      return;
    }
    const updObj = {
      ...users.find(u => u.id === form.id),
      name: form.name,
      username: form.username,
      password: form.password
    };
    if (updObj.role === 'teacher') updObj.subject = form.subject || '';
    if (updObj.role === 'student') updObj.teacherId = Number(form.teacherId) || null;
    try {
      await fbUpdateUser(updObj, currentUser);
    } catch (e) {
      setFormErr('Error updating user: ' + e.message);
      return;
    }
    setModal(null);
    setForm({
      name: '',
      username: '',
      password: 'pass123',
      subject: '',
      teacherId: ''
    });
    setFormErr('');
  };
  const broadcast = async () => {
    if (!bcast.trim()) return;
    for (const u of users.filter(u => u.id !== currentUser.id)) {
      await fbAddMessage({
        id: Date.now() + u.id,
        from: currentUser.id,
        to: u.id,
        text: bcast,
        time: NOW(),
        read: false
      });
    }
    setBcast('');
  };
  const nav = [['overview', '🏠', 'Overview'], ['users', '👥', 'Users'], ['exams', '📝', 'All Exams'], ['messages', '💬', 'Messages']];
  return e("div", {
    className: "shell"
  }, e("div", {
    className: "sidebar"
  }, e("div", {
    className: "sb-brand"
  }, e("div", {
    className: "sb-brand-name"
  }, "Gradify"), e("div", {
    className: "sb-brand-role role-c-admin"
  }, "Admin Panel")), e("div", {
    className: "sb-user"
  }, e("div", {
    className: "av av-admin"
  }, ini(currentUser.name)), e("div", null, e("div", {
    className: "sb-uname"
  }, currentUser.name), e("div", {
    className: "sb-usub"
  }, "Administrator"))), e("div", {
    className: "sb-nav"
  }, nav.map(([k, ic, l]) => e("div", {
    key: k,
    className: `nav-item na${tab === k ? ' on' : ''}`,
    onClick: () => setTab(k)
  }, e("span", {
    className: "nav-ic"
  }, ic), l, k === 'messages' && unread > 0 && e("span", {
    className: "nav-badge",
    style: {
      background: 'var(--gold)',
      color: '#0a0c10'
    }
  }, unread)))), e("div", {
    className: "sb-foot"
  }, e("button", {
    className: "logout",
    onClick: () => {
      signOutUser();
      dispatch({
        type: 'LOGOUT'
      });
    }
  }, "\uD83D\uDEAA Sign Out"))), e("div", {
    className: "content"
  }, e("div", {
    className: "pad"
  }, tab === 'overview' && e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "Admin Overview"), e("p", null, "Full system at a glance")), e("div", {
    className: "stats"
  }, e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83D\uDC65"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--blue)'
    }
  }, teachers.length), e("div", {
    className: "stat-l"
  }, "Teachers")), e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83C\uDF93"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--green)'
    }
  }, students.length), e("div", {
    className: "stat-l"
  }, "Students")), e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83D\uDCDD"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--purple)'
    }
  }, exams.length), e("div", {
    className: "stat-l"
  }, "Exams Graded")), e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83D\uDCAC"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--gold)'
    }
  }, messages.length), e("div", {
    className: "stat-l"
  }, "Messages"))), e("div", {
    className: "g2"
  }, e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "\uD83D\uDCE2 Broadcast to All")), e("div", {
    className: "card-b"
  }, e("textarea", {
    style: {
      width: '100%',
      background: 'var(--bg)',
      border: '1px solid var(--bdr)',
      borderRadius: 8,
      color: 'var(--t1)',
      fontFamily: 'Inter,sans-serif',
      fontSize: 13,
      padding: '10px 12px',
      outline: 'none',
      resize: 'vertical'
    },
    rows: 3,
    placeholder: "Message everyone\u2026",
    value: bcast,
    onChange: e => setBcast(e.target.value)
  }), e("button", {
    className: "btn btn-gold mt8",
    onClick: broadcast,
    disabled: !bcast.trim()
  }, "\uD83D\uDCE2 Broadcast"))), e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "Recent Results")), e("div", {
    className: "card-b"
  }, exams.length === 0 ? e("div", {
    className: "empty"
  }, "No exams yet") : exams.slice(-3).reverse().map(e => {
    const st = users.find(u => u.id === e.studentId);
    return e("div", {
      key: e.id,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '9px 0',
        borderBottom: '1px solid var(--bdr)'
      }
    }, e("div", null, e("div", {
      style: {
        fontSize: 13,
        fontWeight: 500
      }
    }, st?.name || 'Unknown'), e("div", {
      style: {
        fontSize: 11,
        color: 'var(--t3)'
      }
    }, e.subject, "\xB7", e.date)), e("span", {
      className: `badge ${e.pct >= 60 ? 'bg-green' : 'bg-gold'}`
    }, e.pct, "% ", e.grade));
  }))))), tab === 'users' && e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "User Management"), e("p", null, "Add and manage all users")), e("div", {
    className: "flex gap",
    style: {
      marginBottom: 16
    }
  }, e("button", {
    className: "btn btn-blue",
    onClick: () => {
      setModal('teacher');
      setForm({
        name: '',
        username: '',
        password: 'pass123',
        subject: '',
        teacherId: ''
      });
    }
  }, "\uFF0B Add Teacher"), e("button", {
    className: "btn btn-green",
    onClick: () => {
      setModal('student');
      setForm({
        name: '',
        username: '',
        password: 'pass123',
        subject: '',
        teacherId: ''
      });
    }
  }, "\uFF0B Add Student")), e("div", {
    className: "card"
  }, users.filter(u => u.role !== 'admin').length === 0 ? e("div", {
    className: "empty"
  }, "No users yet") : e("table", {
    className: "tbl"
  }, e("thead", null, e("tr", null, e("th", null, "Name"), e("th", null, "Username"), e("th", null, "Role"), e("th", null, "Details"), e("th", null))), e("tbody", null, users.filter(u => u.role !== 'admin').map(u => e("tr", {
    key: u.id
  }, e("td", null, e("b", null, u.name)), e("td", {
    style: {
      color: 'var(--t3)'
    }
  }, "@", u.username), e("td", null, e("span", {
    className: `badge bg-${u.role}`
  }, u.role)), e("td", {
    style: {
      fontSize: 11,
      color: 'var(--t3)'
    }
  }, u.role === 'teacher' ? u.subject || '—' : u.role === 'student' ? `Teacher: ${users.find(t => t.id === u.teacherId)?.name || 'None'}` : '—'), e("td", null, confirmId === u.id ? e("span", {
    className: "flex fac gap"
  }, e("span", {
    style: {
      fontSize: 12,
      color: 'var(--red)'
    }
  }, "Sure?"), e("button", {
    className: "btn btn-danger btn-sm",
    onClick: () => {
      fbRemoveUser(u.id);
      setConfirmId(null);
    }
  }, "Yes"), e("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => setConfirmId(null)
  }, "No")) : e("span", {
    className: "flex fac gap"
  }, e("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setForm({
        id: u.id,
        role: u.role,
        name: u.name || '',
        username: u.username || '',
        password: u.password || '',
        subject: u.subject || '',
        teacherId: u.teacherId || ''
      });
      setModal('edit');
    }
  }, "\u270F\uFE0F Edit"), e("button", {
    className: "btn btn-danger btn-sm",
    onClick: () => setConfirmId(u.id)
  }, "Remove"))))))))), tab === 'exams' && e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "All Exam Results"), e("p", null, "Every graded script")), exams.length === 0 ? e("div", {
    className: "card"
  }, e("div", {
    className: "empty"
  }, "No exams graded yet")) : exams.map(e => {
    const st = users.find(u => u.id === e.studentId),
      tc = users.find(u => u.id === e.teacherId);
    return e("div", {
      key: e.id,
      className: "card"
    }, e("div", {
      className: "card-h",
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, e("div", null, e("span", {
      className: "card-ht"
    }, e.subject, " \u2014 ", st?.name || 'Unknown'), e("span", {
      className: `badge ${e.pct >= 60 ? 'bg-green' : 'bg-gold'}`,
      style: {
        marginLeft: 12
      }
    }, "Grade ", e.grade, " \xB7 ", e.pct, "%")), confirmId === `exam-${e.id}` ? e("span", {
      className: "flex fac gap"
    }, e("span", {
      style: {
        fontSize: 12,
        color: 'var(--red)'
      }
    }, "Sure?"), e("button", {
      className: "btn btn-danger btn-sm",
      onClick: () => {
        fbRemoveExam(e.id);
        setConfirmId(null);
      }
    }, "Yes"), e("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setConfirmId(null)
    }, "No")) : e("button", {
      className: "btn btn-danger btn-sm",
      style: {
        padding: '4px 8px',
        fontSize: 11
      },
      onClick: () => setConfirmId(`exam-${e.id}`)
    }, "\uD83D\uDDD1\uFE0F Delete")), e("div", {
      className: "card-b"
    }, e("div", {
      style: {
        fontSize: 11,
        color: 'var(--t3)',
        marginBottom: 12
      }
    }, "Teacher: ", tc?.name, " \xB7 ", e.date), e(ExamView, {
      exam: e
    })));
  })), tab === 'messages' && e(Messaging, {
    currentUser: currentUser,
    users: users,
    messages: messages,
    onSend: m => fbAddMessage(m)
  }))), modal && e("div", {
    className: "modal-bg",
    onClick: () => setModal(null)
  }, e("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, e("div", {
    className: "modal-h"
  }, e("span", {
    className: "modal-ht"
  }, modal === 'edit' ? 'Edit User' : `Add ${modal === 'teacher' ? 'Teacher' : 'Student'}`), e("button", {
    className: "modal-x",
    onClick: () => setModal(null)
  }, "\u2715")), e("div", {
    className: "modal-b"
  }, e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Full Name"), e("input", {
    type: "text",
    placeholder: "e.g. Mrs. Meena",
    value: form.name,
    onChange: e => setForm(f => ({
      ...f,
      name: e.target.value
    }))
  })), e("div", {
    className: "g2"
  }, e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Username"), e("input", {
    type: "text",
    placeholder: "unique_username",
    value: form.username,
    onChange: e => setForm(f => ({
      ...f,
      username: e.target.value
    }))
  })), e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Password"), e("input", {
    type: "password",
    value: form.password,
    onChange: e => setForm(f => ({
      ...f,
      password: e.target.value
    }))
  }))), (modal === 'teacher' || form.role === 'teacher') && e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Subject"), e("input", {
    type: "text",
    placeholder: "e.g. Chemistry",
    value: form.subject || '',
    onChange: e => setForm(f => ({
      ...f,
      subject: e.target.value
    }))
  })), (modal === 'student' || form.role === 'student') && e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Assign Teacher"), e("select", {
    value: form.teacherId || '',
    onChange: e => setForm(f => ({
      ...f,
      teacherId: e.target.value
    }))
  }, e("option", {
    value: ""
  }, "Select teacher"), teachers.map(t => e("option", {
    key: t.id,
    value: t.id
  }, t.name)))), formErr && e("div", {
    className: "error-banner mt8",
    style: {
      borderRadius: 8,
      padding: '10px 14px'
    }
  }, formErr)), e("div", {
    className: "modal-f"
  }, e("button", {
    className: "btn btn-ghost",
    onClick: () => setModal(null)
  }, "Cancel"), modal === 'edit' ? e("button", {
    className: "btn btn-blue",
    onClick: editUser
  }, "Save Changes") : e("button", {
    className: `btn btn-${modal === 'teacher' ? 'blue' : 'green'}`,
    onClick: () => addUser(modal)
  }, "Add ", modal === 'teacher' ? 'Teacher' : 'Student')))));
}

/* ══════════════════════════════════════════════════════════════
   TEACHER DASHBOARD
══════════════════════════════════════════════════════════════ */
function TeacherDash({
  currentUser,
  appState,
  dispatch
}) {
  const {
    users,
    messages,
    exams,
    subjects,
    subjectExams
  } = appState;
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: 'pass123'
  });
  const [formErr, setFormErr] = useState('');
  const myStudents = users.filter(u => u.role === 'student' && u.teacherId === currentUser.id);
  const myExams = exams.filter(e => e.teacherId === currentUser.id);
  const unread = messages.filter(m => m.to === currentUser.id && !m.read).length;
  const avgPct = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + e.pct, 0) / myExams.length) : 0;

  // Subjects & Exams state
  const mySubjects = subjects.filter(s => String(s.createdBy) === String(currentUser.id));
  const [subjectName, setSubjectName] = useState('');
  const [addingExamForSubject, setAddingExamForSubject] = useState(null);
  const [examName, setExamName] = useState('');
  const [examParts, setExamParts] = useState([{
    id: Date.now(),
    name: 'Part A',
    questions: [{
      id: Date.now() + 1,
      text: '',
      marks: ''
    }]
  }]);
  const [confirmDelId, setConfirmDelId] = useState(null);

  // Graded results editing state
  const [editingExamId, setEditingExamId] = useState(null);
  const [editExamData, setEditExamData] = useState(null);
  const [resultMsg, setResultMsg] = useState('');
  const addStudent = async () => {
    if (!form.name.trim() || !form.username.trim()) {
      setFormErr('Name and username required.');
      return;
    }
    if (users.find(u => u.username === form.username)) {
      setFormErr('Username taken.');
      return;
    }
    try {
      await fbAddUser({
        id: Date.now(),
        role: 'student',
        name: form.name,
        username: form.username,
        password: form.password || 'pass123',
        avatar: ini(form.name),
        teacherId: currentUser.id
      });
    } catch (e) {
      setFormErr('Error: ' + e.message);
      return;
    }
    setModal(false);
    setForm({
      name: '',
      username: '',
      password: 'pass123'
    });
    setFormErr('');
  };
  const handleAddSubject = async () => {
    if (!subjectName.trim()) return;
    await fbAddSubject({
      id: Date.now(),
      name: subjectName.trim(),
      createdBy: currentUser.id
    });
    setSubjectName('');
  };
  const handleAddExam = async subjectId => {
    if (!examName.trim()) return;
    await fbAddSubjectExam({
      id: Date.now(),
      subjectId,
      name: examName.trim(),
      parts: examParts,
      createdBy: currentUser.id
    });
    setExamName('');
    setExamParts([{
      id: Date.now(),
      name: 'Part A',
      questions: [{
        id: Date.now() + 1,
        text: '',
        marks: ''
      }]
    }]);
    setAddingExamForSubject(null);
  };
  const startEditExam = exam => {
    setEditingExamId(exam.id);
    setEditExamData(JSON.parse(JSON.stringify(exam)));
    setResultMsg('');
  };
  const cancelEditExam = () => {
    setEditingExamId(null);
    setEditExamData(null);
    setResultMsg('');
  };
  const saveEditExam = async () => {
    if (!editExamData) return;
    const updated = {
      ...editExamData,
      grade: gradeOf(editExamData.pct).g
    };
    try {
      await fbUpdateExam(updated);
      setResultMsg('✅ Result updated and re-uploaded to student!');
      setEditingExamId(null);
      setEditExamData(null);
    } catch (e) {
      setResultMsg('❌ Error: ' + e.message);
    }
  };
  const updateEditQ = (qi, field, val) => {
    setEditExamData(prev => {
      const qs = prev.questions.map((q, i) => i === qi ? {
        ...q,
        [field]: field === 'marksAwarded' || field === 'maxMarks' ? Number(val) : val
      } : q);
      const tot = qs.reduce((s, q) => s + Number(q.marksAwarded || 0), 0);
      const mx = qs.reduce((s, q) => s + Number(q.maxMarks || 0), 0) || prev.maxScore;
      return {
        ...prev,
        questions: qs,
        totalScore: tot,
        maxScore: mx,
        pct: Math.round(tot / mx * 100)
      };
    });
  };
  const nav = [['overview', '🏠', 'Overview'], ['subjects', '📚', 'Subjects & Exams'], ['students', '👥', 'My Students'], ['analyser', '🔬', 'Exam Analyser'], ['results', '📊', 'Graded Results'], ['messages', '💬', 'Messages']];
  return e("div", {
    className: "shell"
  }, e("div", {
    className: "sidebar"
  }, e("div", {
    className: "sb-brand"
  }, e("img", {
    src: "/logo.png",
    alt: "Gradify",
    style: {
      height: 32,
      objectFit: 'contain',
      marginBottom: 4
    },
    onError: e => e.target.style.display = 'none'
  }), e("div", {
    className: "sb-brand-name"
  }, "Gradify"), e("div", {
    className: "sb-brand-role role-c-teacher"
  }, "Teacher Portal")), e("div", {
    className: "sb-user"
  }, e("div", {
    className: "av av-teacher"
  }, ini(currentUser.name)), e("div", null, e("div", {
    className: "sb-uname"
  }, currentUser.name), e("div", {
    className: "sb-usub"
  }, currentUser.subject || 'Teacher'))), e("div", {
    className: "sb-nav"
  }, nav.map(([k, ic, l]) => e("div", {
    key: k,
    className: `nav-item nt${tab === k ? ' on' : ''}`,
    onClick: () => setTab(k)
  }, e("span", {
    className: "nav-ic"
  }, ic), l, k === 'messages' && unread > 0 && e("span", {
    className: "nav-badge",
    style: {
      background: 'var(--blue)',
      color: '#fff'
    }
  }, unread)))), e("div", {
    className: "sb-foot"
  }, e("button", {
    className: "logout",
    onClick: () => {
      signOutUser();
      dispatch({
        type: 'LOGOUT'
      });
    }
  }, "\uD83D\uDEAA Sign Out"))), e("div", {
    className: "content"
  }, e("div", {
    className: "pad"
  }, tab === 'overview' && e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "Welcome back, ", currentUser.name, "!"), e("p", null, "Ready to inspire today? Manage your exams, grading, and analyze performance.")), e("div", {
    className: "stats"
  }, e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83D\uDC65"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--green)'
    }
  }, e(AnimatedNumber, {
    value: myStudents.length
  })), e("div", {
    className: "stat-l"
  }, "My Students")), e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83D\uDCDD"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--purple)'
    }
  }, e(AnimatedNumber, {
    value: myExams.length
  })), e("div", {
    className: "stat-l"
  }, "Exams Graded")), e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83D\uDCC8"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--gold)'
    }
  }, e(AnimatedNumber, {
    value: avgPct
  }), "%"), e("div", {
    className: "stat-l"
  }, "Class Avg")), e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83D\uDCAC"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--blue)'
    }
  }, e(AnimatedNumber, {
    value: unread
  })), e("div", {
    className: "stat-l"
  }, "Unread"))), e("div", {
    className: "g2"
  }, e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "Recent Results")), e("div", {
    className: "card-b"
  }, myExams.length === 0 ? e("div", {
    className: "empty"
  }, "No exams graded yet") : myExams.slice(-4).reverse().map((e, idx) => {
    const st = users.find(u => u.id === e.studentId);
    return e("div", {
      key: e.id,
      className: "recent-exam-row",
      style: {
        animationDelay: `${0.15 * (idx + 1)}s`,
        padding: '12px 0',
        borderBottom: '1px solid var(--bdr)'
      }
    }, e("div", null, e("div", {
      style: {
        fontSize: 13,
        fontWeight: 500
      }
    }, st?.name || '—'), e("div", {
      style: {
        fontSize: 11,
        color: 'var(--t3)'
      }
    }, e.subject)), e("span", {
      className: `badge ${e.pct >= 60 ? 'bg-green' : 'bg-gold'}`
    }, "Grade ", e.grade));
  }))), e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "My Students")), e("div", {
    className: "card-b"
  }, myStudents.length === 0 ? e("div", {
    className: "empty"
  }, "No students yet") : myStudents.map((s, idx) => {
    const last = myExams.filter(e => e.studentId === s.id).slice(-1)[0];
    return e("div", {
      key: s.id,
      className: "recent-exam-row",
      style: {
        animationDelay: `${0.15 * (idx + 1)}s`,
        padding: '12px 0',
        borderBottom: '1px solid var(--bdr)'
      }
    }, e("div", {
      className: "flex fac gap"
    }, e("div", {
      className: "av av-student",
      style: {
        width: 28,
        height: 28,
        fontSize: 11
      }
    }, ini(s.name)), e("span", {
      style: {
        fontSize: 13,
        fontWeight: 500
      }
    }, s.name)), last ? e("span", {
      className: "badge bg-green"
    }, last.pct, "%") : e("span", {
      style: {
        fontSize: 11,
        color: 'var(--t3)'
      }
    }, "No exam"));
  }))))), tab === 'subjects' && e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "Subjects & Exams"), e("p", null, "Create subjects and set up exams with mark allocation")), e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "\uFF0B Add Subject")), e("div", {
    className: "card-b"
  }, e("div", {
    className: "flex fac gap"
  }, e("input", {
    type: "text",
    placeholder: "e.g. Mathematics, Biology, Physics\u2026",
    value: subjectName,
    onChange: e => setSubjectName(e.target.value),
    onKeyDown: e => e.key === 'Enter' && handleAddSubject(),
    style: {
      flex: 1
    }
  }), e("button", {
    className: "btn btn-blue",
    onClick: handleAddSubject,
    disabled: !subjectName.trim()
  }, "Add Subject")))), mySubjects.length === 0 ? e("div", {
    className: "card"
  }, e("div", {
    className: "empty"
  }, "No subjects yet. Add your first subject above!")) : mySubjects.map(sub => {
    const subExams = subjectExams.filter(e => String(e.subjectId) === String(sub.id));
    return e("div", {
      key: sub.id,
      className: "card"
    }, e("div", {
      className: "card-h"
    }, e("span", {
      className: "card-ht"
    }, "\uD83D\uDCDA ", sub.name), e("div", {
      className: "flex fac gap"
    }, e("span", {
      className: "badge bg-purple"
    }, subExams.length, " exam", subExams.length !== 1 ? 's' : ''), confirmDelId === `sub-${sub.id}` ? e("span", {
      className: "flex fac gap"
    }, e("span", {
      style: {
        fontSize: 12,
        color: 'var(--red)'
      }
    }, "Delete?"), e("button", {
      className: "btn btn-danger btn-sm",
      onClick: () => {
        fbRemoveSubject(sub.id);
        subExams.forEach(e => fbRemoveSubjectExam(e.id));
        setConfirmDelId(null);
      }
    }, "Yes"), e("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setConfirmDelId(null)
    }, "No")) : e("button", {
      className: "btn btn-danger btn-sm",
      onClick: () => setConfirmDelId(`sub-${sub.id}`)
    }, "\uD83D\uDDD1\uFE0F"))), e("div", {
      className: "card-b"
    }, subExams.length === 0 && addingExamForSubject !== sub.id && e("div", {
      style: {
        fontSize: 13,
        color: 'var(--t3)',
        marginBottom: 12
      }
    }, "No exams created for this subject yet."), subExams.map(ex => {
      const exTotal = (ex.parts || []).reduce((s, p) => s + p.questions.reduce((ss, q) => ss + Number(q.marks || 0), 0), 0);
      return e("div", {
        key: ex.id,
        style: {
          background: 'var(--bg)',
          border: '1px solid var(--bdr)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 10
        }
      }, e("div", {
        className: "flex fjb fac"
      }, e("div", null, e("div", {
        style: {
          fontSize: 14,
          fontWeight: 600
        }
      }, "\uD83D\uDCDD ", ex.name), e("div", {
        style: {
          fontSize: 12,
          color: 'var(--t3)',
          marginTop: 2
        }
      }, (ex.parts || []).length, " part(s) \xB7 ", exTotal, " total marks")), confirmDelId === `exam-${ex.id}` ? e("span", {
        className: "flex fac gap"
      }, e("button", {
        className: "btn btn-danger btn-sm",
        onClick: () => {
          fbRemoveSubjectExam(ex.id);
          setConfirmDelId(null);
        }
      }, "Yes"), e("button", {
        className: "btn btn-ghost btn-sm",
        onClick: () => setConfirmDelId(null)
      }, "No")) : e("button", {
        className: "btn btn-danger btn-sm",
        style: {
          padding: '4px 8px',
          fontSize: 11
        },
        onClick: () => setConfirmDelId(`exam-${ex.id}`)
      }, "\uD83D\uDDD1\uFE0F")), (ex.parts || []).map((p, pi) => e("div", {
        key: pi,
        style: {
          fontSize: 12,
          color: 'var(--t2)',
          marginTop: 6,
          paddingLeft: 8
        }
      }, e("b", null, p.name), ": ", p.questions.map((q, qi) => `Q${qi + 1}(${q.marks || '?'}m)`).join(', '))));
    }), addingExamForSubject === sub.id ? e("div", {
      style: {
        background: 'var(--s2)',
        border: '1px solid var(--bdr)',
        borderRadius: 12,
        padding: 16,
        marginTop: 8
      }
    }, e("div", {
      className: "field"
    }, e("label", {
      className: "fl"
    }, "Exam Name"), e("input", {
      type: "text",
      placeholder: "e.g. Mid-term, Unit Test 1\u2026",
      value: examName,
      onChange: e => setExamName(e.target.value)
    })), e(MarkBuilder, {
      parts: examParts,
      setParts: setExamParts
    }), e("div", {
      className: "flex fac gap mt12"
    }, e("button", {
      className: "btn btn-blue",
      onClick: () => handleAddExam(sub.id),
      disabled: !examName.trim()
    }, "\u2726 Save Exam"), e("button", {
      className: "btn btn-ghost",
      onClick: () => {
        setAddingExamForSubject(null);
        setExamName('');
      }
    }, "Cancel"))) : e("button", {
      className: "add-part-btn",
      onClick: () => {
        setAddingExamForSubject(sub.id);
        setExamName('');
        setExamParts([{
          id: Date.now(),
          name: 'Part A',
          questions: [{
            id: Date.now() + 1,
            text: '',
            marks: ''
          }]
        }]);
      }
    }, "\uFF0B Add Exam to ", sub.name)));
  })), tab === 'students' && e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "My Students"), e("p", null, "Manage your assigned students")), e("button", {
    className: "btn btn-blue",
    style: {
      marginBottom: 16
    },
    onClick: () => {
      setModal(true);
      setForm({
        name: '',
        username: '',
        password: 'pass123'
      });
    }
  }, "\uFF0B Add Student"), e("div", {
    className: "card"
  }, myStudents.length === 0 ? e("div", {
    className: "empty"
  }, "No students. Add your first student!") : e("table", {
    className: "tbl"
  }, e("thead", null, e("tr", null, e("th", null, "Student"), e("th", null, "Username"), e("th", null, "Last Exam"), e("th", null, "Score"), e("th", null, "Grade"))), e("tbody", null, myStudents.map(s => {
    const exs = myExams.filter(e => e.studentId === s.id),
      last = exs.slice(-1)[0];
    return e("tr", {
      key: s.id
    }, e("td", null, e("b", null, s.name)), e("td", {
      style: {
        color: 'var(--t3)'
      }
    }, "@", s.username), e("td", {
      style: {
        fontSize: 12
      }
    }, last ? last.subject : '—'), e("td", null, last ? `${last.totalScore}/${last.maxScore}` : '—'), e("td", null, last ? e("span", {
      className: `badge ${last.pct >= 60 ? 'bg-green' : 'bg-gold'}`
    }, "Grade ", last.grade) : '—'));
  }))))), tab === 'analyser' && e(ExamAnalyser, {
    currentUser: currentUser,
    users: users,
    onSave: e => fbAddExam(e),
    subjects: subjects,
    subjectExams: subjectExams
  }), tab === 'results' && e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "Graded Results"), e("p", null, "View, edit, and re-upload exam results to students")), resultMsg && e("div", {
    className: resultMsg.startsWith('✅') ? 'success-banner' : 'error-banner',
    style: {
      marginBottom: 16
    }
  }, resultMsg.startsWith('✅') && e("span", {
    style: {
      fontSize: 20,
      marginRight: 8
    }
  }, "\u2705"), resultMsg), myExams.length === 0 ? e("div", {
    className: "card"
  }, e("div", {
    className: "empty"
  }, "No graded results yet. Use the Exam Analyser to grade scripts.")) : myExams.slice().reverse().map(exam => {
    const st = users.find(u => u.id === exam.studentId);
    const isEditing = editingExamId === exam.id;
    const ed = isEditing ? editExamData : exam;
    const gi = gradeOf(ed.pct);
    return e("div", {
      key: exam.id,
      className: "card"
    }, e("div", {
      className: "card-h"
    }, e("div", null, e("span", {
      className: "card-ht"
    }, exam.subject), e("span", {
      className: `badge ${exam.pct >= 60 ? 'bg-green' : 'bg-gold'}`,
      style: {
        marginLeft: 12
      }
    }, "Grade ", exam.grade, " \xB7 ", exam.pct, "%")), e("div", {
      className: "flex fac gap"
    }, e("span", {
      style: {
        fontSize: 12,
        color: 'var(--t3)'
      }
    }, st?.name || 'Unknown', " \xB7 ", exam.date), !isEditing ? e(React.Fragment, null, e("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => startEditExam(exam)
    }, "\u270F\uFE0F Edit"), confirmDelId === `res-${exam.id}` ? e("span", {
      className: "flex fac gap"
    }, e("button", {
      className: "btn btn-danger btn-sm",
      onClick: () => {
        fbRemoveExam(exam.id);
        setConfirmDelId(null);
      }
    }, "Yes"), e("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setConfirmDelId(null)
    }, "No")) : e("button", {
      className: "btn btn-danger btn-sm",
      onClick: () => setConfirmDelId(`res-${exam.id}`)
    }, "\uD83D\uDDD1\uFE0F")) : e(React.Fragment, null, e("button", {
      className: "btn btn-blue btn-sm",
      onClick: saveEditExam
    }, "\uD83D\uDCE4 Save & Re-upload"), e("button", {
      className: "btn btn-ghost btn-sm",
      onClick: cancelEditExam
    }, "Cancel")))), e("div", {
      className: "card-b"
    }, isEditing ? e("div", null, e("div", {
      className: "g2",
      style: {
        marginBottom: 16
      }
    }, e("div", {
      className: "field"
    }, e("label", {
      className: "fl"
    }, "Total Score"), e("div", {
      style: {
        fontFamily: 'var(--font-m)',
        fontSize: 28,
        fontWeight: 700
      }
    }, e("span", {
      style: {
        color: 'var(--blue)'
      }
    }, ed.totalScore), e("span", {
      style: {
        color: 'var(--t3)'
      }
    }, "/", ed.maxScore)), e("div", {
      style: {
        fontSize: 13,
        color: 'var(--gold)',
        fontWeight: 700,
        marginTop: 4
      }
    }, ed.pct, "% \xB7 Grade ", gi.g)), e("div", {
      className: "field"
    }, e("label", {
      className: "fl"
    }, "Overall Feedback"), e("textarea", {
      style: {
        width: '100%',
        background: 'var(--bg)',
        border: '1px solid var(--bdr)',
        borderRadius: 8,
        color: 'var(--t1)',
        fontFamily: 'Inter,sans-serif',
        fontSize: 13,
        padding: '10px 12px',
        outline: 'none',
        resize: 'vertical'
      },
      rows: 3,
      value: ed.overallFeedback || '',
      onChange: e => setEditExamData(p => ({
        ...p,
        overallFeedback: e.target.value
      }))
    }))), e("div", {
      style: {
        fontSize: 10,
        color: 'var(--t3)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontWeight: 700,
        marginBottom: 8
      }
    }, "Question-wise Marks"), (ed.questions || []).map((q, i) => e("div", {
      key: i,
      className: "edit-q-row"
    }, e("div", {
      className: "edit-q-name"
    }, q.questionText || `Q${i + 1}`), e("input", {
      type: "number",
      min: "0",
      max: q.maxMarks,
      value: q.marksAwarded,
      onChange: e => updateEditQ(i, 'marksAwarded', e.target.value),
      style: {
        padding: '7px 10px',
        fontSize: 13,
        borderColor: 'var(--blue)'
      }
    }), e("input", {
      type: "number",
      min: "1",
      value: q.maxMarks,
      onChange: e => updateEditQ(i, 'maxMarks', e.target.value),
      style: {
        padding: '7px 10px',
        fontSize: 13
      }
    })))) : e(ExamView, {
      exam: exam
    })));
  })), tab === 'messages' && e(Messaging, {
    currentUser: currentUser,
    users: users,
    messages: messages,
    onSend: m => fbAddMessage(m)
  }))), modal && e("div", {
    className: "modal-bg",
    onClick: () => setModal(false)
  }, e("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, e("div", {
    className: "modal-h"
  }, e("span", {
    className: "modal-ht"
  }, "Add Student"), e("button", {
    className: "modal-x",
    onClick: () => setModal(false)
  }, "\u2715")), e("div", {
    className: "modal-b"
  }, e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Full Name"), e("input", {
    type: "text",
    placeholder: "e.g. Sneha Rao",
    value: form.name,
    onChange: e => setForm(f => ({
      ...f,
      name: e.target.value
    }))
  })), e("div", {
    className: "g2"
  }, e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Username"), e("input", {
    type: "text",
    placeholder: "unique_username",
    value: form.username,
    onChange: e => setForm(f => ({
      ...f,
      username: e.target.value
    }))
  })), e("div", {
    className: "field"
  }, e("label", {
    className: "fl"
  }, "Password"), e("input", {
    type: "password",
    value: form.password,
    onChange: e => setForm(f => ({
      ...f,
      password: e.target.value
    }))
  }))), formErr && e("div", {
    className: "error-banner mt8",
    style: {
      borderRadius: 8,
      padding: '10px 14px'
    }
  }, formErr)), e("div", {
    className: "modal-f"
  }, e("button", {
    className: "btn btn-ghost",
    onClick: () => setModal(false)
  }, "Cancel"), e("button", {
    className: "btn btn-green",
    onClick: addStudent
  }, "Add Student")))));
}

/* ══════════════════════════════════════════════════════════════
   STUDENT DASHBOARD
══════════════════════════════════════════════════════════════ */
function StudentDash({
  currentUser,
  appState,
  dispatch
}) {
  const {
    users,
    messages,
    exams
  } = appState;
  const [tab, setTab] = useState('overview');
  const myTeacher = users.find(u => u.id === currentUser.teacherId);
  const myExams = exams.filter(e => e.studentId === currentUser.id);
  const unread = messages.filter(m => m.to === currentUser.id && !m.read).length;
  const avgPct = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + e.pct, 0) / myExams.length) : 0;
  const avgHW = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + (e.handwriting || 0), 0) / myExams.length) : 0;
  const avgPres = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + (e.presentation || 0), 0) / myExams.length) : 0;
  const avgDemo = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + (e.demonstration || 0), 0) / myExams.length) : 0;
  const nav = [['overview', '🏠', 'Dashboard'], ['results', '📊', 'My Results'], ['messages', '💬', 'Messages']];
  return e("div", {
    className: "shell"
  }, e("div", {
    className: "sidebar"
  }, e("div", {
    className: "sb-brand"
  }, e("div", {
    className: "sb-brand-name"
  }, "Gradify"), e("div", {
    className: "sb-brand-role role-c-student"
  }, "Student Portal")), e("div", {
    className: "sb-user"
  }, e("div", {
    className: "av av-student"
  }, ini(currentUser.name)), e("div", null, e("div", {
    className: "sb-uname"
  }, currentUser.name), e("div", {
    className: "sb-usub"
  }, myTeacher ? myTeacher.name : 'No teacher'))), e("div", {
    className: "sb-nav"
  }, nav.map(([k, ic, l]) => e("div", {
    key: k,
    className: `nav-item ns${tab === k ? ' on' : ''}`,
    onClick: () => setTab(k)
  }, e("span", {
    className: "nav-ic"
  }, ic), l, k === 'messages' && unread > 0 && e("span", {
    className: "nav-badge",
    style: {
      background: 'var(--green)',
      color: '#0a0c10'
    }
  }, unread)))), e("div", {
    className: "sb-foot"
  }, e("button", {
    className: "logout",
    onClick: () => {
      signOutUser();
      dispatch({
        type: 'LOGOUT'
      });
    }
  }, "\uD83D\uDEAA Sign Out"))), e("div", {
    className: "content"
  }, e("div", {
    className: "pad"
  }, tab === 'overview' && e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "Welcome back, ", currentUser.name, "!"), e("p", null, "Every challenge is an opportunity to learn. Keep pushing forward.")), e("div", {
    className: "stats"
  }, e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\u270D\uFE0F"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--purple)'
    }
  }, e(AnimatedNumber, {
    value: myExams.length
  })), e("div", {
    className: "stat-l"
  }, "Exams Taken")), e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83D\uDCC8"), e("div", {
    className: "stat-v",
    style: {
      color: avgPct >= 60 ? 'var(--green)' : 'var(--gold)'
    }
  }, e(AnimatedNumber, {
    value: avgPct
  }), "%"), e("div", {
    className: "stat-l"
  }, "Avg Score")), e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83C\uDF93"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--gold)'
    }
  }, myExams.length > 0 ? gradeOf(avgPct).g : '—'), e("div", {
    className: "stat-l"
  }, "Avg Grade")), e("div", {
    className: "stat"
  }, e("div", {
    className: "stat-i"
  }, "\uD83D\uDCAC"), e("div", {
    className: "stat-v",
    style: {
      color: 'var(--green)'
    }
  }, e(AnimatedNumber, {
    value: unread
  })), e("div", {
    className: "stat-l"
  }, "Unread"))), myExams.length > 0 && e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "\u2726 My Average Performance Scores")), e("div", {
    className: "pie-row"
  }, e(Donut, {
    value: avgHW,
    color: "#a78bfa",
    label: "Handwriting"
  }), e(Donut, {
    value: avgPres,
    color: "#3b9eff",
    label: "Presentation"
  }), e(Donut, {
    value: avgDemo,
    color: "#22d07a",
    label: "Demonstration"
  }))), e("div", {
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, "Recent Exams")), e("div", {
    className: "card-b"
  }, myExams.length === 0 ? e("div", {
    className: "empty"
  }, "No results yet. Your teacher will upload your graded scripts here.") : myExams.slice(-3).reverse().map((e, idx) => e("div", {
    key: e.id,
    className: "recent-exam-row",
    style: {
      animationDelay: `${0.15 * (idx + 1)}s`
    },
    onClick: () => {
      setTab('results');
      setTimeout(() => document.getElementById(`exam-card-${e.id}`)?.scrollIntoView({
        behavior: 'smooth'
      }), 50);
    }
  }, e("div", null, e("div", {
    className: "recent-sub"
  }, e.subject), e("div", {
    className: "recent-date"
  }, e.date)), e("div", {
    style: {
      textAlign: 'right'
    }
  }, e("div", {
    className: "recent-score"
  }, e.totalScore, "/", e.maxScore), e("span", {
    className: `badge ${e.pct >= 60 ? 'bg-green' : 'bg-gold'}`
  }, "Grade ", e.grade))))))), tab === 'results' && e("div", null, e("div", {
    className: "ph"
  }, e("h2", null, "My Exam Results"), e("p", null, "Detailed feedback for every graded exam")), myExams.length === 0 ? e("div", {
    className: "card"
  }, e("div", {
    className: "empty"
  }, "No results yet. Ask your teacher to analyse and upload your scripts!")) : myExams.map(e => e("div", {
    key: e.id,
    id: `exam-card-${e.id}`,
    className: "card"
  }, e("div", {
    className: "card-h"
  }, e("span", {
    className: "card-ht"
  }, e.subject), e("span", {
    style: {
      fontSize: 11,
      color: 'var(--t3)'
    }
  }, e.date)), e("div", {
    className: "card-b"
  }, e(ExamView, {
    exam: e
  }))))), tab === 'messages' && e(Messaging, {
    currentUser: currentUser,
    users: users,
    messages: messages,
    onSend: m => fbAddMessage(m)
  }))));
}

/* ══════════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════════ */
function Login({
  users,
  onLogin
}) {
  const [role, setRole] = useState('student');
  const [un, setUn] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const roles = [['admin', '🛡️', 'Admin'], ['teacher', '👩‍🏫', 'Teacher'], ['student', '🎓', 'Student']];
  const login = async () => {
    if (!un.trim() || !pw.trim()) {
      setErr('Please enter username and password.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      await signIn(un, pw);
      // Find user profile from Firestore users
      const u = users.find(x => x.username === un);
      if (!u) {
        setErr('User profile not found in database.');
        setLoading(false);
        return;
      }
      if (u.role !== role) {
        setErr(`This account is a ${u.role}, not ${role}.`);
        setLoading(false);
        return;
      }
      onLogin(u);
    } catch (e) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        setErr('Invalid username or password.');
      } else {
        setErr('Login error: ' + e.message);
      }
    }
    setLoading(false);
  };
  return e("div", {
    className: "login-wrap"
  }, e("div", {
    className: "login-orb lo1"
  }), e("div", {
    className: "login-orb lo2"
  }), e("div", {
    className: "login-orb lo3"
  }), e("div", {
    className: "signin-card"
  }, e("div", {
    className: "login-top"
  }, e("div", {
    className: "login-logo"
  }, e("img", {
    src: "/logo.png",
    alt: "Gradify Logo",
    onError: e => {
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'block';
    }
  }), e("span", {
    style: {
      display: 'none'
    }
  }, "GRADIFY")), e("div", {
    className: "login-tag"
  }, "Educator Portal")), e("div", {
    className: "login-body"
  }, e("div", {
    className: "login-sub"
  }, "Welcome Back \uD83D\uDC4B"), e("div", {
    className: "login-p"
  }, "Sign in to your Gradify account"), e("div", {
    className: "role-tabs"
  }, roles.map(([r, e, l]) => e("div", {
    key: r,
    className: 'rt' + (role === r ? ' on-' + r : ''),
    onClick: () => {
      setRole(r);
      setUn('');
      setPw('');
      setErr('');
    }
  }, e("div", {
    className: "rt-emoji"
  }, e), l))), e("div", {
    className: "field",
    style: {
      marginBottom: 16
    }
  }, e("input", {
    type: "text",
    className: "glass-input gi-1",
    placeholder: "Username or Email",
    value: un,
    onChange: e => setUn(e.target.value),
    onKeyDown: e => e.key === 'Enter' && login()
  })), e("div", {
    className: "field",
    style: {
      marginBottom: 16
    }
  }, e("input", {
    type: "password",
    className: "glass-input gi-2",
    placeholder: "Password",
    value: pw,
    onChange: e => setPw(e.target.value),
    onKeyDown: e => e.key === 'Enter' && login()
  })), e("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      fontSize: 13,
      color: 'rgba(255,255,255,0.6)',
      padding: '0 4px',
      animation: 'slideLeftIn 0.5s ease forwards 0.4s',
      opacity: 0
    }
  }, e("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer'
    }
  }, e("input", {
    type: "checkbox",
    style: {
      accentColor: '#6C63FF',
      width: 14,
      height: 14
    }
  }), " Remember me"), e("span", {
    style: {
      color: '#00D4AA',
      cursor: 'pointer',
      transition: 'color 0.2s'
    },
    onMouseOver: e => e.target.style.color = '#fff',
    onMouseOut: e => e.target.style.color = '#00D4AA'
  }, "Forgot Password?")), err && e("div", {
    className: "error-banner",
    style: {
      borderRadius: 8,
      padding: '10px 14px',
      marginTop: 10
    }
  }, err), e("button", {
    className: "signin-btn",
    onClick: login,
    disabled: loading
  }, loading ? e(React.Fragment, null, e("span", {
    className: "spin"
  }), " Signing in\u2026") : e(React.Fragment, null, "Sign In as ", roles.find(r => r[0] === role)?.[2])))));
}

/* ══════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectExams, setSubjectExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('site-theme') || 'dark');

  // dispatch is kept for backward compat with dashboard components (LOGOUT only)
  const dispatch = useCallback(action => {
    if (action.type === 'LOGOUT') {
      signOutUser();
      setCurrentUser(null);
    }
  }, []);
  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('light');else document.documentElement.classList.remove('light');
    localStorage.setItem('site-theme', theme);
  }, [theme]);

  // Inject CSS
  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'eduai-css';
    el.textContent = CSS;
    if (!document.getElementById('eduai-css')) document.head.appendChild(el);
    return () => {
      const e = document.getElementById('eduai-css');
      if (e) e.remove();
    };
  }, []);

  // Firebase: seed data + real-time listeners
  useEffect(() => {
    let unsubUsers, unsubMsgs, unsubExams, unsubSubjects, unsubSubjectExams;
    const init = async () => {
      try {
        await seedDataIfEmpty();
        await fbAddUser({
          id: 1,
          role: 'admin',
          name: 'Chandru',
          username: 'chandru',
          password: 'chandru8428',
          avatar: 'CH'
        });
      } catch (e) {
        console.error('Seed error:', e);
      }
      unsubUsers = onUsersChange(data => {
        setUsers(data);
        setLoading(false);
      });
      unsubMsgs = onMessagesChange(setMessages);
      unsubExams = onExamsChange(setExams);
      unsubSubjects = onSubjectsChange(setSubjects);
      unsubSubjectExams = onSubjectExamsChange(setSubjectExams);
    };
    init();
    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubMsgs) unsubMsgs();
      if (unsubExams) unsubExams();
      if (unsubSubjects) unsubSubjects();
      if (unsubSubjectExams) unsubSubjectExams();
    };
  }, []);
  if (loading) return e("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080b12',
      color: '#94a3c4',
      fontFamily: 'Inter, sans-serif',
      fontSize: 14
    }
  }, e("div", {
    style: {
      textAlign: 'center'
    }
  }, e("div", {
    className: "spin",
    style: {
      width: 28,
      height: 28,
      border: '3px solid #1e2a3e',
      borderTopColor: '#3b9eff',
      margin: '0 auto 14px'
    }
  }), "Connecting to Firebase\u2026"));
  const appState = {
    currentUser,
    users,
    messages,
    exams,
    subjects,
    subjectExams
  };
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const ThemeToggleBtn = () => e("button", {
    onClick: toggleTheme,
    style: {
      position: 'fixed',
      top: '24px',
      right: '24px',
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      background: 'var(--s1)',
      border: '1px solid var(--bdr)',
      color: 'var(--t1)',
      fontSize: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden'
    },
    title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
    onMouseOver: e => {
      e.currentTarget.style.transform = 'scale(1.1)';
      e.currentTarget.style.boxShadow = '0 12px 32px rgba(108,99,255,0.2)';
    },
    onMouseOut: e => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    }
  }, e("div", {
    key: theme,
    style: {
      animation: 'rotatePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      display: 'flex'
    }
  }, theme === 'dark' ? '☀️' : '🌙'));
  return e(React.Fragment, null, e("div", {
    className: "orbs"
  }, e("div", {
    className: "orb o1"
  }), e("div", {
    className: "orb o2"
  }), e("div", {
    className: "orb o3"
  }), e("div", {
    className: "orb o4"
  })), e(ThemeToggleBtn, null), !currentUser ? e(Login, {
    users: users,
    onLogin: u => setCurrentUser(u)
  }) : currentUser.role === 'admin' ? e(AdminDash, {
    currentUser: currentUser,
    appState: appState,
    dispatch: dispatch
  }) : currentUser.role === 'teacher' ? e(TeacherDash, {
    currentUser: currentUser,
    appState: appState,
    dispatch: dispatch
  }) : e(StudentDash, {
    currentUser: currentUser,
    appState: appState,
    dispatch: dispatch
  }));
}