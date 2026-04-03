import { useState, useRef, useEffect, useCallback } from "react";
import penSvg from './pen.svg';
import { signIn, signOutUser, addUser as fbAddUser, removeUser as fbRemoveUser, updateUser as fbUpdateUser, addMessage as fbAddMessage, addExam as fbAddExam, updateExam as fbUpdateExam, removeExam as fbRemoveExam, onUsersChange, onMessagesChange, onExamsChange, seedDataIfEmpty, addSubject as fbAddSubject, removeSubject as fbRemoveSubject, onSubjectsChange, addSubjectExam as fbAddSubjectExam, removeSubjectExam as fbRemoveSubjectExam, onSubjectExamsChange } from "./firebaseService.js";
import initializeKimiService from "./kimiService.js";
import AIAssistant from "./AIAssistant.jsx";

/* ══════════════════════════════════════════════════════════════
   UI ENHANCEMENTS: Custom Cursor, Page Transitions, Loading, Scroll Reveal, Brutalism
══════════════════════════════════════════════════════════════ */

// Custom cursor styles
const cursorCSS = `
#cursor-dot{position:fixed;pointer-events:none;display:inline-block;z-index:99999;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 8px rgba(255,215,0,0.3));transition:width 0.2s ease,height 0.2s ease;}
#cursor-ring{display:none;}
.cursor-disabled #cursor-dot{display:none !important;}
.cursor-toggle-btn{position:fixed;bottom:20px;right:20px;z-index:99998;padding:10px 16px;background:var(--s1);border:2px solid var(--bdr);border-radius:12px;color:var(--t1);font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.2);transition:all 0.3s ease;}
.cursor-toggle-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,0.3);border-color:var(--blue);}
`;

// Page transition styles
const pageTransitionCSS = `
.page-transition-enter{opacity:0;transform:translateY(10px);animation:page-enter 0.4s forwards ease-out;}
.page-transition-exit{opacity:1;transform:translateY(0);animation:page-exit 0.35s forwards ease-in;}
@keyframes page-enter{to{opacity:1;transform:translateY(0);}}
@keyframes page-exit{to{opacity:0;transform:translateY(-8px);}}
`;

// Loading animation styles  
const loadingCSS = `
.page-loader{position:fixed;inset:0;z-index:99998;background:rgba(17,17,17,0.95);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;opacity:1;transition:opacity 0.4s ease;}
.page-loader.hidden{opacity:0;pointer-events:none;visibility:hidden;}
.page-loader-container{perspective:1000px;width:100px;height:100px;}
.page-loader-cube{width:100%;height:100%;position:relative;transform-style:preserve-3d;animation:rotate3d 3s infinite linear;}
.page-loader-face{position:absolute;width:100px;height:100px;background:linear-gradient(135deg,#F94C24,#D43916);border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#fff;box-shadow:0 0 24px rgba(249,76,36,0.4);}
.page-loader-face:nth-child(1){transform:rotateY(0deg) translateZ(50px);}
.page-loader-face:nth-child(2){transform:rotateY(180deg) translateZ(50px);}
.page-loader-face:nth-child(3){transform:rotateY(90deg) translateZ(50px);}
.page-loader-face:nth-child(4){transform:rotateY(-90deg) translateZ(50px);}
.page-loader-face:nth-child(5){transform:rotateX(90deg) translateZ(50px);}
.page-loader-face:nth-child(6){transform:rotateX(-90deg) translateZ(50px);}
.page-loader-text{margin-top:32px;font-size:14px;color:rgba(255,255,255,0.7);font-family:var(--font-b);font-weight:600;letter-spacing:1px;animation:fadeInOut 2s infinite;}
@keyframes rotate3d{0%{transform:rotateX(0deg) rotateY(0deg) rotateZ(0deg);}100%{transform:rotateX(360deg) rotateY(360deg) rotateZ(360deg);}}
@keyframes fadeInOut{0%,100%{opacity:0.4;}50%{opacity:1;}}
`;

// Scroll reveal styles
const scrollRevealCSS = `
.reveal{opacity:0;transform:translateY(28px);transition:all 0.6s cubic-bezier(0.16, 1, 0.3, 1);}
.reveal-visible{opacity:1;transform:translateY(0);}
.reveal-delay-1{transition-delay:0.1s;}
.reveal-delay-2{transition-delay:0.2s;}
.reveal-delay-3{transition-delay:0.3s;}
`;

/* ══════════════════════════════════════════════════════════════
   STYLES — injected once via useEffect
══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

/* Custom Cursor */
#cursor-dot{position:fixed;pointer-events:none;display:inline-block;z-index:99999;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 8px rgba(255,215,0,0.3));transition:width 0.2s ease,height 0.2s ease;}
#cursor-ring{display:none;}
.cursor-disabled #cursor-dot{display:none !important;}
.cursor-toggle-btn{position:fixed;bottom:20px;right:20px;z-index:99998;padding:10px 16px;background:var(--s1);border:2px solid var(--bdr);border-radius:12px;color:var(--t1);font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.2);transition:all 0.3s ease;}
.cursor-toggle-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,0.3);border-color:var(--blue);}

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

html,body,#root{height:100%;background-color:var(--bg);position:relative;transition:background-color 0.4s ease;cursor:none;}
body{font-family:var(--font-b);color:var(--t1);}

@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideLeftIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulseGlow { 0% { box-shadow: 0 0 0px rgba(108,99,255,0.25); } 50% { box-shadow: 0 0 20px rgba(108,99,255,0.55); } 100% { box-shadow: 0 0 0px rgba(108,99,255,0.25); } }
@keyframes popIn { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
@keyframes rotatePop { from { transform: rotate(-90deg) scale(0); } to { transform: rotate(0deg) scale(1); } }
@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
@keyframes floatOrb { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-30px) translateX(15px); } }
@keyframes growDown { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes rgbGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes rgbGradientHover { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes buttonRipple { 0% { transform: scale(0); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }

/* ── ANIMATED ORBS (Desktop Only) ── */
.orbs { 
  position: fixed; 
  inset: 0; 
  z-index: -1; 
  pointer-events: none; 
  overflow: hidden; 
}

.orb { 
  position: absolute; 
  border-radius: 50%; 
  filter: blur(60px);  opacity: 0.05; 
  animation: floatOrb 12s ease-in-out infinite; 
}

.o1 { width: 400px; height: 400px; background: var(--blue); top: -10%; left: -5%; animation-duration: 14s; }
.o2 { width: 500px; height: 500px; background: var(--green); bottom: -10%; right: -10%; animation-duration: 18s; animation-delay: -5s; }
.o3 { width: 300px; height: 300px; background: var(--purple); top: 30%; left: 20%; animation-duration: 11s; animation-delay: -2s; }
.o4 { width: 600px; height: 600px; background: var(--gold); top: 5%; right: 5%; animation-duration: 20s; animation-delay: -7s; }

/* Mobile Performance Optimization - Disable orbs on small devices */
@media(max-width:768px){
  .orbs{display:none;}
  .orb{display:none;}
}

/* Reduce animations on low battery or accessibility preferences */
@media(prefers-reduced-motion:reduce){
  *{
    animation-duration:0.01ms !important;
    animation-iteration-count:1 !important;
    transition-duration:0.01ms !important;
  }
}

/* Reduce animate-heavy effects on battery saver */
@media(prefers-color-scheme:dark) and (prefers-reduced-data:reduce){
  .shimmer{display:none;}
  .floatOrb{display:none;}
  .fade*{
    animation:none !important;
  }
}

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
::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:0.375rem;}

/* ── SHELL (Mobile-first updated) ── */
.shell{
  display:flex;
  flex-direction:column;
  height:100vh;
  overflow:hidden;
  width:100%;
}

.sidebar{
  position:fixed;
  inset:0;
  width:100%;
  height:100vh;
  background:var(--s1);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  border-right:1px solid var(--bdr);
  display:flex;
  flex-direction:column;
  overflow-y:auto;
  z-index:60;
  transform:translateX(-100%);
  transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y:auto;
}

.sidebar.open{transform:translateX(0);}

.content{
  flex:1;
  overflow-y:auto;
  background:transparent;
  position:relative;
  width:100%;
  padding-top:3.5rem;
}

.pad{
  padding:1rem;
}

.mobile-sidebar-toggle{
  position:fixed;
  top:1rem;
  left:1rem;
  width:2.75rem;
  height:2.75rem;
  background:var(--s1);
  border:1.5px solid var(--bdr);
  border-radius:0.625rem;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  z-index:61;
  color:var(--t1);
  font-size:1.25rem;
  min-height:44px;
  min-width:44px;
  transition:all 0.2s ease;
}

.mobile-sidebar-toggle:active{
  transform:scale(0.95);
}

.mobile-sidebar-toggle:focus{
  outline:2px solid var(--blue);
  outline-offset:2px;
}

/* ── SIDEBAR ── */
.sb-brand{
  padding:1.5rem 1rem 1rem;
  border-bottom:1px solid var(--bdr);
}

.sb-brand-name{
  font-family:var(--font-h);
  font-weight:800;
  font-size:1.5rem;
  background:linear-gradient(135deg,var(--blue),var(--green));
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  line-height:1.2;
}
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
.logout{width:100%;background:linear-gradient(90deg, #FF0000, #FF006E, #FF0000, #FF0080);background-size:300% 300%;border:none;color:white;border-radius:10px;padding:10px;font-size:13px;cursor:pointer;font-family:var(--font-b);font-weight:700;transition:all 0.3s ease;animation:rgbGradient 4s ease infinite;box-shadow:0 4px 12px rgba(255,0,0,0.3);}
.logout:hover{border-color:var(--red);color:var(--red);background:rgba(239,68,68,0.05);}

/* ── PAGE HEADER ── */
.ph{margin-bottom:28px;}
.ph h2{font-family:var(--font-h);font-size:28px;font-weight:700;letter-spacing:-0.5px;}
.ph p{font-size:14px;color:var(--t3);margin-top:6px;}

/* ── THEME TOGGLE ── */
.theme-toggle{background:var(--s1);backdrop-filter:blur(12px);border:1px solid var(--bdr);color:var(--t1);width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s ease;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.05);margin-left:auto;}
.theme-toggle:hover{transform:scale(1.05);border-color:var(--blue);color:var(--blue);}

/* ── CARDS (GLASSMORPHISM + BRUTALISM) ── */
.card, .stat, .qc, .msg-wrap, .login-box, .edit-panel, .upload-bar{
  background:var(--s1);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  border:2px solid var(--bdr);
  border-radius:16px;
  box-shadow:0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.05) inset;
  transition:all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow:hidden;
  position:relative;
}
.card::before, .stat::before, .qc::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--blue),var(--green));opacity:0;transition:opacity 0.3s;
}
.card:hover::before, .stat:hover::before, .qc:hover::before{opacity:1;}
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

/* ── FORM (Mobile-First) ── */
.field{
  margin-bottom:1rem;
  display:flex;
  flex-direction:column;
}

.fl{
  display:block;
  font-size:0.75rem;
  font-weight:700;
  letter-spacing:0.125rem;
  text-transform:uppercase;
  color:var(--blue);
  margin-bottom:0.5rem;
  font-family:var(--font-h);
}

input[type=text],
input[type=password],
input[type=email],
input[type=number],
input[type=date],
input[type=time],
select,
textarea{
  width:100%;
  background:var(--bg);
  border:1px solid var(--bdr);
  border-radius:0.625rem;
  color:var(--t1);
  font-family:var(--font-b);
  font-size:1rem;
  padding:0.75rem 0.875rem;
  outline:none;
  min-height:44px;
  transition:all 0.2s ease;
  box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);
  -webkit-appearance:none;
  appearance:none;
}

/* Prevent zoom on iOS when input is focused */
@supports (-webkit-touch-callout:none){
  input,select,textarea{
    font-size:16px;
  }
}

input:focus,
textarea:focus,
select:focus{
  border-color:var(--blue);
  box-shadow:0 0 0 3px rgba(108,99,255,0.15);
  transform:translateY(-2px);
}

input::placeholder,
textarea::placeholder{
  color:var(--t3);
  font-size:0.875rem;
}

select option{
  background:var(--bg);
  color:var(--t1);
}

select{
  padding-right:2rem;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M3 4l3 3 3-3'/%3E%3C/svg%3E");
  background-position:right 0.5rem center;
  background-repeat:no-repeat;
  background-size:1rem;
  padding-right:2.25rem;
}

textarea{
  resize:vertical;
  min-height:100px;
  font-family:var(--font-b);
}

.g2{
  display:grid;
  grid-template-columns:1fr;
  gap:0.75rem;
}
.g3{
  display:grid;
  grid-template-columns:1fr;
  gap:0.75rem;
}

/* ── BUTTONS (Mobile-First) ── */
.btn{
  border:none;
  border-radius:0.625rem;
  padding:0.75rem 1rem;
  font-family:var(--font-h);
  font-size:0.875rem;
  font-weight:600;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:0.5rem;
  transition:all 0.3s ease;
  min-height:44px;
  width:100%;
  position:relative;
  overflow:hidden;
  -webkit-tap-highlight-color:transparent;
}

.btn:active:not(:disabled){
  transform:scale(0.97);
}

.btn:disabled{
  opacity:0.5;
  cursor:not-allowed;
}

.btn:focus{
  outline:2px solid var(--blue);
  outline-offset:2px;
}

.btn-blue{
  background:linear-gradient(90deg, #FF006E, #FF0080, #FF006E, #00F5FF, #FF006E, #FF0080);
  background-size:300% 300%;
  color:#fff;
  animation:rgbGradient 4s ease infinite;
  box-shadow:0 4px 12px rgba(255,0,110,0.4);
  font-weight:700;
}

.btn-blue:hover:not(:disabled){
  transform:scale(1.05);
  box-shadow:0 8px 24px rgba(255,0,110,0.6);
  animation:rgbGradientHover 2.5s ease infinite;
}

.btn-blue:active:not(:disabled){
  transform:scale(0.97);
  box-shadow:0 2px 8px rgba(255,0,110,0.4);
}

.btn-gold{
  background:linear-gradient(90deg, #FFD700, #FFA500, #FFD700, #FFD700);
  background-size:300% 300%;
  color:#1a1a1a;
  animation:rgbGradient 4s ease infinite;
  box-shadow:0 4px 12px rgba(255,215,0,0.4);
  font-weight:700;
}

.btn-gold:hover:not(:disabled){
  transform:scale(1.05);
  box-shadow:0 8px 24px rgba(255,215,0,0.6);
  animation:rgbGradientHover 2.5s ease infinite;
}

.btn-gold:active:not(:disabled){
  transform:scale(0.97);
  box-shadow:0 2px 8px rgba(255,215,0,0.4);
}

.btn-green{
  background:linear-gradient(90deg, #00FF00, #00FFFF, #0080FF, #00FF00);
  background-size:300% 300%;
  color:#1a1a1a;
  animation:rgbGradient 4s ease infinite;
  box-shadow:0 4px 12px rgba(0,255,0,0.4);
  font-weight:700;
}

.btn-green:hover:not(:disabled){
  transform:scale(1.05);
  box-shadow:0 8px 24px rgba(0,255,0,0.6);
  animation:rgbGradientHover 2.5s ease infinite;
}

.btn-green:active:not(:disabled){
  transform:scale(0.97);
  box-shadow:0 2px 8px rgba(0,255,0,0.4);
}

.btn-ghost{
  background:var(--s2);
  border:2px solid transparent;
  background-image:linear-gradient(var(--s2), var(--s2)), linear-gradient(90deg, #FF006E, #0080FF, #00FFFF, #FF006E);
  background-origin:border-box;
  background-clip:padding-box, border-box;
  color:var(--t1);
  position:relative;
  animation:none;
  box-shadow:0 0 12px rgba(255,0,110,0.2);
}

.btn-ghost:hover:not(:disabled){
  transform:scale(1.05);
  box-shadow:0 0 24px rgba(0,128,255,0.4);
}
  color:var(--t1);
}

.btn-danger{
  background:linear-gradient(90deg, #FF0000, #FF006E, #FF0000, #FF0080);
  background-size:300% 300%;
  border:none;
  color:white;
  animation:rgbGradient 4s ease infinite;
  box-shadow:0 4px 12px rgba(255,0,0,0.4);
  font-weight:700;
}

.btn-danger:hover:not(:disabled){
  transform:scale(1.05);
  box-shadow:0 8px 24px rgba(255,0,0,0.6);
  animation:rgbGradientHover 2.5s ease infinite;
}

.btn-danger:active:not(:disabled){
  transform:scale(0.97);
  box-shadow:0 2px 8px rgba(255,0,0,0.4);
}

.btn-sm{
  padding:0.5rem 0.875rem;
  font-size:0.8125rem;
  min-height:40px;
}

.btn-lg{
  padding:1rem 1.5rem;
  font-size:1rem;
  font-family:var(--font-h);
  font-weight:700;
  min-height:48px;
}

/* Touch-friendly ripple effect */
.btn::before{
  content:'';
  position:absolute;
  inset:0;
  background:radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%);
  transform:scale(0);
  opacity:0;
  transition:transform 0.3s ease;
}

.btn:active::before{
  transform:scale(1.5);
  opacity:1;
}

/* Tablet button adjustments */
@media(min-width:768px){
  .shell{
    flex-direction:row;
  }
  
  .sidebar{
    position:relative !important;
    width:16rem;
    height:100vh;
    max-width:none;
    transform:translateX(0) !important;
    border-right:1px solid var(--bdr);
  }
  
  .sidebar-backdrop{
    display:none !important;
  }
  
  .mobile-sidebar-toggle{
    display:none !important;
  }
  
  .content{
    padding-top:0 !important;
  }
  
  .stats{
    grid-template-columns:repeat(2,1fr);
    gap:1rem;
  }
  
  .g2{
    grid-template-columns:repeat(2,1fr);
    gap:1rem;
  }
  
  .g3{
    grid-template-columns:repeat(2,1fr);
    gap:1rem;
  }
  
  .pad{
    padding:2rem 1.5rem;
  }
  
  .ph h2{
    font-size:1.75rem;
  }
  
  .stat-v{
    font-size:2rem;
  }
  
  .btn{
    width:auto;
  }
  
  .btn:hover:not(:disabled){
    transform:scale(1.05);
  }
  
  .btn-blue:hover:not(:disabled){
    box-shadow:0 12px 32px rgba(255,0,110,0.6);
  }
  
  .btn-gold:hover:not(:disabled){
    box-shadow:0 12px 32px rgba(255,215,0,0.6);
  }
  
  .btn-green:hover:not(:disabled){
    box-shadow:0 12px 32px rgba(0,255,0,0.6);
  }
  
  .btn-ghost:hover:not(:disabled){
    box-shadow:0 0 24px rgba(0,128,255,0.4);
  }
  
  .btn-danger:hover:not(:disabled){
    box-shadow:0 12px 32px rgba(255,0,0,0.6);
  }
  
  .msg-wrap{
    grid-template-columns:16rem 1fr;
  }
  
  .sb-num{
    font-size:3rem;
  }
  
  .sb-den{
    font-size:1.5rem;
  }
  
  .pie-row{
    gap:2rem;
  }
}

/* ── DESKTOP (1024px+) ── */
@media(min-width:1024px){
  .sidebar{
    width:15rem;
  }
  
  .stats{
    grid-template-columns:repeat(4,1fr);
    gap:1.25rem;
  }
  
  .g3{
    grid-template-columns:repeat(3,1fr);
  }
  
  .pad{
    padding:2rem 2.25rem;
  }
  
  .ph h2{
    font-size:2rem;
  }
  
  .stat-v{
    font-size:2.5rem;
  }
  
  .stat-i{
    width:3rem;
    height:3rem;
    font-size:1.5rem;
  }
  
  .sb-num{
    font-size:4rem;
  }
  
  .sb-grade{
    font-size:1.5rem;
  }
  
  .tbl{
    font-size:0.9375rem;
  }
  
  .tbl th,
  .tbl td{
    padding:1rem 1.125rem;
  }
}

button:active, .btn:active, .signin-btn:active, .logout:active, .add-q-btn:active, .add-part-btn:active, .theme-toggle:active, .rt:active, .nav-item:active, .msg-contact:active, .recent-exam-row:active { 
  transform: scale(0.95) !important; 
  transition: transform 0.1s ease !important; 
}

/* Micro-interactions - touch friendly */
.btn, .signin-btn, .logout, .rt, .nav-item, .msg-contact, .recent-exam-row, .cursor-toggle-btn{
  position:relative;
  overflow:hidden;
}

.btn::after, .signin-btn::after, .logout::after, .rt::after, .nav-item::after, .msg-contact::after, .recent-exam-row::after{
  content:'';
  position:absolute;
  inset:0;
  background:radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%);
  transform:scale(0);
  opacity:0;
  transition:transform 0.3s,opacity 0.2s;
}

.btn:active::after, .signin-btn:active::after, .logout:active::after, .rt:active::after, .nav-item:active::after, .msg-contact:active::after, .recent-exam-row:active::after{
  transform:scale(1.5);
  opacity:1;
}

/* Hover lift effect for cards */
.card:hover, .stat:hover, .qc:hover, .upload-bar:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 20px 50px rgba(0,0,0,0.2),0 0 0 2px var(--blue),0 0 25px rgba(108,99,255,0.2);}

/* Hover glow effects for buttons - RGB Animated */
.btn-blue:hover{box-shadow:0 12px 32px rgba(255,0,110,0.6);}
.btn-gold:hover{box-shadow:0 12px 32px rgba(255,215,0,0.6);}
.btn-green:hover{box-shadow:0 12px 32px rgba(0,255,0,0.6);}
.btn-ghost:hover{box-shadow:0 8px 24px rgba(0,128,255,0.4);}
.signin-btn:hover{box-shadow:0 16px 40px rgba(255,0,110,0.6);}
.logout:hover{box-shadow:0 8px 16px rgba(255,0,0,0.4);}

/* Input focus glow */
input:focus, textarea:focus, select:focus{transform:translateX(4px);box-shadow:0 0 0 3px rgba(108,99,255,0.2),0 4px 16px rgba(108,99,255,0.15);}

/* Nav item brutalist shadow on hover */
.nav-item:hover{box-shadow:4px 4px 0 var(--blue);}

/* Badge pop animation */
.badge{animation:badgePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);}
@keyframes badgePop{0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);}}

/* Score banner glow */
.score-banner{animation:scoreBannerPulse 3s ease-in-out infinite;}
@keyframes scoreBannerPulse{0%,100%{box-shadow:0 0 0 rgba(108,99,255,0);}50%{box-shadow:0 0 40px rgba(108,99,255,0.15);}}

/* Stat number bounce on hover */
.stat:hover .stat-v{animation:statBounce 0.4s ease;}
@keyframes statBounce{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}

/* Donut chart pulse */
.pie-row > div > div:first-child{animation:donutPulse 2s ease-in-out infinite;}
@keyframes donutPulse{0%,100%{filter:drop-shadow(0 0 0px rgba(108,99,255,0));}50%{filter:drop-shadow(0 0 15px rgba(108,99,255,0.4));}}

/* Success/error banner slide in */
.success-banner, .error-banner{animation:bannerSlide 0.4s ease;}
@keyframes bannerSlide{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}

/* Dropzone hover icon lift */
.dz:hover .dz-icon{transform:translateY(-4px);}

/* Recent exam row hover slide */
.recent-exam-row:hover{transform:translateX(4px);}
.stat:hover{border-top-color:var(--blue);}

/* Input focus glow */
input:focus, textarea:focus, select:focus{transform:translateX(4px);box-shadow:0 0 0 3px rgba(108,99,255,0.2),0 4px 16px rgba(108,99,255,0.15);}

/* Sidebar brutalist offset on hover */
.nav-item:hover{transform:translateX(8px) translateY(-2px);box-shadow:4px 4px 0 var(--blue);}
.nav-item.on:hover{box-shadow:4px 4px 0 var(--gold);}

/* Message bubble animations */
.bubble{animation:bounceIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);}
@keyframes bounceIn{0%{opacity:0;transform:scale(0.8) translateY(10px);}70%{transform:scale(1.05);}100%{opacity:1;transform:scale(1) translateY(0);}}

/* Modal slide up */
.modal{animation:modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);}
@keyframes modalSlideUp{from{opacity:0;transform:translateY(40px) scale(0.9);}to{opacity:1;transform:translateY(0) scale(1);}}

/* Score banner glow */
.score-banner{animation:scoreBannerPulse 3s ease-in-out infinite;}
@keyframes scoreBannerPulse{0%,100%{box-shadow:0 0 0 rgba(108,99,255,0);}50%{box-shadow:0 0 40px rgba(108,99,255,0.15);}}

/* Stats bounce on hover */
.stat:hover .stat-v{animation:statBounce 0.4s ease;}
@keyframes statBounce{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}

/* Donut chart pulse */
.pie-row > div > div:first-child{animation:donutPulse 2s ease-in-out infinite;}
@keyframes donutPulse{0%,100%{filter:drop-shadow(0 0 0px rgba(108,99,255,0));}50%{filter:drop-shadow(0 0 15px rgba(108,99,255,0.4));}}

/* Badge pop */
.badge{animation:badgePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);}
@keyframes badgePop{0%{transform:scale(0);}70%{transform:scale(1.2);}100%{transform:scale(1);}}

/* Login card shine effect */
.signin-card::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(45deg,transparent 40%,rgba(255,255,255,0.1) 50%,transparent 60%);transform:rotate(45deg);animation:cardShine 6s linear infinite;pointer-events:none;}
@keyframes cardShine{0%{transform:translateX(-100%) rotate(45deg);}100%{transform:translateX(100%) rotate(45deg);}}

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

.signin-card{
  background:var(--s1);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
  border:1px solid var(--bdr);
  border-radius:20px;
  padding:32px 28px;
  width:90%;
  max-width:480px;
  box-shadow:0 8px 32px rgba(0,0,0,0.3);
  animation:fadeInUp 0.8s ease forwards;
  position:relative;
  z-index:10;
  margin:0 auto;
}
.login-top{text-align:center;margin-bottom:20px;}
.login-logo{font-family:var(--font-h);font-size:28px;font-weight:800;display:flex;flex-direction:column;align-items:center;gap:10px;}
.login-logo img{max-height:70px;object-fit:contain;}
.login-logo span{color:var(--t1);}
.login-tag{font-size:12px;color:var(--blue);margin-top:8px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;}

.login-sub{font-size:20px;color:var(--t1);font-weight:700;font-family:var(--font-h);margin-bottom:6px;}
.login-p{font-size:13px;color:var(--t3);margin-bottom:20px;}

.role-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
.rt{padding:12px 8px;border-radius:12px;border:1.5px solid var(--bdr);background:var(--s2);cursor:pointer;text-align:center;font-size:12px;font-weight:700;color:var(--t2);transition:all 0.3s ease;user-select:none;font-family:var(--font-b);min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.rt:hover{color:var(--t1);background:var(--s1);border-color:var(--t2);}
.rt-emoji{font-size:20px;margin-bottom:4px;line-height:1;}
.rt.on-admin{border-color:var(--gold);background:var(--s3);color:var(--gold);box-shadow:0 0 16px rgba(245,166,35,0.15);}
.rt.on-teacher{border-color:var(--blue);background:var(--s3);border:1.5px solid var(--blue);color:var(--blue);box-shadow:0 0 16px rgba(249,76,36,0.15);}
.rt.on-student{border-color:var(--green);background:var(--s3);border:1.5px solid var(--green);color:var(--green);box-shadow:0 0 16px rgba(232,102,56,0.15);}

.glass-input{background:var(--s2);border:1.5px solid var(--bdr);border-radius:12px;color:var(--t1);padding:14px 16px;width:100%;transition:all 0.3s ease;font-family:var(--font-b);font-size:14px;outline:none;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);opacity:0;animation:slideLeftIn 0.5s ease forwards;}
.glass-input:focus{border-color:var(--blue);background:var(--s1);box-shadow:inset 0 2px 4px rgba(0,0,0,0.1), 0 0 16px rgba(249,76,36,0.15);}
.glass-input::placeholder{color:var(--t3);}
.gi-1{animation-delay:0.2s;margin-bottom:14px;}.gi-2{animation-delay:0.3s;margin-bottom:14px;}

.signin-btn{width:100%;padding:14px 16px;border-radius:12px;background:linear-gradient(90deg, #FF006E, #FF0080, #FF006E, #00F5FF, #FF006E, #FF0080);background-size:300% 300%;color:white;font-family:var(--font-h);font-weight:700;font-size:15px;border:none;cursor:pointer;transition:all 0.3s ease;animation:rgbGradient 4s ease infinite;margin-top:20px;min-height:48px;box-shadow:0 4px 16px rgba(255,0,110,0.4);}
.signin-btn:hover:not(:disabled){transform:scale(1.05);box-shadow:0 12px 32px rgba(255,0,110,0.6);animation:rgbGradientHover 2.5s ease infinite;}
.signin-btn:active:not(:disabled){transform:scale(0.97);box-shadow:0 4px 12px rgba(255,0,110,0.4);}
.signin-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none;}

/* ── RECENTS & MISC ── */
.recent-exam-row{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-bottom:1px solid var(--bdr);cursor:pointer;transition:all 0.3s ease;border-radius:12px;}
.recent-exam-row:hover{background:var(--s2);transform:translateX(4px);}
.recent-sub{font-size:14px;font-weight:600;font-family:var(--font-h);margin-bottom:4px;}
.recent-date{font-size:12px;color:var(--t3);font-family:var(--font-m);}
.recent-score{font-family:var(--font-m);font-size:15px;font-weight:700;}

.spin{width:18px;height:18px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;}
@keyframes spin{to{transform:rotate(360deg);}}
.empty{text-align:center;padding:2.5rem 1.5rem;color:var(--t3);font-size:0.875rem;font-weight:500;}
.flex{display:flex;}.fac{align-items:center;}.fjb{justify-content:space-between;}.gap{gap:0.75rem;}
.mt8{margin-top:0.5rem;}.mt12{margin-top:0.75rem;}.mt16{margin-top:1rem;}.mt20{margin-top:1.25rem;}

/* ════════════════════════════════════════════════════════════
   MOBILE-FIRST RESPONSIVE DESIGN 
   Strategy: Start mobile (320px), expand upward
   Breakpoints: 320px → 480px → 768px → 1024px
   ════════════════════════════════════════════════════════════ */

/* ── MOBILE (320px - 480px) ── */
.shell{
  display:flex;
  flex-direction:column;
  height:100vh;
  overflow:hidden;
}

.sidebar{
  position:fixed;
  inset:0;
  width:100%;
  height:100%;
  background:var(--s1);
  backdrop-filter:blur(12px);
  z-index:60;
  transform:translateX(-100%);
  transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y:auto;
}

.sidebar.open{transform:translateX(0);}
.sidebar.closed{transform:translateX(-100%);}

.sidebar-backdrop{
  position:fixed;
  inset:0;
  z-index:55;
  background:rgba(0,0,0,0.5);
  backdrop-filter:blur(4px);
  display:none;
}

.sidebar-backdrop.visible{display:block;}

.content{
  flex:1;
  overflow-y:auto;
  width:100%;
  padding-top:3.5rem;
}

.mobile-sidebar-toggle{
  position:fixed;
  top:1rem;
  left:1rem;
  width:2.75rem;
  height:2.75rem;
  background:var(--s1);
  border:1.5px solid var(--bdr);
  border-radius:10px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  z-index:61;
  color:var(--t1);
  font-size:1.25rem;
  transition:all 0.2s ease;
  min-height:44px;
}

.mobile-sidebar-toggle:active{
  transform:scale(0.95);
}

/* Mobile-first dimensions */
.sb-brand{padding:1.5rem 1rem 1rem;}
.sb-brand-name{font-size:1.25rem;font-weight:800;line-height:1.2;}
.sb-brand-role{font-size:0.625rem;letter-spacing:0.125rem;margin-top:0.25rem;font-weight:600;}

.sb-user{
  padding:1rem;
  gap:0.75rem;
  margin-bottom:1rem;
  border-bottom:1px solid var(--bdr);
}

.av{
  width:2.25rem;
  height:2.25rem;
  border-radius:0.75rem;
  font-size:0.75rem;
  font-weight:700;
  flex-shrink:0;
}

.sb-uname{font-size:0.875rem;font-weight:600;}
.sb-usub{font-size:0.75rem;color:var(--t3);}

.sb-nav{flex:1;padding:0.75rem 0;}
.nav-item{
  display:flex;
  align-items:center;
  gap:0.75rem;
  padding:0.75rem 1rem;
  font-size:0.875rem;
  cursor:pointer;
  min-height:44px;
  transition:all 0.2s ease;
  border-radius:0.75rem;
  margin:0.25rem 0.5rem;
}

.nav-item:active{
  transform:scale(0.98);
}

.nav-ic{font-size:1.125rem;width:1.5rem;text-align:center;}

.sb-foot{padding:1rem;border-top:1px solid var(--bdr);}

/* Mobile-first card dimensions */
.card, .stat, .qc, .msg-wrap, .login-box, .edit-panel, .upload-bar{
  border-radius:0.875rem;
}

.card-h, .qc-h{
  padding:0.875rem 1rem;
  font-size:0.875rem;
}

.card-b, .qc-b{
  padding:1rem;
}

/* Mobile-first typography */
.ph h2{font-size:1.5rem;}
.ph{margin-bottom:1.5rem;}

.stat-v{font-size:1.75rem;line-height:1;}
.stat-l{font-size:0.65rem;text-transform:uppercase;margin-top:0.5rem;}
.stat-i{width:2.5rem;height:2.5rem;border-radius:0.75rem;font-size:1.25rem;margin-bottom:1rem;}

/* Mobile-first grid */
.stats{
  grid-template-columns:1fr;
  gap:0.75rem;
  margin-bottom:1.5rem;
}

.g2, .g3{
  grid-template-columns:1fr;
  gap:0.75rem;
}

/* Mobile-first buttons */
.btn{
  min-height:44px;
  padding:0.75rem 1rem;
  font-size:0.875rem;
  border-radius:0.625rem;
  width:100%;
  transition:all 0.2s ease;
}

.btn:active{
  transform:scale(0.98);
}

/* Mobile-first form inputs */
input[type=text],
input[type=password],
input[type=number],
select,
textarea{
  width:100%;
  padding:0.75rem 0.875rem;
  font-size:1rem;
  border-radius:0.625rem;
  min-height:44px;
  -webkit-appearance:none;
  appearance:none;
}

input::placeholder,
textarea::placeholder{
  font-size:0.875rem;
}

.field{margin-bottom:1rem;}
.fl{font-size:0.75rem;text-transform:uppercase;margin-bottom:0.5rem;}

/* Mobile-first table */
.tbl th, .tbl td{
  padding:0.75rem;
  font-size:0.8125rem;
}

/* Mobile-first badges */
.badge{
  font-size:0.65rem;
  padding:0.25rem 0.625rem;
}

/* Mobile-first login */
.login-wrap{
  padding:1rem;
}

.signin-card{
  width:100%;
  max-width:calc(100vw - 2rem);
  padding:1.5rem;
  border-radius:1rem;
}

.login-logo{
  font-size:1.5rem;
}

.login-tag{
  font-size:0.75rem;
  margin-top:0.5rem;
}

.login-sub{font-size:1rem;}
.login-p{font-size:0.875rem;}

/* Mobile-first score banner */
.score-banner{
  padding:1.5rem;
  border-radius:1rem;
}

.sb-num{font-size:2rem;font-weight:800;}
.sb-den{font-size:1.25rem;}
.sb-pct{font-size:0.875rem;margin:0.5rem 0 1rem;}
.sb-grade{font-size:1rem;padding:0.5rem 1rem;}

.pie-row{gap:1rem;padding:1rem 0;}

/* Mobile-first animations - reduced for performance */
@media(prefers-reduced-motion:reduce){
  *{
    animation-duration:0.01ms !important;
    animation-iteration-count:1 !important;
    transition-duration:0.01ms !important;
  }
}

/* Reduce animations on battery saver or low power */
@media(prefers-reduced-motion:no-preference){
  @supports (animation-timeline:view()){
    .reveal{animation-timeline:view();}
  }
}

/* ── TABLET SMALL (480px - 768px) ── */
@media(min-width:480px){
  .content{padding-top:0;}
  .sidebar{
    position:fixed;
    width:100%;
    max-width:85vw;
    transform:translateX(-105%);
  }
  .mobile-sidebar-toggle{top:0.75rem;left:0.75rem;}
  .pad{padding:1.25rem;}
  .sb-brand-name{font-size:1.125rem;}
  .nav-item{font-size:0.8125rem;padding:0.65rem 0.85rem;}
  .ph h2{font-size:1.625rem;}
  .stats{gap:0.875rem;}
  .stat-v{font-size:1.875rem;}
  .btn{font-size:0.9375rem;}
  input,textarea,select{font-size:0.95rem;}
  .signin-card{padding:28px 24px;max-width:500px;}
  .login-logo{font-size:1.75rem;}
  .sb-num{font-size:2.5rem;}
}

/* ── TABLET (768px - 1024px) ── */
@media(min-width:768px){
  .shell{flex-direction:row;}
  .sidebar{
    position:relative;
    width:16rem;
    max-width:none;
    height:100vh;
    transform:translateX(0);
    border-right:1px solid var(--bdr);
  }
  .sidebar-backdrop{display:none !important;}
  .mobile-sidebar-toggle{display:none;}
  .content{
    flex:1;
    padding-top:0;
    overflow-y:auto;
  }
  
  .stats{
    grid-template-columns:repeat(2,1fr);
    gap:1rem;
  }
  .g2{grid-template-columns:repeat(2,1fr);}
  .g3{grid-template-columns:repeat(2,1fr);}
  
  .pad{padding:2rem 1.5rem;}
  .ph h2{font-size:1.75rem;}
  .stat-v{font-size:2rem;}
  .sb-num{font-size:3rem;}
  .sb-den{font-size:1.5rem;}
  .sb-pct{font-size:1rem;}
  .sb-grade{font-size:1.25rem;}
  
  .btn{width:auto;}
  input,textarea,select{font-size:1rem;}
  
  .msg-wrap{grid-template-columns:16rem 1fr;}
  .tbl{font-size:0.875rem;}
  .tbl th,.tbl td{padding:0.875rem 1rem;}
}

/* ── DESKTOP (1024px+) ── */
@media(min-width:1024px){
  .sidebar{width:15rem;}
  .stats{
    grid-template-columns:repeat(4,1fr);
    gap:1.125rem;
  }
  .g3{grid-template-columns:repeat(3,1fr);}
  .pad{padding:2rem 2.25rem;}
  .ph h2{font-size:1.75rem;}
  .stat-v{font-size:2.25rem;}
  .sb-num{font-size:3.5rem;}
  .contact-list{width:18rem;}
  .stat-i{width:3rem;height:3rem;font-size:1.5rem;}
}
}

/* Mobile sidebar toggle button */
.mobile-sidebar-toggle{display:none;position:fixed;top:20px;left:20px;width:44px;height:44px;background:var(--s1);border:1px solid var(--bdr);border-radius:12px;color:var(--t1);font-size:20px;cursor:pointer;z-index:70;align-items:center;justify-content:center;transition:all 0.3s ease;}
.mobile-sidebar-toggle:hover{background:var(--s2);border-color:var(--blue);}
.sidebar-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:50;opacity:0;pointer-events:none;transition:opacity 0.3s ease;}
.sidebar-backdrop.visible{opacity:1;pointer-events:auto;}

/* Page Transitions */
.page-transition-enter{opacity:0;transform:translateY(10px);animation:page-enter 0.4s forwards ease-out;}
.page-transition-exit{opacity:1;transform:translateY(0);animation:page-exit 0.35s forwards ease-in;}
@keyframes page-enter{to{opacity:1;transform:translateY(0);}}
@keyframes page-exit{to{opacity:0;transform:translateY(-8px);}}

/* Loading Animation */
.page-loader{position:fixed;inset:0;z-index:99998;background:rgba(17,17,17,0.95);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;opacity:1;transition:opacity 0.35s ease;}
.page-loader.hidden{opacity:0;pointer-events:none;visibility:hidden;}
.page-loader-container{perspective:1000px;width:100px;height:100px;}
.page-loader-cube{width:100%;height:100%;position:relative;transform-style:preserve-3d;animation:rotate3d 3s infinite linear;}
.page-loader-face{position:absolute;width:100px;height:100px;background:linear-gradient(135deg,#F94C24,#D43916);border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#fff;box-shadow:0 0 24px rgba(249,76,36,0.4);}
.page-loader-face:nth-child(1){transform:rotateY(0deg) translateZ(50px);}
.page-loader-face:nth-child(2){transform:rotateY(180deg) translateZ(50px);}
.page-loader-face:nth-child(3){transform:rotateY(90deg) translateZ(50px);}
.page-loader-face:nth-child(4){transform:rotateY(-90deg) translateZ(50px);}
.page-loader-face:nth-child(5){transform:rotateX(90deg) translateZ(50px);}
.page-loader-face:nth-child(6){transform:rotateX(-90deg) translateZ(50px);}
.page-loader-text{margin-top:32px;font-size:14px;color:rgba(255,255,255,0.7);font-family:var(--font-b);font-weight:600;letter-spacing:1px;animation:fadeInOut 2s infinite;}
@keyframes rotate3d{0%{transform:rotateX(0deg) rotateY(0deg) rotateZ(0deg);}100%{transform:rotateX(360deg) rotateY(360deg) rotateZ(360deg);}}
@keyframes fadeInOut{0%,100%{opacity:0.4;}50%{opacity:1;}}

/* Scroll Reveal */
.reveal{opacity:0;transform:translateY(24px);transition:all 0.5s cubic-bezier(0.16, 1, 0.3, 1);}
.reveal-visible{opacity:1;transform:translateY(0);}
.reveal-delay-1{transition-delay:0.1s;}
.reveal-delay-2{transition-delay:0.2s;}
.reveal-delay-3{transition-delay:0.3s;}
`;

/* Seed data moved to firebaseService.js — seeded to Firestore on first run */

/* ══════════════════════════════════════════════════════════════
   UI ENHANCEMENT INITIALIZERS
══════════════════════════════════════════════════════════════ */

// Initialize page transitions
export const initPageTransitions = () => {
    // Add enter animation on page load
    document.body.classList.add('page-transition-enter');
    setTimeout(() => document.body.classList.remove('page-transition-enter'), 450);

    // Add exit animation on link clicks
    document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (!a || a.target || a.href.indexOf(location.origin) !== 0 || a.href.includes('#')) return;
        e.preventDefault();
        document.body.classList.add('page-transition-exit');
        setTimeout(() => { window.location.href = a.href; }, 300);
    });
};

// Initialize loading animation
export const initPageLoader = () => {
    if (document.getElementById('page-loader')) return;
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.className = 'page-loader';
    loader.innerHTML = `
    <div class="page-loader-container">
      <div class="page-loader-cube">
        <div class="page-loader-face">F</div>
        <div class="page-loader-face">B</div>
        <div class="page-loader-face">L</div>
        <div class="page-loader-face">R</div>
        <div class="page-loader-face">T</div>
        <div class="page-loader-face">Bo</div>
      </div>
    </div>
    <div class="page-loader-text">Connecting Firebase...</div>
    `;
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
};// Initialize scroll reveal
export const initScrollReveal = () => {
  const candidateSelector = '.reveal, .card, .stat, .qc, .msg-wrap, .login-box, .edit-panel, .upload-bar, .ph, .sb-nav';
  const items = Array.from(document.querySelectorAll(candidateSelector));

  items.forEach(el => el.classList.add('reveal'));

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

// Initialize custom cursor with toggle
export const initCustomCursor = () => {
  // Skip on touch devices
  if ('ontouchstart' in window || window.matchMedia('(hover: none)').matches) return;
  
  if (document.getElementById('cursor-root')) return;
  
  const root = document.createElement('div');
  root.id = 'cursor-root';
  document.body.appendChild(root);
  
  const dot = document.createElement('img');
  dot.id = 'cursor-dot';
  dot.src = penSvg;
  dot.style.cssText = 'width:40px;height:40px;pointer-events:none;';
  
  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  ring.style.cssText = 'display:none;';
  
  root.append(dot, ring);
  
  let mx = 0, my = 0, rx = 0, ry = 0;
  const speed = 0.15;
  
  const loop = () => {
    rx += (mx - rx) * speed;
    ry += (my - ry) * speed;
    dot.style.left = (mx - 8) + 'px';
    dot.style.top = (my - 8) + 'px';
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  };
  loop();
  
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });
  
  const hoverSel = 'a, button, .btn, .nav-item, input, select, textarea, .card, .stat, .qc, .rt, .theme-toggle, .modal-x';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) {
      dot.style.width = '48px';
      dot.style.height = '48px';
      dot.style.left = (mx - 12) + 'px';
      dot.style.top = (my - 12) + 'px';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) {
      dot.style.width = '40px';
      dot.style.height = '40px';
      dot.style.left = (mx - 8) + 'px';
      dot.style.top = (my - 8) + 'px';
    }
  });
};

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const NOW = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const TODAY = () => new Date().toLocaleDateString('en-GB');
const ini = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmtSz = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const toB64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(f); });
const gradeOf = p => {
  if (p >= 75) return { g: 'A', cls: 'gA', e: '🏆' };
  if (p >= 60) return { g: 'B', cls: 'gB', e: '📘' };
  if (p >= 50) return { g: 'C', cls: 'gC', e: '📗' };
  if (p >= 35) return { g: 'D', cls: 'gD', e: '📙' };
  return { g: 'F', cls: 'gF', e: '📕' };
};
const mkCls = (got, max) => { const p = got / max; return p >= .7 ? 'mh' : p >= .4 ? 'mm' : 'ml'; };

/* Reducer removed — now using Firebase Firestore for state management */

/* ══════════════════════════════════════════════════════════════
   SMALL REUSABLES
══════════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null, frameId;
    const finalVal = parseInt(value, 10);
    if (isNaN(finalVal)) { setCount(value); return; }
    const animate = (time) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeProgress * finalVal));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);
  return <>{count}</>;
}

function Donut({ value = 0, color = 'var(--blue)', label = '', size = 128 }) {
  const r = 42, circ = 2 * Math.PI * r, pct = Math.min(100, Math.max(0, value)), dash = (pct / 100) * circ;
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 50); return () => clearTimeout(t); }, []);
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: size, height: size, borderRadius: '50%', animation: 'pulseGlow 3s infinite', position: 'relative' }}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--bdr)" strokeWidth="12" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={drawn ? circ - dash : circ}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          <text x="50" y="50" transform="rotate(90 50 50)" textAnchor="middle" fill="var(--t1)" fontSize="17" fontWeight="700" fontFamily="var(--font-m)"><AnimatedNumber value={Math.round(pct)} />%</text>
          <text x="50" y="65" transform="rotate(90 50 50)" textAnchor="middle" fill="var(--t3)" fontSize="9" fontFamily="var(--font-b)"><AnimatedNumber value={value} />/100</text>
        </svg>
      </div>
      <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-b)' }}>{label}</div>
    </div>
  );
}

function DropZone({ file, onChange, onRemove }) {
  const [drag, setDrag] = useState(false);
  if (file) return (
    <div className="fp">
      <span style={{ fontSize: 22 }}>{file.type === 'application/pdf' ? '📄' : '🖼️'}</span>
      <div className="fp-info"><div className="fp-name">{file.name}</div><div className="fp-size">{fmtSz(file.size)}</div></div>
      <button className="btn btn-danger btn-sm" onClick={onRemove}>✕ Remove</button>
    </div>
  );
  return (
    <div className={`dz${drag ? ' over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); e.dataTransfer.files[0] && onChange(e.dataTransfer.files[0]); }}>
      <input type="file" accept="image/*,.pdf" onChange={e => e.target.files[0] && onChange(e.target.files[0])} />
      <div className="dz-icon">📤</div>
      <div className="dz-text"><b>Click or drag</b> file here</div>
      <div className="dz-hint">PDF, JPG or PNG — handwritten or typed</div>
    </div>
  );
}

function QCard({ q, idx }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="qc">
      <div className="qc-h" onClick={() => setOpen(o => !o)}>
        <div><div className="qc-label">{q.questionText || `Question ${idx + 1}`}</div></div>
        <div className="flex fac gap">
          <span className={`mk ${mkCls(q.marksAwarded, q.maxMarks)}`}>{q.marksAwarded}/{q.maxMarks}</span>
          <span style={{ fontSize: 11, color: '#4a5878' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="qc-b">
          <div className="qc-lbl">Examiner Feedback</div>
          <div className="qc-text">{q.feedback}</div>
          <div className="sw2">
            <div className="sw-s"><div className="sw-lbl">✓ Strengths</div>{q.strengths}</div>
            <div className="sw-w"><div className="sw-lbl">⚠ Needs Improvement</div>{q.weaknesses}</div>
          </div>
          {q.suggestions && <div className="sug"><span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--blue)', fontWeight: 700, display: 'block', marginBottom: 4 }}>💡 Suggestions</span>{q.suggestions}</div>}
        </div>
      )}
    </div>
  );
}

function ExamView({ exam }) {
  const gi = gradeOf(exam.pct);
  return (
    <div>
      <div className="score-banner">
        <div className="sb-num">{exam.totalScore}<span className="sb-den">/{exam.maxScore}</span></div>
        <div className="sb-pct">{exam.pct}%</div>
        <div className={`sb-grade ${gi.cls}`}>{gi.e} Grade {gi.g}</div>
        <p className="sb-text">{exam.overallFeedback}</p>
      </div>
      <div className="card">
        <div className="card-h"><span className="card-ht">✦ Performance Scores</span></div>
        <div className="pie-row">
          <Donut value={exam.handwriting || 0} color="#a78bfa" label="Handwriting" />
          <Donut value={exam.presentation || 0} color="#3b9eff" label="Presentation" />
          <Donut value={exam.demonstration || 0} color="#22d07a" label="Demonstration" />
        </div>
      </div>
      <div className="mt12">{(exam.questions || []).map((q, i) => <QCard key={i} q={q} idx={i} />)}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PART-WISE MARK BUILDER COMPONENT
══════════════════════════════════════════════════════════════ */
function MarkBuilder({ parts, setParts }) {
  const total = parts.reduce((s, p) => s + p.questions.reduce((ss, q) => ss + Number(q.marks || 0), 0), 0);

  const addPart = () => setParts(ps => [...ps, {
    id: Date.now(), name: `Part ${String.fromCharCode(65 + ps.length)}`,
    questions: [{ id: Date.now() + 1, text: '', marks: '' }]
  }]);

  const delPart = pid => setParts(ps => ps.filter(p => p.id !== pid));
  const updPName = (pid, v) => setParts(ps => ps.map(p => p.id === pid ? { ...p, name: v } : p));

  const addQ = pid => setParts(ps => ps.map(p => p.id === pid ? { ...p, questions: [...p.questions, { id: Date.now(), text: '', marks: '' }] } : p));
  const delQ = (pid, qid) => setParts(ps => ps.map(p => p.id === pid ? { ...p, questions: p.questions.filter(q => q.id !== qid) } : p));
  const updQ = (pid, qid, f, v) => setParts(ps => ps.map(p => p.id === pid ? { ...p, questions: p.questions.map(q => q.id === qid ? { ...q, [f]: v } : q) } : p));

  const partTotal = p => p.questions.reduce((s, q) => s + Number(q.marks || 0), 0);

  return (
    <div className="card">
      <div className="card-h">
        <span className="card-ht">③ Part-wise Mark Allocation</span>
        <span className="total-chip">📊 Total: {total} marks</span>
      </div>
      <div className="card-b">
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 14, lineHeight: 1.6 }}>
          Add each <b style={{ color: 'var(--t2)' }}>Part / Section</b>, then add <b style={{ color: 'var(--t2)' }}>questions inside</b> with marks. AI will follow this exact scheme when grading.
        </p>

        <div className="part-list">
          {parts.map((part, pi) => (
            <div key={part.id} className="part-box">
              {/* Part Header */}
              <div className="part-head">
                <input
                  type="text" value={part.name}
                  onChange={e => updPName(part.id, e.target.value)}
                  placeholder="e.g. Part A / Section 1"
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--t1)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, outline: 'none', padding: 0 }}
                />
                <span className="part-marks-chip">{partTotal(part)} marks</span>
                {parts.length > 1 && (
                  <button onClick={() => delPart(part.id)}
                    style={{ background: '#2a0808', border: '1px solid #5a1010', color: 'var(--red)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                    ✕ Remove Part
                  </button>
                )}
              </div>

              {/* Questions inside this part */}
              <div className="part-body">
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 36px', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>Question / Description</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>Marks</div>
                  <div />
                </div>

                {part.questions.map((q, qi) => (
                  <div key={q.id} className="q-row">
                    <input type="text" value={q.text}
                      onChange={e => updQ(part.id, q.id, 'text', e.target.value)}
                      placeholder={`e.g. Explain photosynthesis (Q${qi + 1})`}
                      style={{ padding: '8px 10px', fontSize: 13 }} />
                    <input type="number" value={q.marks}
                      onChange={e => updQ(part.id, q.id, 'marks', e.target.value)}
                      min="0" placeholder="10"
                      style={{ padding: '8px 10px', fontSize: 13, textAlign: 'center' }} />
                    {part.questions.length > 1 ? (
                      <button onClick={() => delQ(part.id, q.id)}
                        style={{ background: '#2a0808', border: '1px solid #5a1010', color: 'var(--red)', borderRadius: 6, padding: '7px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✕
                      </button>
                    ) : <div />}
                  </div>
                ))}

                <button className="add-q-btn" onClick={() => addQ(part.id)}>
                  ＋ Add Question
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="add-part-btn" onClick={addPart}>
          ＋ Add Part / Section
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXAM ANALYSER
══════════════════════════════════════════════════════════════ */
function ExamAnalyser({ currentUser, users, onSave, subjects, subjectExams }) {
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
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const nvidiaApiKey = import.meta.env.VITE_NVIDIA_API_KEY || '';
  const kimiService = initializeKimiService(nvidiaApiKey);
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
      const qtxt = q.text ? (' "' + q.text + '"') : '';
      return '    Q' + (i + 1) + qtxt + ': ' + (q.marks || '?') + ' marks';
    }).join('\n');
    const ptotal = p.questions.reduce((s, q) => s + Number(q.marks || 0), 0);
    return '  ' + p.name + ' (' + ptotal + ' marks total):\n' + qs;
  }).join('\n') : '';

  const buildExam = r => ({
    id: Date.now(), studentId: Number(sid) || null, teacherId: currentUser.id,
    subject: subject || 'Exam', date: TODAY(),
    totalScore: r.totalMarksAwarded, maxScore: r.totalMarksAvailable,
    pct: r.percentage, handwriting: r.handwritingScore,
    presentation: r.presentationScore, demonstration: r.demonstrationScore,
    grade: gradeOf(r.percentage).g, overallFeedback: r.overallFeedback,
    questions: r.questions || [],
  });

  const run = async () => {
    if (!geminiApiKey.trim()) { setErrMsg('Gemini API key missing. Add VITE_GEMINI_API_KEY to your .env file and restart the dev server.'); return; }
    if (!script) { setErrMsg('Please upload the student answer script first.'); return; }
    if (!selectedSubjectId) { setErrMsg('Please select a subject.'); return; }
    setErrMsg(''); setSucMsg(''); setLoading(true); setProg(10); setResult(null); setSaved(false); setEditing(false);
    try {
      const contentParts = [];
      const hasScheme = parts.length > 0 && totalMarks > 0;
      
      // ========== STEP 1: Prepare prompt for Gemini (Final Scoring) ==========
      const geminiPrompt = `You are a strict but fair examiner. Carefully read and evaluate the student's answer script.

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
        contentParts.push({ text: 'ANSWER KEY / MARKING SCHEME:' });
        contentParts.push({ inline_data: { mime_type: keyFile.type, data: d } });
      }
      
      setProg(45);
      const sd = await toB64(script);
      contentParts.push({ text: 'STUDENT ANSWER SCRIPT:' });
      contentParts.push({ inline_data: { mime_type: script.type, data: sd } });
      contentParts.push({ text: geminiPrompt });

      // ========== STEP 2: Call Gemini for Final Scoring & Accuracy ==========
      console.log('📊 Calling Gemini 3 for final scoring and accuracy verification...');
      setProg(55);
      
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: contentParts }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 8192, responseMimeType: 'application/json' }
        })
      });
      
      setProg(75);
      const geminiData = await geminiRes.json();
      if (geminiData.error) throw new Error(geminiData.error.message || 'Gemini API error');
      
      const geminiTxt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const geminiResult = JSON.parse(geminiTxt.replace(/```json|```/g, '').trim());

      // ========== STEP 3: Enhance with Kimi K2.5 Feedback (if available) ==========
      let enhancedResult = JSON.parse(JSON.stringify(geminiResult));
      
      if (kimiService && geminiResult.questions && geminiResult.questions.length > 0) {
        console.log('💡 Enhancing feedback with Kimi K2.5...');
        setProg(80);
        
        // Enhance each question's feedback with more detailed explanations
        const enhancedQuestions = await Promise.all(
          geminiResult.questions.map(async (q) => {
            try {
              const kimiResult = await kimiService.generateFeedback(
                subject,
                q.feedback,
                q.questionText,
                q.marksAwarded,
                q.maxMarks
              );
              
              if (kimiResult.success) {
                return {
                  ...q,
                  detailedFeedback: kimiResult.feedback,
                  feedbackSource: 'kimi-k2.5',
                };
              }
              return q;
            } catch (e) {
              console.warn('⚠️ Kimi K2.5 enhancement failed for question:', e);
              return q;
            }
          })
        );
        
        enhancedResult.questions = enhancedQuestions;
        enhancedResult.evaluationMethod = 'Dual-Model: Gemini (Scoring) + Kimi K2.5 (Feedback)';
      } else {
        enhancedResult.evaluationMethod = 'Gemini (Complete Evaluation)';
      }

      setProg(90);
      setResult(enhancedResult);
      setEditR(JSON.parse(JSON.stringify(enhancedResult)));
      setProg(100);
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (e) { setErrMsg('AI evaluation failed. Check your files are clear and readable. ' + e.message); }
    finally { setLoading(false); }
  };

  const doUpload = (r) => {
    if (!sid) {
      setErrMsg('⚠ Please select a student from the dropdown before uploading.');
      setSucMsg('');
      return;
    }
    onSave(buildExam(r));
    setSaved(true); setEditing(false);
    setSucMsg('✅ Result uploaded successfully to the student\'s dashboard!');
    setErrMsg('');
  };

  const recalc = qs => {
    const tot = qs.reduce((s, q) => s + Number(q.marksAwarded || 0), 0);
    const mx = qs.reduce((s, q) => s + Number(q.maxMarks || 0), 0) || editR.totalMarksAvailable;
    return { ...editR, questions: qs, totalMarksAwarded: tot, totalMarksAvailable: mx, percentage: Math.round((tot / mx) * 100) };
  };

  return (
    <div>
      <div className="ph">
        <h2>Exam Script Analyser</h2>
        <p>Select subject & exam → upload files → AI grades → review → upload to student</p>
      </div>

      {/* ① Info + ② Files */}
      <div className="g2">
        <div className="card">
          <div className="card-h"><span className="card-ht">① Exam Info</span></div>
          <div className="card-b">
            <div className="field">
              <label className="fl">Student</label>
              <select value={sid} onChange={e => { setSid(e.target.value); setErrMsg(''); setSucMsg(''); }}>
                <option value="">— Select student —</option>
                {myStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {myStudents.length === 0 && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 5 }}>No students assigned to you yet.</div>}
            </div>
            <div className="field">
              <label className="fl">Subject</label>
              <select value={selectedSubjectId} onChange={e => { setSelectedSubjectId(e.target.value); setSelectedExamId(''); }}>
                <option value="">— Select subject —</option>
                {subjects.filter(s => String(s.createdBy) === String(currentUser.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="fl">Exam (optional — includes mark allocation)</label>
              <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} disabled={!selectedSubjectId}>
                <option value="">— No specific exam —</option>
                {filteredExams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="fl">Grading Style</label>
              <select value={gstyle} onChange={e => setGstyle(e.target.value)}>
                <option value="strict">Strict — exact answers only</option>
                <option value="balanced">Balanced — standard marking</option>
                <option value="lenient">Lenient — reward partial answers</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><span className="card-ht">② Upload Files</span></div>
          <div className="card-b">
            <div className="field">
              <label className="fl">Answer Key / Marking Scheme (optional)</label>
              <DropZone file={keyFile} onChange={setKeyFile} onRemove={() => setKeyFile(null)} />
            </div>
            <div className="field mt12">
              <label className="fl">Student Answer Script ✱ Required</label>
              <DropZone file={script} onChange={setScript} onRemove={() => setScript(null)} />
            </div>
          </div>
        </div>
      </div>

      {/* ③ Mark allocation preview (read-only, if exam selected) */}
      {selectedExam && parts.length > 0 && (
        <div className="card">
          <div className="card-h">
            <span className="card-ht">③ Mark Allocation (from {selectedExam.name})</span>
            <span className="total-chip">📊 Total: {totalMarks} marks</span>
          </div>
          <div className="card-b">
            {parts.map((part, pi) => (
              <div key={pi} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{part.name} <span className="part-marks-chip">{part.questions.reduce((s, q) => s + Number(q.marks || 0), 0)} marks</span></div>
                {part.questions.map((q, qi) => (
                  <div key={qi} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--t2)', padding: '4px 0 4px 16px' }}>
                    <span style={{ color: 'var(--t3)' }}>Q{qi + 1}</span>
                    <span style={{ flex: 1 }}>{q.text || '—'}</span>
                    <span style={{ fontFamily: 'var(--font-m)', fontWeight: 700, color: 'var(--blue)' }}>{q.marks} marks</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyse button */}
      {errMsg && !result && <div className="error-banner mt12">{errMsg}</div>}
      {loading && <div className="prog mt12"><div className="prog-lbl">AI evaluating… {prog}%</div><div className="prog-track"><div className="prog-fill" style={{ width: `${prog}%` }} /></div></div>}

      <button className="btn btn-blue btn-lg"
        style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
        onClick={run} disabled={loading || !script || !selectedSubjectId}>
        {loading
          ? <><span className="spin" />AI Evaluating…</>
          : <>✦ Analyse &amp; Grade Script{totalMarks > 0 ? ` (${totalMarks} marks)` : ''}</>}
      </button>

      {/* ─── RESULTS ─── */}
      {result && (
        <div ref={ref} className="mt20">
          {errMsg && <div className="error-banner">{errMsg}</div>}
          {sucMsg && (
            <div className="success-banner">
              <span style={{ fontSize: 24 }}>✅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{sucMsg}</div>
                <div style={{ fontSize: 12, color: '#5dba6a', marginTop: 2 }}>Student can now see this result in their dashboard under "My Results".</div>
              </div>
            </div>
          )}
          {!saved && (
            <div className="upload-bar">
              <div>
                <div className="upload-bar-title">✦ AI Evaluation Complete</div>
                <div className="upload-bar-sub">Review the result below. Edit marks if needed, then upload to student.</div>
              </div>
              <div className="flex fac gap" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={() => { setEditing(e => !e); setEditR(JSON.parse(JSON.stringify(result))); }} style={{ borderColor: editing ? 'var(--blue)' : '', color: editing ? 'var(--blue)' : '' }}>
                  ✏️ {editing ? 'Close Editor' : 'Edit Marks'}
                </button>
                <button className="btn btn-blue" onClick={() => doUpload(editing ? editR : result)}>📤 Upload to Student</button>
              </div>
            </div>
          )}
          {editing && editR && !saved && (
            <div className="edit-panel">
              <div className="edit-panel-h">
                <span className="edit-panel-ht">✏️ Adjust Marks — changes update the total automatically</span>
                <button className="btn btn-blue btn-sm" onClick={() => doUpload(editR)}>📤 Upload Edited Result</button>
              </div>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>Question</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>Awarded</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>Max</div>
                </div>
                {editR.questions.map((q, i) => (
                  <div key={i} className="edit-q-row">
                    <div className="edit-q-name">{q.questionText || `Q${i + 1}`}</div>
                    <input type="number" min="0" max={q.maxMarks} value={q.marksAwarded}
                      onChange={e => { const qs = editR.questions.map((qq, ii) => ii === i ? { ...qq, marksAwarded: Number(e.target.value) } : qq); setEditR(recalc(qs)); }}
                      style={{ padding: '7px 10px', fontSize: 13, borderColor: 'var(--blue)' }} />
                    <input type="number" min="1" value={q.maxMarks}
                      onChange={e => { const qs = editR.questions.map((qq, ii) => ii === i ? { ...qq, maxMarks: Number(e.target.value) } : qq); setEditR(recalc(qs)); }}
                      style={{ padding: '7px 10px', fontSize: 13 }} />
                  </div>
                ))}
                <div className="edit-total">
                  <span style={{ fontSize: 14 }}><b style={{ color: 'var(--blue)' }}>{editR.totalMarksAwarded}</b> <span style={{ color: 'var(--t3)' }}>/ {editR.totalMarksAvailable} marks</span></span>
                  <span style={{ fontSize: 14 }}><b style={{ color: 'var(--gold)' }}>{editR.percentage}%</b> <span style={{ color: 'var(--t3)' }}>· Grade {gradeOf(editR.percentage).g}</span></span>
                </div>
              </div>
            </div>
          )}
          <ExamView exam={{
            totalScore: result.totalMarksAwarded, maxScore: result.totalMarksAvailable,
            pct: result.percentage, handwriting: result.handwritingScore,
            presentation: result.presentationScore, demonstration: result.demonstrationScore,
            overallFeedback: result.overallFeedback, questions: result.questions || []
          }} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MESSAGING
══════════════════════════════════════════════════════════════ */
function Messaging({ currentUser, users, messages, onSend }) {
  const [active, setActive] = useState(null);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  const contacts = users.filter(u => {
    if (u.id === currentUser.id) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'teacher') return u.role === 'admin' || (u.role === 'student' && u.teacherId === currentUser.id);
    if (currentUser.role === 'student') return u.role === 'teacher' && u.id === currentUser.teacherId;
    return false;
  });
  const thread = active ? messages.filter(m => (m.from === currentUser.id && m.to === active) || (m.from === active && m.to === currentUser.id)) : [];
  const lastMsg = id => { const ms = messages.filter(m => (m.from === currentUser.id && m.to === id) || (m.from === id && m.to === currentUser.id)); return ms[ms.length - 1]; };
  const unread = id => messages.filter(m => m.from === id && m.to === currentUser.id && !m.read).length;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread.length, active]);

  const send = () => {
    if (!text.trim() || !active) return;
    onSend({ id: Date.now(), from: currentUser.id, to: active, text: text.trim(), time: NOW(), read: false });
    setText('');
  };

  return (
    <div>
      <div className="ph"><h2>Messages</h2><p>Communicate with your contacts</p></div>
      <div className="msg-wrap">
        <div className="msg-list">
          <div className="msg-list-hd">Contacts ({contacts.length})</div>
          {contacts.length === 0 && <div className="empty">No contacts available</div>}
          {contacts.map(c => {
            const lm = lastMsg(c.id), u = unread(c.id);
            return (
              <div key={c.id} className={`msg-contact${active === c.id ? ' active' : ''}`} onClick={() => setActive(c.id)}>
                <div className="flex fjb fac gap">
                  <div style={{ minWidth: 0 }}>
                    <div className="msg-cname">{c.name} <span className={`badge bg-${c.role}`}>{c.role}</span></div>
                    <div className="msg-cprev">{lm ? lm.text : 'Say hello!'}</div>
                  </div>
                  {u > 0 && <div className="msg-udot" />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="msg-main">
          {!active
            ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>Select a contact to start chatting</div>
            : (
              <>
                <div className="msg-mhd">
                  {(() => { const c = users.find(u => u.id === active); return c ? <><b>{c.name}</b> <span className={`badge bg-${c.role}`}>{c.role}</span></> : null; })()}
                </div>
                <div className="msg-body">
                  {thread.length === 0 && <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 13, marginTop: 20 }}>No messages yet.</div>}
                  {thread.map(m => (
                    <div key={m.id} className={`bubble ${m.from === currentUser.id ? 'bm' : 'bt'}`}>
                      {m.text}<div className="bubble-time">{m.time}</div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <div className="msg-compose">
                  <textarea className="msg-input" rows={2} placeholder="Type a message… (Enter to send)"
                    value={text} onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
                  <button className="btn btn-blue" onClick={send} disabled={!text.trim()}>Send</button>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════════════ */
function AdminDash({ currentUser, appState, dispatch }) {
  const { users, messages, exams } = appState;
  const [tab, setTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', username: '', password: 'pass123', subject: '', teacherId: '' });
  const [formErr, setFormErr] = useState('');
  const [bcast, setBcast] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  const unread = messages.filter(m => m.to === currentUser.id && !m.read).length;

  const addUser = async (role) => {
    if (!form.name.trim() || !form.username.trim()) { setFormErr('Name and username are required.'); return; }
    if (users.find(u => u.username === form.username)) { setFormErr('Username already taken.'); return; }
    const nu = { id: Date.now(), role, name: form.name, username: form.username, password: form.password || 'pass123', avatar: ini(form.name) };
    if (role === 'teacher' && form.subject) nu.subject = form.subject;
    if (role === 'student' && form.teacherId) nu.teacherId = Number(form.teacherId);
    try { await fbAddUser(nu); } catch (e) { setFormErr('Error adding user: ' + e.message); return; }
    setModal(null); setForm({ name: '', username: '', password: 'pass123', subject: '', teacherId: '' }); setFormErr('');
  };
  const editUser = async () => {
    if (!form.name.trim() || !form.username.trim()) { setFormErr('Name and username are required.'); return; }
    if (users.find(u => u.username === form.username && u.id !== form.id)) { setFormErr('Username already taken by someone else.'); return; }
    const updObj = { ...users.find(u => u.id === form.id), name: form.name, username: form.username, password: form.password };
    if (updObj.role === 'teacher') updObj.subject = form.subject || '';
    if (updObj.role === 'student') updObj.teacherId = Number(form.teacherId) || null;
    try { await fbUpdateUser(updObj, currentUser); } catch (e) { setFormErr('Error updating user: ' + e.message); return; }
    setModal(null); setForm({ name: '', username: '', password: 'pass123', subject: '', teacherId: '' }); setFormErr('');
  };
  const broadcast = async () => {
    if (!bcast.trim()) return;
    for (const u of users.filter(u => u.id !== currentUser.id)) {
      await fbAddMessage({ id: Date.now() + u.id, from: currentUser.id, to: u.id, text: bcast, time: NOW(), read: false });
    }
    setBcast('');
  };

  const nav = [['overview', '🏠', 'Overview'], ['users', '👥', 'Users'], ['exams', '📝', 'All Exams'], ['messages', '💬', 'Messages']];
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="shell">
      <button className="mobile-sidebar-toggle" onClick={() => setMobileMenuOpen(o => !o)} type="button">{mobileMenuOpen ? '✕' : '☰'}</button>
      <div className={`sidebar-backdrop ${mobileMenuOpen ? 'visible' : ''}`} onClick={closeMobileMenu} />
      <div className={`sidebar ${mobileMenuOpen ? 'open' : 'closed'}`}>
        <div className="sb-brand"><div className="sb-brand-name">Gradify</div><div className="sb-brand-role role-c-admin">Admin Panel</div></div>
        <div className="sb-user"><div className="av av-admin">{ini(currentUser.name)}</div><div><div className="sb-uname">{currentUser.name}</div><div className="sb-usub">Administrator</div></div></div>
        <div className="sb-nav">
          {nav.map(([k, ic, l]) => (
            <div key={k} className={`nav-item na${tab === k ? ' on' : ''}`} onClick={() => { setTab(k); closeMobileMenu(); }}>
              <span className="nav-ic">{ic}</span>{l}
              {k === 'messages' && unread > 0 && <span className="nav-badge" style={{ background: 'var(--gold)', color: '#0a0c10' }}>{unread}</span>}
            </div>
          ))}
        </div>
        <div className="sb-foot"><button className="logout" onClick={() => { signOutUser(); dispatch({ type: 'LOGOUT' }); }}>🚪 Sign Out</button></div>
      </div>
      <div className="content">
        <div className="pad">

          {tab === 'overview' && (
            <div>
              <div className="ph"><h2>Admin Overview</h2><p>Full system at a glance</p></div>
              <div className="stats">
                <div className="stat"><div className="stat-i">👥</div><div className="stat-v" style={{ color: 'var(--blue)' }}>{teachers.length}</div><div className="stat-l">Teachers</div></div>
                <div className="stat"><div className="stat-i">🎓</div><div className="stat-v" style={{ color: 'var(--green)' }}>{students.length}</div><div className="stat-l">Students</div></div>
                <div className="stat"><div className="stat-i">📝</div><div className="stat-v" style={{ color: 'var(--purple)' }}>{exams.length}</div><div className="stat-l">Exams Graded</div></div>
                <div className="stat"><div className="stat-i">💬</div><div className="stat-v" style={{ color: 'var(--gold)' }}>{messages.length}</div><div className="stat-l">Messages</div></div>
              </div>
              <div className="g2">
                <div className="card">
                  <div className="card-h"><span className="card-ht">📢 Broadcast to All</span></div>
                  <div className="card-b">
                    <textarea style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--t1)', fontFamily: 'Inter,sans-serif', fontSize: 13, padding: '10px 12px', outline: 'none', resize: 'vertical' }} rows={3} placeholder="Message everyone…" value={bcast} onChange={e => setBcast(e.target.value)} />
                    <button className="btn btn-gold mt8" onClick={broadcast} disabled={!bcast.trim()}>📢 Broadcast</button>
                  </div>
                </div>
                <div className="card">
                  <div className="card-h"><span className="card-ht">Recent Results</span></div>
                  <div className="card-b">
                    {exams.length === 0 ? <div className="empty">No exams yet</div> : exams.slice(-3).reverse().map(e => {
                      const st = users.find(u => u.id === e.studentId);
                      return <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--bdr)' }}>
                        <div><div style={{ fontSize: 13, fontWeight: 500 }}>{st?.name || 'Unknown'}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{e.subject}·{e.date}</div></div>
                        <span className={`badge ${e.pct >= 60 ? 'bg-green' : 'bg-gold'}`}>{e.pct}% {e.grade}</span>
                      </div>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div>
              <div className="ph"><h2>User Management</h2><p>Add and manage all users</p></div>
              <div className="flex gap" style={{ marginBottom: 16 }}>
                <button className="btn btn-blue" onClick={() => { setModal('teacher'); setForm({ name: '', username: '', password: 'pass123', subject: '', teacherId: '' }); }}>＋ Add Teacher</button>
                <button className="btn btn-green" onClick={() => { setModal('student'); setForm({ name: '', username: '', password: 'pass123', subject: '', teacherId: '' }); }}>＋ Add Student</button>
              </div>
              <div className="card">
                {users.filter(u => u.role !== 'admin').length === 0 ? <div className="empty">No users yet</div> : (
                  <table className="tbl">
                    <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Details</th><th></th></tr></thead>
                    <tbody>
                      {users.filter(u => u.role !== 'admin').map(u => (
                        <tr key={u.id}>
                          <td><b>{u.name}</b></td>
                          <td style={{ color: 'var(--t3)' }}>@{u.username}</td>
                          <td><span className={`badge bg-${u.role}`}>{u.role}</span></td>
                          <td style={{ fontSize: 11, color: 'var(--t3)' }}>{u.role === 'teacher' ? u.subject || '—' : u.role === 'student' ? `Teacher: ${users.find(t => t.id === u.teacherId)?.name || 'None'}` : '—'}</td>
                          <td>{confirmId === u.id ? (<span className="flex fac gap"><span style={{ fontSize: 12, color: 'var(--red)' }}>Sure?</span><button className="btn btn-danger btn-sm" onClick={() => { fbRemoveUser(u.id); setConfirmId(null); }}>Yes</button><button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>No</button></span>) : (<span className="flex fac gap"><button className="btn btn-ghost btn-sm" onClick={() => { setForm({ id: u.id, role: u.role, name: u.name || '', username: u.username || '', password: u.password || '', subject: u.subject || '', teacherId: u.teacherId || '' }); setModal('edit'); }}>✏️ Edit</button><button className="btn btn-danger btn-sm" onClick={() => setConfirmId(u.id)}>Remove</button></span>)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab === 'exams' && (
            <div>
              <div className="ph"><h2>All Exam Results</h2><p>Every graded script</p></div>
              {exams.length === 0 ? <div className="card"><div className="empty">No exams graded yet</div></div> : exams.map(e => {
                const st = users.find(u => u.id === e.studentId), tc = users.find(u => u.id === e.teacherId);
                return <div key={e.id} className="card">
                  <div className="card-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span className="card-ht">{e.subject} — {st?.name || 'Unknown'}</span>
                      <span className={`badge ${e.pct >= 60 ? 'bg-green' : 'bg-gold'}`} style={{ marginLeft: 12 }}>Grade {e.grade} · {e.pct}%</span>
                    </div>
                    {confirmId === `exam-${e.id}` ? (
                      <span className="flex fac gap">
                        <span style={{ fontSize: 12, color: 'var(--red)' }}>Sure?</span>
                        <button className="btn btn-danger btn-sm" onClick={() => { fbRemoveExam(e.id); setConfirmId(null); }}>Yes</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>No</button>
                      </span>
                    ) : (
                      <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setConfirmId(`exam-${e.id}`)}>🗑️ Delete</button>
                    )}
                  </div>
                  <div className="card-b">
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 12 }}>Teacher: {tc?.name} · {e.date}</div>
                    <ExamView exam={e} />
                  </div>
                </div>;
              })}
            </div>
          )}

          {tab === 'messages' && <Messaging currentUser={currentUser} users={users} messages={messages} onSend={m => fbAddMessage(m)} />}
        </div>
      </div>

      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-h"><span className="modal-ht">{modal === 'edit' ? 'Edit User' : `Add ${modal === 'teacher' ? 'Teacher' : 'Student'}`}</span><button className="modal-x" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-b">
              <div className="field"><label className="fl">Full Name</label><input type="text" placeholder="e.g. Mrs. Meena" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="g2">
                <div className="field"><label className="fl">Username</label><input type="text" placeholder="unique_username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                <div className="field"><label className="fl">Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
              </div>
              {(modal === 'teacher' || form.role === 'teacher') && <div className="field"><label className="fl">Subject</label><input type="text" placeholder="e.g. Chemistry" value={form.subject || ''} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>}
              {(modal === 'student' || form.role === 'student') && <div className="field"><label className="fl">Assign Teacher</label>
                <select value={form.teacherId || ''} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}>
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>}
              {formErr && <div className="error-banner mt8" style={{ borderRadius: 8, padding: '10px 14px' }}>{formErr}</div>}
            </div>
            <div className="modal-f">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              {modal === 'edit' ? (
                <button className="btn btn-blue" onClick={editUser}>Save Changes</button>
              ) : (
                <button className={`btn btn-${modal === 'teacher' ? 'blue' : 'green'}`} onClick={() => addUser(modal)}>Add {modal === 'teacher' ? 'Teacher' : 'Student'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TEACHER DASHBOARD
══════════════════════════════════════════════════════════════ */
function TeacherDash({ currentUser, appState, dispatch }) {
  const { users, messages, exams, subjects, subjectExams } = appState;
  const [tab, setTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: 'pass123' });
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
  const [examParts, setExamParts] = useState([
    { id: Date.now(), name: 'Part A', questions: [{ id: Date.now() + 1, text: '', marks: '' }] }
  ]);
  const [confirmDelId, setConfirmDelId] = useState(null);

  // Graded results editing state
  const [editingExamId, setEditingExamId] = useState(null);
  const [editExamData, setEditExamData] = useState(null);
  const [resultMsg, setResultMsg] = useState('');

  const addStudent = async () => {
    if (!form.name.trim() || !form.username.trim()) { setFormErr('Name and username required.'); return; }
    if (users.find(u => u.username === form.username)) { setFormErr('Username taken.'); return; }
    try { await fbAddUser({ id: Date.now(), role: 'student', name: form.name, username: form.username, password: form.password || 'pass123', avatar: ini(form.name), teacherId: currentUser.id }); } catch (e) { setFormErr('Error: ' + e.message); return; }
    setModal(false); setForm({ name: '', username: '', password: 'pass123' }); setFormErr('');
  };

  const handleAddSubject = async () => {
    if (!subjectName.trim()) return;
    await fbAddSubject({ id: Date.now(), name: subjectName.trim(), createdBy: currentUser.id });
    setSubjectName('');
  };

  const handleAddExam = async (subjectId) => {
    if (!examName.trim()) return;
    await fbAddSubjectExam({ id: Date.now(), subjectId, name: examName.trim(), parts: examParts, createdBy: currentUser.id });
    setExamName('');
    setExamParts([{ id: Date.now(), name: 'Part A', questions: [{ id: Date.now() + 1, text: '', marks: '' }] }]);
    setAddingExamForSubject(null);
  };

  const startEditExam = (exam) => {
    setEditingExamId(exam.id);
    setEditExamData(JSON.parse(JSON.stringify(exam)));
    setResultMsg('');
  };
  const cancelEditExam = () => { setEditingExamId(null); setEditExamData(null); setResultMsg(''); };
  const saveEditExam = async () => {
    if (!editExamData) return;
    const updated = { ...editExamData, grade: gradeOf(editExamData.pct).g };
    try {
      await fbUpdateExam(updated);
      setResultMsg('✅ Result updated and re-uploaded to student!');
      setEditingExamId(null); setEditExamData(null);
    } catch (e) { setResultMsg('❌ Error: ' + e.message); }
  };
  const updateEditQ = (qi, field, val) => {
    setEditExamData(prev => {
      const qs = prev.questions.map((q, i) => i === qi ? { ...q, [field]: field === 'marksAwarded' || field === 'maxMarks' ? Number(val) : val } : q);
      const tot = qs.reduce((s, q) => s + Number(q.marksAwarded || 0), 0);
      const mx = qs.reduce((s, q) => s + Number(q.maxMarks || 0), 0) || prev.maxScore;
      return { ...prev, questions: qs, totalScore: tot, maxScore: mx, pct: Math.round((tot / mx) * 100) };
    });
  };

  const nav = [['overview', '🏠', 'Overview'], ['subjects', '📚', 'Subjects & Exams'], ['students', '👥', 'My Students'], ['analyser', '🔬', 'Exam Analyser'], ['results', '📊', 'Graded Results'], ['messages', '💬', 'Messages']];
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="shell">
      <button className="mobile-sidebar-toggle" onClick={() => setMobileMenuOpen(o => !o)} type="button">{mobileMenuOpen ? '✕' : '☰'}</button>
      <div className={`sidebar-backdrop ${mobileMenuOpen ? 'visible' : ''}`} onClick={closeMobileMenu} />
      <div className={`sidebar ${mobileMenuOpen ? 'open' : 'closed'}`}>
        <div className="sb-brand"><img src="/logo.png" alt="Gradify" style={{ height: 32, objectFit: 'contain', marginBottom: 4 }} onError={e => e.target.style.display='none'} /><div className="sb-brand-name">Gradify</div><div className="sb-brand-role role-c-teacher">Teacher Portal</div></div>
        <div className="sb-user"><div className="av av-teacher">{ini(currentUser.name)}</div><div><div className="sb-uname">{currentUser.name}</div><div className="sb-usub">{currentUser.subject || 'Teacher'}</div></div></div>
        <div className="sb-nav">
          {nav.map(([k, ic, l]) => (
            <div key={k} className={`nav-item nt${tab === k ? ' on' : ''}`} onClick={() => { setTab(k); closeMobileMenu(); }}>
              <span className="nav-ic">{ic}</span>{l}
              {k === 'messages' && unread > 0 && <span className="nav-badge" style={{ background: 'var(--blue)', color: '#fff' }}>{unread}</span>}
            </div>
          ))}
        </div>
        <div className="sb-foot"><button className="logout" onClick={() => { signOutUser(); dispatch({ type: 'LOGOUT' }); }}>🚪 Sign Out</button></div>
      </div>
      <div className="content">
        <div className="pad">

          {tab === 'overview' && (
            <div>
              <div className="ph"><h2>Welcome back, {currentUser.name}!</h2><p>Ready to inspire today? Manage your exams, grading, and analyze performance.</p></div>
              <div className="stats">
                <div className="stat"><div className="stat-i">👥</div><div className="stat-v" style={{ color: 'var(--green)' }}><AnimatedNumber value={myStudents.length} /></div><div className="stat-l">My Students</div></div>
                <div className="stat"><div className="stat-i">📝</div><div className="stat-v" style={{ color: 'var(--purple)' }}><AnimatedNumber value={myExams.length} /></div><div className="stat-l">Exams Graded</div></div>
                <div className="stat"><div className="stat-i">📈</div><div className="stat-v" style={{ color: 'var(--gold)' }}><AnimatedNumber value={avgPct} />%</div><div className="stat-l">Class Avg</div></div>
                <div className="stat"><div className="stat-i">💬</div><div className="stat-v" style={{ color: 'var(--blue)' }}><AnimatedNumber value={unread} /></div><div className="stat-l">Unread</div></div>
              </div>
              <div className="g2">
                <div className="card">
                  <div className="card-h"><span className="card-ht">Recent Results</span></div>
                  <div className="card-b">
                    {myExams.length === 0 ? <div className="empty">No exams graded yet</div> : myExams.slice(-4).reverse().map((e, idx) => {
                      const st = users.find(u => u.id === e.studentId);
                      return <div key={e.id} className="recent-exam-row" style={{ animationDelay: `${0.15 * (idx + 1)}s`, padding: '12px 0', borderBottom: '1px solid var(--bdr)' }}>
                        <div><div style={{ fontSize: 13, fontWeight: 500 }}>{st?.name || '—'}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{e.subject}</div></div>
                        <span className={`badge ${e.pct >= 60 ? 'bg-green' : 'bg-gold'}`}>Grade {e.grade}</span>
                      </div>;
                    })}
                  </div>
                </div>
                <div className="card">
                  <div className="card-h"><span className="card-ht">My Students</span></div>
                  <div className="card-b">
                    {myStudents.length === 0 ? <div className="empty">No students yet</div> : myStudents.map((s, idx) => {
                      const last = myExams.filter(e => e.studentId === s.id).slice(-1)[0];
                      return <div key={s.id} className="recent-exam-row" style={{ animationDelay: `${0.15 * (idx + 1)}s`, padding: '12px 0', borderBottom: '1px solid var(--bdr)' }}>
                        <div className="flex fac gap"><div className="av av-student" style={{ width: 28, height: 28, fontSize: 11 }}>{ini(s.name)}</div><span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span></div>
                        {last ? <span className="badge bg-green">{last.pct}%</span> : <span style={{ fontSize: 11, color: 'var(--t3)' }}>No exam</span>}
                      </div>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'subjects' && (
            <div>
              <div className="ph"><h2>Subjects & Exams</h2><p>Create subjects and set up exams with mark allocation</p></div>

              {/* Add Subject */}
              <div className="card">
                <div className="card-h"><span className="card-ht">＋ Add Subject</span></div>
                <div className="card-b">
                  <div className="flex fac gap">
                    <input type="text" placeholder="e.g. Mathematics, Biology, Physics…" value={subjectName} onChange={e => setSubjectName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSubject()} style={{ flex: 1 }} />
                    <button className="btn btn-blue" onClick={handleAddSubject} disabled={!subjectName.trim()}>Add Subject</button>
                  </div>
                </div>
              </div>

              {/* Subject List */}
              {mySubjects.length === 0 ? (
                <div className="card"><div className="empty">No subjects yet. Add your first subject above!</div></div>
              ) : mySubjects.map(sub => {
                const subExams = subjectExams.filter(e => String(e.subjectId) === String(sub.id));
                return (
                  <div key={sub.id} className="card">
                    <div className="card-h">
                      <span className="card-ht">📚 {sub.name}</span>
                      <div className="flex fac gap">
                        <span className="badge bg-purple">{subExams.length} exam{subExams.length !== 1 ? 's' : ''}</span>
                        {confirmDelId === `sub-${sub.id}` ? (
                          <span className="flex fac gap">
                            <span style={{ fontSize: 12, color: 'var(--red)' }}>Delete?</span>
                            <button className="btn btn-danger btn-sm" onClick={() => { fbRemoveSubject(sub.id); subExams.forEach(e => fbRemoveSubjectExam(e.id)); setConfirmDelId(null); }}>Yes</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelId(null)}>No</button>
                          </span>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelId(`sub-${sub.id}`)}>🗑️</button>
                        )}
                      </div>
                    </div>
                    <div className="card-b">
                      {/* Existing exams */}
                      {subExams.length === 0 && addingExamForSubject !== sub.id && (
                        <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 12 }}>No exams created for this subject yet.</div>
                      )}
                      {subExams.map(ex => {
                        const exTotal = (ex.parts || []).reduce((s, p) => s + p.questions.reduce((ss, q) => ss + Number(q.marks || 0), 0), 0);
                        return (
                          <div key={ex.id} style={{ background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
                            <div className="flex fjb fac">
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>📝 {ex.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{(ex.parts || []).length} part(s) · {exTotal} total marks</div>
                              </div>
                              {confirmDelId === `exam-${ex.id}` ? (
                                <span className="flex fac gap">
                                  <button className="btn btn-danger btn-sm" onClick={() => { fbRemoveSubjectExam(ex.id); setConfirmDelId(null); }}>Yes</button>
                                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelId(null)}>No</button>
                                </span>
                              ) : (
                                <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setConfirmDelId(`exam-${ex.id}`)}>🗑️</button>
                              )}
                            </div>
                            {/* Show parts summary */}
                            {(ex.parts || []).map((p, pi) => (
                              <div key={pi} style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6, paddingLeft: 8 }}>
                                <b>{p.name}</b>: {p.questions.map((q, qi) => `Q${qi + 1}(${q.marks || '?'}m)`).join(', ')}
                              </div>
                            ))}
                          </div>
                        );
                      })}

                      {/* Add Exam form */}
                      {addingExamForSubject === sub.id ? (
                        <div style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', borderRadius: 12, padding: 16, marginTop: 8 }}>
                          <div className="field">
                            <label className="fl">Exam Name</label>
                            <input type="text" placeholder="e.g. Mid-term, Unit Test 1…" value={examName} onChange={e => setExamName(e.target.value)} />
                          </div>
                          <MarkBuilder parts={examParts} setParts={setExamParts} />
                          <div className="flex fac gap mt12">
                            <button className="btn btn-blue" onClick={() => handleAddExam(sub.id)} disabled={!examName.trim()}>✦ Save Exam</button>
                            <button className="btn btn-ghost" onClick={() => { setAddingExamForSubject(null); setExamName(''); }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button className="add-part-btn" onClick={() => { setAddingExamForSubject(sub.id); setExamName(''); setExamParts([{ id: Date.now(), name: 'Part A', questions: [{ id: Date.now() + 1, text: '', marks: '' }] }]); }}>
                          ＋ Add Exam to {sub.name}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'students' && (
            <div>
              <div className="ph"><h2>My Students</h2><p>Manage your assigned students</p></div>
              <button className="btn btn-blue" style={{ marginBottom: 16 }} onClick={() => { setModal(true); setForm({ name: '', username: '', password: 'pass123' }); }}>＋ Add Student</button>
              <div className="card">
                {myStudents.length === 0 ? <div className="empty">No students. Add your first student!</div> : (
                  <table className="tbl">
                    <thead><tr><th>Student</th><th>Username</th><th>Last Exam</th><th>Score</th><th>Grade</th></tr></thead>
                    <tbody>
                      {myStudents.map(s => {
                        const exs = myExams.filter(e => e.studentId === s.id), last = exs.slice(-1)[0];
                        return <tr key={s.id}><td><b>{s.name}</b></td><td style={{ color: 'var(--t3)' }}>@{s.username}</td><td style={{ fontSize: 12 }}>{last ? last.subject : '—'}</td><td>{last ? `${last.totalScore}/${last.maxScore}` : '—'}</td><td>{last ? <span className={`badge ${last.pct >= 60 ? 'bg-green' : 'bg-gold'}`}>Grade {last.grade}</span> : '—'}</td></tr>;
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab === 'analyser' && <ExamAnalyser currentUser={currentUser} users={users} onSave={e => fbAddExam(e)} subjects={subjects} subjectExams={subjectExams} />}

          {tab === 'results' && (
            <div>
              <div className="ph"><h2>Graded Results</h2><p>View, edit, and re-upload exam results to students</p></div>
              {resultMsg && <div className={resultMsg.startsWith('✅') ? 'success-banner' : 'error-banner'} style={{ marginBottom: 16 }}>{resultMsg.startsWith('✅') && <span style={{ fontSize: 20, marginRight: 8 }}>✅</span>}{resultMsg}</div>}
              {myExams.length === 0 ? <div className="card"><div className="empty">No graded results yet. Use the Exam Analyser to grade scripts.</div></div> : myExams.slice().reverse().map(exam => {
                const st = users.find(u => u.id === exam.studentId);
                const isEditing = editingExamId === exam.id;
                const ed = isEditing ? editExamData : exam;
                const gi = gradeOf(ed.pct);
                return (
                  <div key={exam.id} className="card">
                    <div className="card-h">
                      <div>
                        <span className="card-ht">{exam.subject}</span>
                        <span className={`badge ${exam.pct >= 60 ? 'bg-green' : 'bg-gold'}`} style={{ marginLeft: 12 }}>Grade {exam.grade} · {exam.pct}%</span>
                      </div>
                      <div className="flex fac gap">
                        <span style={{ fontSize: 12, color: 'var(--t3)' }}>{st?.name || 'Unknown'} · {exam.date}</span>
                        {!isEditing ? (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => startEditExam(exam)}>✏️ Edit</button>
                            {confirmDelId === `res-${exam.id}` ? (
                              <span className="flex fac gap">
                                <button className="btn btn-danger btn-sm" onClick={() => { fbRemoveExam(exam.id); setConfirmDelId(null); }}>Yes</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelId(null)}>No</button>
                              </span>
                            ) : (
                              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelId(`res-${exam.id}`)}>🗑️</button>
                            )}
                          </>
                        ) : (
                          <>
                            <button className="btn btn-blue btn-sm" onClick={saveEditExam}>📤 Save & Re-upload</button>
                            <button className="btn btn-ghost btn-sm" onClick={cancelEditExam}>Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="card-b">
                      {isEditing ? (
                        <div>
                          <div className="g2" style={{ marginBottom: 16 }}>
                            <div className="field"><label className="fl">Total Score</label>
                              <div style={{ fontFamily: 'var(--font-m)', fontSize: 28, fontWeight: 700 }}><span style={{ color: 'var(--blue)' }}>{ed.totalScore}</span><span style={{ color: 'var(--t3)' }}>/{ed.maxScore}</span></div>
                              <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700, marginTop: 4 }}>{ed.pct}% · Grade {gi.g}</div>
                            </div>
                            <div className="field"><label className="fl">Overall Feedback</label>
                              <textarea style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 8, color: 'var(--t1)', fontFamily: 'Inter,sans-serif', fontSize: 13, padding: '10px 12px', outline: 'none', resize: 'vertical' }} rows={3} value={ed.overallFeedback || ''}
                                onChange={e => setEditExamData(p => ({ ...p, overallFeedback: e.target.value }))} />
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Question-wise Marks</div>
                          {(ed.questions || []).map((q, i) => (
                            <div key={i} className="edit-q-row">
                              <div className="edit-q-name">{q.questionText || `Q${i + 1}`}</div>
                              <input type="number" min="0" max={q.maxMarks} value={q.marksAwarded}
                                onChange={e => updateEditQ(i, 'marksAwarded', e.target.value)}
                                style={{ padding: '7px 10px', fontSize: 13, borderColor: 'var(--blue)' }} />
                              <input type="number" min="1" value={q.maxMarks}
                                onChange={e => updateEditQ(i, 'maxMarks', e.target.value)}
                                style={{ padding: '7px 10px', fontSize: 13 }} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ExamView exam={exam} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'messages' && <Messaging currentUser={currentUser} users={users} messages={messages} onSend={m => fbAddMessage(m)} />}
        </div>
      </div>

      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-h"><span className="modal-ht">Add Student</span><button className="modal-x" onClick={() => setModal(false)}>✕</button></div>
            <div className="modal-b">
              <div className="field"><label className="fl">Full Name</label><input type="text" placeholder="e.g. Sneha Rao" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="g2">
                <div className="field"><label className="fl">Username</label><input type="text" placeholder="unique_username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                <div className="field"><label className="fl">Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
              </div>
              {formErr && <div className="error-banner mt8" style={{ borderRadius: 8, padding: '10px 14px' }}>{formErr}</div>}
            </div>
            <div className="modal-f">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-green" onClick={addStudent}>Add Student</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STUDENT DASHBOARD
══════════════════════════════════════════════════════════════ */
function StudentDash({ currentUser, appState, dispatch }) {
  const { users, messages, exams } = appState;
  const [tab, setTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const myTeacher = users.find(u => u.id === currentUser.teacherId);
  const myExams = exams.filter(e => e.studentId === currentUser.id);
  const unread = messages.filter(m => m.to === currentUser.id && !m.read).length;
  const avgPct = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + e.pct, 0) / myExams.length) : 0;
  const avgHW = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + (e.handwriting || 0), 0) / myExams.length) : 0;
  const avgPres = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + (e.presentation || 0), 0) / myExams.length) : 0;
  const avgDemo = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + (e.demonstration || 0), 0) / myExams.length) : 0;

  const nav = [['overview', '🏠', 'Dashboard'], ['results', '📊', 'My Results'], ['messages', '💬', 'Messages']];
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="shell">
      <button className="mobile-sidebar-toggle" onClick={() => setMobileMenuOpen(o => !o)} type="button">{mobileMenuOpen ? '✕' : '☰'}</button>
      <div className={`sidebar-backdrop ${mobileMenuOpen ? 'visible' : ''}`} onClick={closeMobileMenu} />
      <div className={`sidebar ${mobileMenuOpen ? 'open' : 'closed'}`}>
        <div className="sb-brand"><div className="sb-brand-name">Gradify</div><div className="sb-brand-role role-c-student">Student Portal</div></div>
        <div className="sb-user"><div className="av av-student">{ini(currentUser.name)}</div><div><div className="sb-uname">{currentUser.name}</div><div className="sb-usub">{myTeacher ? myTeacher.name : 'No teacher'}</div></div></div>
        <div className="sb-nav">
          {nav.map(([k, ic, l]) => (
            <div key={k} className={`nav-item ns${tab === k ? ' on' : ''}`} onClick={() => { setTab(k); closeMobileMenu(); }}>
              <span className="nav-ic">{ic}</span>{l}
              {k === 'messages' && unread > 0 && <span className="nav-badge" style={{ background: 'var(--green)', color: '#0a0c10' }}>{unread}</span>}
            </div>
          ))}
        </div>
        <div className="sb-foot"><button className="logout" onClick={() => { signOutUser(); dispatch({ type: 'LOGOUT' }); }}>🚪 Sign Out</button></div>
      </div>
      <div className="content">
        <div className="pad">

          {tab === 'overview' && (
            <div>
              <div className="ph"><h2>Welcome back, {currentUser.name}!</h2><p>Every challenge is an opportunity to learn. Keep pushing forward.</p></div>
              <div className="stats">
                <div className="stat"><div className="stat-i">✍️</div><div className="stat-v" style={{ color: 'var(--purple)' }}><AnimatedNumber value={myExams.length} /></div><div className="stat-l">Exams Taken</div></div>
                <div className="stat"><div className="stat-i">📈</div><div className="stat-v" style={{ color: avgPct >= 60 ? 'var(--green)' : 'var(--gold)' }}><AnimatedNumber value={avgPct} />%</div><div className="stat-l">Avg Score</div></div>
                <div className="stat"><div className="stat-i">🎓</div><div className="stat-v" style={{ color: 'var(--gold)' }}>{myExams.length > 0 ? gradeOf(avgPct).g : '—'}</div><div className="stat-l">Avg Grade</div></div>
                <div className="stat"><div className="stat-i">💬</div><div className="stat-v" style={{ color: 'var(--green)' }}><AnimatedNumber value={unread} /></div><div className="stat-l">Unread</div></div>
              </div>

              {myExams.length > 0 && (
                <div className="card">
                  <div className="card-h"><span className="card-ht">✦ My Average Performance Scores</span></div>
                  <div className="pie-row">
                    <Donut value={avgHW} color="#a78bfa" label="Handwriting" />
                    <Donut value={avgPres} color="#3b9eff" label="Presentation" />
                    <Donut value={avgDemo} color="#22d07a" label="Demonstration" />
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-h"><span className="card-ht">Recent Exams</span></div>
                <div className="card-b">
                  {myExams.length === 0
                    ? <div className="empty">No results yet. Your teacher will upload your graded scripts here.</div>
                    : myExams.slice(-3).reverse().map((e, idx) => (
                      <div key={e.id}
                        className="recent-exam-row"
                        style={{ animationDelay: `${0.15 * (idx + 1)}s` }}
                        onClick={() => { setTab('results'); setTimeout(() => document.getElementById(`exam-card-${e.id}`)?.scrollIntoView({ behavior: 'smooth' }), 50); }}>
                        <div><div className="recent-sub">{e.subject}</div><div className="recent-date">{e.date}</div></div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="recent-score">{e.totalScore}/{e.maxScore}</div>
                          <span className={`badge ${e.pct >= 60 ? 'bg-green' : 'bg-gold'}`}>Grade {e.grade}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'results' && (
            <div>
              <div className="ph"><h2>My Exam Results</h2><p>Detailed feedback for every graded exam</p></div>
              {myExams.length === 0
                ? <div className="card"><div className="empty">No results yet. Ask your teacher to analyse and upload your scripts!</div></div>
                : myExams.map(e => (
                  <div key={e.id} id={`exam-card-${e.id}`} className="card">
                    <div className="card-h"><span className="card-ht">{e.subject}</span><span style={{ fontSize: 11, color: 'var(--t3)' }}>{e.date}</span></div>
                    <div className="card-b"><ExamView exam={e} /></div>
                  </div>
                ))}
            </div>
          )}

          {tab === 'messages' && <Messaging currentUser={currentUser} users={users} messages={messages} onSend={m => fbAddMessage(m)} />}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════════ */
function Login({ users, onLogin }) {
  const [role, setRole] = useState('student');
  const [un, setUn] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const roles = [['admin', '🛡️', 'Admin'], ['teacher', '👩‍🏫', 'Teacher'], ['student', '🎓', 'Student']];

  const login = async () => {
    if (!un.trim() || !pw.trim()) { setErr('Please enter username and password.'); return; }
    setLoading(true); setErr('');
    try {
      await signIn(un, pw);
      // Find user profile from Firestore users
      const u = users.find(x => x.username === un);
      if (!u) { setErr('User profile not found in database.'); setLoading(false); return; }
      if (u.role !== role) { setErr(`This account is a ${u.role}, not ${role}.`); setLoading(false); return; }
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

  return (
    <div className="login-wrap">
      <div className="login-orb lo1" />
      <div className="login-orb lo2" />
      <div className="login-orb lo3" />
      <div className="signin-card">
        <div className="login-top">
          <div className="login-logo">
            <img src="/logo.png" alt="Gradify Logo" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
            <span style={{ display: 'none' }}>GRADIFY</span>
          </div>
          <div className="login-tag">Educator Portal</div>
        </div>
        <div className="login-body">
          <div className="login-sub">Welcome Back 👋</div>
          <div className="login-p">Sign in to your Gradify account</div>

          <div className="role-tabs">
            {roles.map(([r, e, l]) => (
              <div key={r} className={'rt' + (role === r ? (' on-' + r) : '')} onClick={() => { setRole(r); setUn(''); setPw(''); setErr(''); }}>
                <div className="rt-emoji">{e}</div>{l}
              </div>
            ))}
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <input type="text" className="glass-input gi-1" placeholder="Username or Email" value={un} onChange={e => setUn(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <input type="password" className="glass-input gi-2" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '0 4px', animation: 'slideLeftIn 0.5s ease forwards 0.4s', opacity: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#6C63FF', width: 14, height: 14 }} /> Remember me
            </label>
            <span style={{ color: '#00D4AA', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#00D4AA'}>Forgot Password?</span>
          </div>
          {err && <div className="error-banner" style={{ borderRadius: 8, padding: '10px 14px', marginTop: 10 }}>{err}</div>}
          <button className="signin-btn" onClick={login} disabled={loading}>
            {loading ? <><span className="spin" /> Signing in…</> : <>Sign In as {roles.find(r => r[0] === role)?.[2]}</>}
          </button>
        </div>
      </div>
    </div>
  );
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
  const dispatch = useCallback((action) => {
    if (action.type === 'LOGOUT') { signOutUser(); setCurrentUser(null); }
  }, []);

  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    localStorage.setItem('site-theme', theme);
  }, [theme]);

  // Inject CSS + Initialize UI enhancements
  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'eduai-css';
    el.textContent = CSS;
    if (!document.getElementById('eduai-css')) document.head.appendChild(el);
    
    // Initialize UI enhancements: page transitions, loader, scroll reveal, custom cursor
    try { initPageTransitions(); } catch (e) { /* ignore */ }
    try { initPageLoader(); } catch (e) { /* ignore */ }
    try { initScrollReveal(); } catch (e) { /* ignore */ }
    try { initCustomCursor(); } catch (e) { /* ignore */ }
    
    return () => { const e = document.getElementById('eduai-css'); if (e) e.remove(); };
  }, []);

  // Firebase: seed data + real-time listeners (Optimized)
  useEffect(() => {
    let unsubUsers, unsubMsgs, unsubExams, unsubSubjects, unsubSubjectExams;
    let isMounted = true;

    const initFirebase = async () => {
      try {
        // Set up listeners IMMEDIATELY (non-blocking)
        // This ensures real-time UI updates start right away
        unsubUsers = onUsersChange((data) => {
          if (isMounted) {
            setUsers(data);
            setLoading(false);
          }
        });
        unsubMsgs = onMessagesChange((data) => {
          if (isMounted) setMessages(data);
        });
        unsubExams = onExamsChange((data) => {
          if (isMounted) setExams(data);
        });
        unsubSubjects = onSubjectsChange((data) => {
          if (isMounted) setSubjects(data);
        });
        unsubSubjectExams = onSubjectExamsChange((data) => {
          if (isMounted) setSubjectExams(data);
        });

        // Seed data in background (non-blocking)
        // This happens after listeners are set up
        setTimeout(async () => {
          try {
            await seedDataIfEmpty();
            await fbAddUser({ id: 1, role: 'admin', name: 'Chandru', username: 'chandru', password: 'chandru8428', avatar: 'CH' });
          } catch (e) {
            console.error('Seed error:', e);
          }
        }, 0);
      } catch (e) {
        console.error('Firebase init error:', e);
        if (isMounted) setLoading(false);
      }
    };

    initFirebase();

    return () => {
      isMounted = false;
      if (unsubUsers) unsubUsers();
      if (unsubMsgs) unsubMsgs();
      if (unsubExams) unsubExams();
      if (unsubSubjects) unsubSubjects();
      if (unsubSubjectExams) unsubSubjectExams();
    };
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080b12', color: '#94a3c4', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spin" style={{ width: 28, height: 28, border: '3px solid #1e2a3e', borderTopColor: '#3b9eff', margin: '0 auto 14px' }} />
        Connecting to Firebase…
      </div>
    </div>
  );

  const appState = { currentUser, users, messages, exams, subjects, subjectExams };
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const ThemeToggleBtn = () => (
    <button
      onClick={toggleTheme}
      style={{
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
      }}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(108,99,255,0.2)'; }}
      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
    >
      <div key={theme} style={{ animation: 'rotatePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', display: 'flex' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </div>
    </button>
  );

  // System context for AI Agent
  const systemContext = {
    totalStudents: users.filter(u => u.role === 'student').length,
    totalExams: exams.length,
    subjects: subjects.length,
  };

  // Handle AI Agent actions
  const handleAIAction = (action) => {
    console.log('🤖 AI Agent Action:', action);
    // Route actions to appropriate handlers
    switch (action.action) {
      case 'GRADE_EXAM':
        // Would navigate to exam grading
        alert(`Grade exam: ${action.params?.examName || 'selected exam'}`);
        break;
      case 'SHOW_STATS':
        // Would show statistics
        alert('Showing statistics dashboard');
        break;
      case 'MANAGE_STUDENTS':
        // Would navigate to student management
        alert('Opening student management');
        break;
      default:
        console.log('Unknown action:', action.action);
    }
  };

  return (
    <>
      <div className="orbs"><div className="orb o1" /><div className="orb o2" /><div className="orb o3" /><div className="orb o4" /></div>
      <ThemeToggleBtn />
      {!currentUser ? <Login users={users} onLogin={u => setCurrentUser(u)} /> :
        currentUser.role === 'admin' ? <AdminDash currentUser={currentUser} appState={appState} dispatch={dispatch} /> :
          currentUser.role === 'teacher' ? <TeacherDash currentUser={currentUser} appState={appState} dispatch={dispatch} /> :
            <StudentDash currentUser={currentUser} appState={appState} dispatch={dispatch} />
      }
      {currentUser && (
        <AIAssistant
          apiKey={import.meta.env.VITE_NVIDIA_API_KEY || ''}
          userRole={currentUser.role}
          systemContext={systemContext}
          onAction={handleAIAction}
        />
      )}
    </>
  );
}
