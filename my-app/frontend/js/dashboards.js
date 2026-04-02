// This file contains the main dashboard components (Admin, Teacher, Student) transpiled to React.createElement

const { createElement: e, useState, useEffect, useRef } = React;

// Import the common components via global window (since we aren't using a bundler)
// We'll rely on the global scope for these or pass them. 
// For this setup without modules in HTML, we assume CSS, ExamView, Donut, QCard, etc. 
// are available if loaded before this script, or we can just import them if using type="module".

import { 
  CSS, gradeOf, mkCls, AnimatedNumber, Donut, Orbs, Shell, SidebarBrand 
} from './common-components.js';

import { callAPI } from './api.js';
import { db } from './firebase-config.js';
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { logoutUser } from './auth.js';

// Helper functions that were in ExamSystem.jsx
const NOW = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const TODAY = () => new Date().toLocaleDateString('en-GB');
const ini = n => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U';
const fmtSz = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const toB64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(f); });

// ==========================================
// QCard & ExamView (From common ui logic)
// ==========================================
function QCard({ q, idx }) {
  const [open, setOpen] = useState(true);
  return e("div", { className: "qc" }, 
    e("div", { className: "qc-h", onClick: () => setOpen(o => !o) }, 
        e("div", null, e("div", { className: "qc-label" }, q.questionText || `Question ${idx + 1}`)), 
        e("div", { className: "flex fac gap" }, 
            e("span", { className: `mk ${mkCls(q.marksAwarded, q.maxMarks)}` }, q.marksAwarded, "/", q.maxMarks), 
            e("span", { style: { fontSize: 11, color: '#4a5878' } }, open ? '▲' : '▼')
        )
    ), 
    open && e("div", { className: "qc-b" }, 
        e("div", { className: "qc-lbl" }, "Examiner Feedback"), 
        e("div", { className: "qc-text" }, q.feedback), 
        e("div", { className: "sw2" }, 
            e("div", { className: "sw-s" }, e("div", { className: "sw-lbl" }, "\u2713 Strengths"), q.strengths), 
            e("div", { className: "sw-w" }, e("div", { className: "sw-lbl" }, "\u26A0 Needs Improvement"), q.weaknesses)
        ), 
        q.suggestions && e("div", { className: "sug" }, 
            e("span", { style: { fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--blue)', fontWeight: 700, display: 'block', marginBottom: 4 } }, "\uD83D\uDCA1 Suggestions"), q.suggestions)
    )
  );
}

function ExamView({ exam }) {
  const gi = gradeOf(exam.pct);
  return e("div", null, 
    e("div", { className: "score-banner" }, 
        e("div", { className: "sb-num" }, exam.totalScore, e("span", { className: "sb-den" }, "/", exam.maxScore)), 
        e("div", { className: "sb-pct" }, exam.pct, "%"), 
        e("div", { className: `sb-grade ${gi.cls}` }, gi.e, " Grade ", gi.g), 
        e("p", { className: "sb-text" }, exam.overallFeedback)
    ), 
    e("div", { className: "card" }, 
        e("div", { className: "card-h" }, e("span", { className: "card-ht" }, "\u2726 Performance Scores")), 
        e("div", { className: "pie-row" }, 
            e(Donut, { value: exam.handwriting || 0, color: "#a78bfa", label: "Handwriting" }), 
            e(Donut, { value: exam.presentation || 0, color: "#3b9eff", label: "Presentation" }), 
            e(Donut, { value: exam.demonstration || 0, color: "#22d07a", label: "Demonstration" })
        )
    ), 
    e("div", { className: "mt12" }, (exam.questions || []).map((q, i) => e(QCard, { key: i, q: q, idx: i })))
  );
}

function DropZone({ file, onChange, onRemove }) {
  const [drag, setDrag] = useState(false);
  if (file) return e("div", { className: "fp" }, 
    e("span", { style: { fontSize: 22 } }, file.type === 'application/pdf' ? '📄' : '🖼️'), 
    e("div", { className: "fp-info" }, e("div", { className: "fp-name" }, file.name), e("div", { className: "fp-size" }, fmtSz(file.size))), 
    e("button", { className: "btn btn-danger btn-sm", onClick: onRemove }, "\u2715 Remove")
  );
  return e("div", { className: `dz${drag ? ' over' : ''}`, onDragOver: e => { e.preventDefault(); setDrag(true); }, onDragLeave: () => setDrag(false), onDrop: e => { e.preventDefault(); setDrag(false); e.dataTransfer.files[0] && onChange(e.dataTransfer.files[0]); } }, 
    e("input", { type: "file", accept: "image/*,.pdf", onChange: e => e.target.files[0] && onChange(e.target.files[0]) }), 
    e("div", { className: "dz-icon" }, "\uD83D\uDCE4"), e("div", { className: "dz-text" }, e("b", null, "Click or drag"), " file here"), 
    e("div", { className: "dz-hint" }, "PDF, JPG or PNG \u2014 handwritten or typed")
  );
}

/* ══════════════════════════════════════════════════════════════
   PART-WISE MARK BUILDER COMPONENT
══════════════════════════════════════════════════════════════ */
function MarkBuilder({ parts, setParts }) {
  const total = parts.reduce((s, p) => s + p.questions.reduce((ss, q) => ss + Number(q.marks || 0), 0), 0);
  const addPart = () => setParts(ps => [...ps, { id: Date.now(), name: `Part ${String.fromCharCode(65 + ps.length)}`, questions: [{ id: Date.now() + 1, text: '', marks: '' }] }]);
  const delPart = pid => setParts(ps => ps.filter(p => p.id !== pid));
  const updPName = (pid, v) => setParts(ps => ps.map(p => p.id === pid ? { ...p, name: v } : p));
  const addQ = pid => setParts(ps => ps.map(p => p.id === pid ? { ...p, questions: [...p.questions, { id: Date.now(), text: '', marks: '' }] } : p));
  const delQ = (pid, qid) => setParts(ps => ps.map(p => p.id === pid ? { ...p, questions: p.questions.filter(q => q.id !== qid) } : p));
  const updQ = (pid, qid, f, v) => setParts(ps => ps.map(p => p.id === pid ? { ...p, questions: p.questions.map(q => q.id === qid ? { ...q, [f]: v } : q) } : p));
  const partTotal = p => p.questions.reduce((s, q) => s + Number(q.marks || 0), 0);
  return e("div", { className: "card" }, 
    e("div", { className: "card-h" }, e("span", { className: "card-ht" }, "\u2462 Part-wise Mark Allocation"), e("span", { className: "total-chip" }, "\uD83D\uDCCA Total: ", total, " marks")), 
    e("div", { className: "card-b" }, 
        e("p", { style: { fontSize: 12, color: 'var(--t3)', marginBottom: 14, lineHeight: 1.6 } }, "Add each ", e("b", { style: { color: 'var(--t2)' } }, "Part / Section"), ", then add ", e("b", { style: { color: 'var(--t2)' } }, "questions inside"), " with marks. AI will follow this exact scheme when grading."), 
        e("div", { className: "part-list" }, parts.map((part, pi) => e("div", { key: part.id, className: "part-box" }, 
            e("div", { className: "part-head" }, 
                e("input", { type: "text", value: part.name, onChange: e => updPName(part.id, e.target.value), placeholder: "e.g. Part A / Section 1", style: { flex: 1, background: 'transparent', border: 'none', color: 'var(--t1)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, outline: 'none', padding: 0 } }), 
                e("span", { className: "part-marks-chip" }, partTotal(part), " marks"), 
                parts.length > 1 && e("button", { onClick: () => delPart(part.id), style: { background: '#2a0808', border: '1px solid #5a1010', color: 'var(--red)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' } }, "\u2715 Remove Part")
            ), 
            e("div", { className: "part-body" }, 
                e("div", { style: { display: 'grid', gridTemplateColumns: '1fr 80px 36px', gap: 8, marginBottom: 6 } }, 
                    e("div", { style: { fontSize: 10, color: 'var(--t3)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 } }, "Question / Description"), 
                    e("div", { style: { fontSize: 10, color: 'var(--t3)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 } }, "Marks"), 
                    e("div", null)
                ), 
                part.questions.map((q, qi) => e("div", { key: q.id, className: "q-row" }, 
                    e("input", { type: "text", value: q.text, onChange: e => updQ(part.id, q.id, 'text', e.target.value), placeholder: `e.g. Explain Q${qi + 1}`, style: { padding: '8px 10px', fontSize: 13 } }), 
                    e("input", { type: "number", value: q.marks, onChange: e => updQ(part.id, q.id, 'marks', e.target.value), min: "0", placeholder: "10", style: { padding: '8px 10px', fontSize: 13, textAlign: 'center' } }), 
                    part.questions.length > 1 ? e("button", { onClick: () => delQ(part.id, q.id), style: { background: '#2a0808', border: '1px solid #5a1010', color: 'var(--red)', borderRadius: 6, padding: '7px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "\u2715") : e("div", null)
                )), 
                e("button", { className: "add-q-btn", onClick: () => addQ(part.id) }, "\uFF0B Add Question")
            )
        ))), 
        e("button", { className: "add-part-btn", onClick: addPart }, "\uFF0B Add Part / Section")
    )
  );
}

// ==========================================
// ExamAnalyser
// ==========================================
export function ExamAnalyser({ currentUser, users, onSave, subjects, subjectExams }) {
  const myStudents = users.filter(u => u.role === 'student' && u.teacherId === currentUser.id);
  const [sid, setSid] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [gstyle, setGstyle] = useState('balanced');
  const [keyFile, setKeyFile] = useState(null);
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [editR, setEditR] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sucMsg, setSucMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const ref = useRef(null);

  const filteredExams = subjectExams.filter(e => String(e.subjectId) === String(selectedSubjectId));
  const selectedSubject = subjects.find(s => String(s.id) === String(selectedSubjectId));
  const selectedExam = subjectExams.find(e => String(e.id) === String(selectedExamId));
  const parts = selectedExam?.parts || [];
  const subjectStr = selectedSubject?.name || '';

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
    id: Date.now(), studentId: sid || null, teacherId: currentUser.id,
    subject: subjectStr || 'Exam', date: TODAY(),
    totalScore: r.totalMarksAwarded, maxScore: r.totalMarksAvailable,
    pct: r.percentage, handwriting: r.handwritingScore,
    presentation: r.presentationScore, demonstration: r.demonstrationScore,
    grade: gradeOf(r.percentage).g, overallFeedback: r.overallFeedback,
    questions: r.questions || [],
  });

  const run = async () => {
    if (!script) { setErrMsg('Please upload the student answer script first.'); return; }
    if (!selectedSubjectId) { setErrMsg('Please select a subject.'); return; }
    setErrMsg(''); setSucMsg(''); setLoading(true); setResult(null); setSaved(false); setEditing(false);
    
    try {
        const hasScheme = parts.length > 0 && totalMarks > 0;
        const prompt = `You are a strict but fair examiner. Carefully read and evaluate the student's answer script.

SUBJECT: ${subjectStr || 'General'}
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

        // Instead of hitting Gemini directly, we hit Django backend as requested in task
        let body = { prompt: prompt, subject: subjectStr };
        if (script) body.scriptB64 = await toB64(script);
        if (keyFile) body.keyB64 = await toB64(keyFile);

        const data = await callAPI('/analyse/', 'POST', body);
        setResult(data);
        setEditR(JSON.parse(JSON.stringify(data)));
        setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (e) {
        setErrMsg('AI evaluation via Django API failed. ' + e.message);
    } finally {
        setLoading(false);
    }
  };

  const doUpload = (r) => {
    if (!sid) {
      setErrMsg('⚠ Please select a student from the dropdown before uploading.');
      setSucMsg(''); return;
    }
    // Fire it to Firestore or over API depending on architecture
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

  return e("div", null, 
    e("div", { className: "ph" }, 
        e("h2", null, "Exam Script Analyser"), 
        e("p", null, "Select subject & exam \u2192 upload files \u2192 AI grades \u2192 review \u2192 upload to student")
    ), 
    
    e("div", { className: "g2" }, 
        e("div", { className: "card" }, 
            e("div", { className: "card-h" }, e("span", { className: "card-ht" }, "\u2460 Exam Info")), 
            e("div", { className: "card-b" }, 
                e("div", { className: "field" }, 
                    e("label", { className: "fl" }, "Student"), 
                    e("select", { value: sid, onChange: e => { setSid(e.target.value); setErrMsg(''); setSucMsg(''); } }, 
                        e("option", { value: "" }, "\u2014 Select student \u2014"), 
                        myStudents.map(s => e("option", { key: s.uid, value: s.uid }, s.name))
                    ), 
                    myStudents.length === 0 && e("div", { style: { fontSize: 11, color: 'var(--t3)', marginTop: 5 } }, "No students assigned to you yet.")
                ), 
                e("div", { className: "field" }, 
                    e("label", { className: "fl" }, "Subject"), 
                    e("select", { value: selectedSubjectId, onChange: e => { setSelectedSubjectId(e.target.value); setSelectedExamId(''); } }, 
                        e("option", { value: "" }, "\u2014 Select subject \u2014"), 
                        // In real scenario we use Firestore ID
                        subjects.map(s => e("option", { key: s.id, value: s.id }, s.name))
                    )
                ), 
                e("div", { className: "field" }, 
                    e("label", { className: "fl" }, "Exam (optional \u2014 includes mark allocation)"), 
                    e("select", { value: selectedExamId, onChange: e => setSelectedExamId(e.target.value), disabled: !selectedSubjectId }, 
                        e("option", { value: "" }, "\u2014 No specific exam \u2014"), 
                        filteredExams.map(e => e("option", { key: e.id, value: e.id }, e.name))
                    )
                ), 
                e("div", { className: "field" }, 
                    e("label", { className: "fl" }, "Grading Style"), 
                    e("select", { value: gstyle, onChange: e => setGstyle(e.target.value) }, 
                        e("option", { value: "strict" }, "Strict \u2014 exact answers only"), 
                        e("option", { value: "balanced" }, "Balanced \u2014 standard marking"), 
                        e("option", { value: "lenient" }, "Lenient \u2014 benefit of doubt")
                    )
                )
            )
        ), 
        e("div", { className: "card" }, 
            e("div", { className: "card-h" }, e("span", { className: "card-ht" }, "\u2461 Upload Files")), 
            e("div", { className: "card-b" }, 
                e("label", { className: "fl" }, "Answer Key / Scheme (Optional)"), 
                e(DropZone, { file: keyFile, onChange: setKeyFile, onRemove: () => setKeyFile(null) }), 
                e("div", { className: "mt16" }), 
                e("label", { className: "fl" }, "Student Answer Script (Required)"), 
                e(DropZone, { file: script, onChange: setScript, onRemove: () => setScript(null) }), 
                e("button", { className: "btn btn-blue", style: { width: '100%', marginTop: 24, padding: 16, fontSize: 16 }, onClick: run, disabled: loading }, 
                    loading ? e(React.Fragment, null, e("span", { className: "spin" }), " Analysing Script\u2026") : "\u2728 Auto-Grade with AI"
                )
            )
        )
    ), 
    
    errMsg && e("div", { className: "error-banner mt16" }, errMsg), 
    sucMsg && e("div", { className: "success-banner mt16" }, e("span", { style: { fontSize: 20, marginRight: 8 } }, "\u2705"), sucMsg), 
    
    result && e("div", { ref: ref }, 
        e("div", { className: "upload-bar" }, 
            e("div", null, e("div", { className: "upload-bar-title" }, saved ? "Result Uploaded" : "Analysis Complete"), e("div", { className: "upload-bar-sub" }, saved ? "The student can now view this in their portal." : "Review the AI grading below before uploading.")), 
            !saved && e("div", { className: "flex fac gap" }, 
                e("button", { className: "btn btn-ghost", onClick: () => setEditing(!editing) }, editing ? "Cancel Edit" : "\u270F\uFE0F Edit Marks"), 
                e("button", { className: "btn btn-green", onClick: () => doUpload(editing ? editR : result) }, "\uD83D\uDCE4 Upload to Student Dashboard")
            )
        ), 
        
        editing ? e("div", { className: "edit-panel" }, 
            e("div", { className: "edit-panel-h" }, e("span", { className: "edit-panel-ht" }, "\u270F\uFE0F Editor Mode: Adjust marks manually")), 
            e("div", { className: "card-b" }, 
                e("div", { style: { display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: 12, marginBottom: 8, fontSize: 10, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 1 } }, 
                    e("div", null, "Question"), e("div", null, "Awarded"), e("div", null, "Max")
                ), 
                editR.questions.map((q, i) => e("div", { key: i, className: "edit-q-row" }, 
                    e("div", { className: "edit-q-name" }, q.questionText || `Question ${i + 1}`), 
                    e("input", { type: "number", min: "0", max: q.maxMarks, value: q.marksAwarded, onChange: e => setEditR(recalc(editR.questions.map((_q, _i) => _i === i ? { ..._q, marksAwarded: Number(e.target.value) } : _q))) }), 
                    e("input", { type: "number", min: "1", value: q.maxMarks, onChange: e => setEditR(recalc(editR.questions.map((_q, _i) => _i === i ? { ..._q, maxMarks: Number(e.target.value) } : _q))) })
                )), 
                e("div", { className: "edit-total" }, 
                    e("div", null, e("div", { style: { fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 } }, "Total Awarded"), e("div", { style: { fontFamily: 'var(--font-m)', fontSize: 24, fontWeight: 700, color: 'var(--blue)' } }, editR.totalMarksAwarded)), 
                    e("div", null, e("div", { style: { fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 } }, "Max Marks"), e("div", { style: { fontFamily: 'var(--font-m)', fontSize: 24, fontWeight: 700, color: 'var(--t2)' } }, editR.totalMarksAvailable)), 
                    e("div", null, e("div", { style: { fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 } }, "Percentage"), e("div", { style: { fontFamily: 'var(--font-m)', fontSize: 24, fontWeight: 700, color: 'var(--t1)' } }, editR.percentage, "%"))
                )
            )
        ) : e(ExamView, { exam: { totalScore: result.totalMarksAwarded, maxScore: result.totalMarksAvailable, pct: result.percentage, handwriting: result.handwritingScore, presentation: result.presentationScore, demonstration: result.demonstrationScore, overallFeedback: result.overallFeedback, questions: result.questions || [] } })
    )
  );
}

// ==========================================
// AdminDash
// ==========================================
export function AdminDash({ currentUser, appState }) {
  const { users, exams } = appState;
  const [tab, setTab] = useState('overview');
  
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  
  const nav = [['overview', '🏠', 'Overview'], ['users', '👥', 'Users'], ['exams', '📝', 'All Exams']];
  
  return e(Shell, { sidebar: 
      e(React.Fragment, null, 
          e(SidebarBrand, { role: 'admin' }),
          e("div", { className: "sb-user" }, 
              e("div", { className: "av av-admin" }, ini(currentUser.name)), 
              e("div", null, e("div", { className: "sb-uname" }, currentUser.name), e("div", { className: "sb-usub" }, "Administrator"))
          ),
          e("div", { className: "sb-nav" }, 
              nav.map(([k, ic, l]) => e("div", { key: k, className: `nav-item na${tab === k ? ' on' : ''}`, onClick: () => setTab(k) }, e("span", { className: "nav-ic" }, ic), l))
          ),
          e("div", { className: "sb-foot" }, e("button", { className: "logout", onClick: () => logoutUser() }, "\uD83D\uDEAA Sign Out"))
      ) 
  },
      e("div", { className: "pad" }, 
          tab === 'overview' && e("div", null, 
              e("div", { className: "ph" }, e("h2", null, "Admin Overview"), e("p", null, "System statistics")),
              e("div", { className: "stats" }, 
                  e("div", { className: "stat" }, e("div", { className: "stat-i" }, "\uD83D\uDC65"), e("div", { className: "stat-v", style: { color: 'var(--blue)' } }, teachers.length), e("div", { className: "stat-l" }, "Teachers")),
                  e("div", { className: "stat" }, e("div", { className: "stat-i" }, "\uD83C\uDF93"), e("div", { className: "stat-v", style: { color: 'var(--green)' } }, students.length), e("div", { className: "stat-l" }, "Students")),
                  e("div", { className: "stat" }, e("div", { className: "stat-i" }, "\uD83D\uDCDD"), e("div", { className: "stat-v", style: { color: 'var(--purple)' } }, exams.length), e("div", { className: "stat-l" }, "Exams Graded"))
              )
          ),
          tab === 'users' && e("div", null, 
              e("div", { className: "ph" }, e("h2", null, "User Management"), e("p", null, "System Users")),
              e("div", { className: "card" }, 
                  e("table", { className: "tbl" }, 
                      e("thead", null, e("tr", null, e("th", null, "Name"), e("th", null, "Role"))),
                      e("tbody", null, users.map(u => e("tr", { key: u.uid }, e("td", null, e("b", null, u.name)), e("td", null, e("span", { className: `badge bg-${u.role}` }, u.role)))))
                  )
              )
          ),
          tab === 'exams' && e("div", null, 
              e("div", { className: "ph" }, e("h2", null, "All Exam Results"), e("p", null, "Every graded script")),
              exams.length === 0 ? e("div", { className: "card" }, e("div", { className: "empty" }, "No exams graded yet")) : 
              exams.map(ex => e("div", { key: ex.id, className: "card" }, e("div", { className: "card-h" }, e("span", { className: "card-ht" }, ex.subject, " - ", ex.pct, "%")), e("div", { className: "card-b" }, e(ExamView, { exam: ex }))))
          )
      )
  );
}

// ==========================================
// TeacherDash
// ==========================================
export function TeacherDash({ currentUser, appState }) {
  const { users, exams, subjects, subjectExams } = appState;
  const [tab, setTab] = useState('overview');
  
  const myStudents = users.filter(u => u.role === 'student' && u.teacherId === currentUser.uid);
  const myExams = exams.filter(e => e.teacherId === currentUser.uid);
  const avgPct = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + (e.pct || 0), 0) / myExams.length) : 0;

  const onSaveAnalysis = async (examObj) => {
    // Save to Firestore via collection helper
    // For Django API, we would POST to /api/analyse/ and let server save.
    const colRef = collection(db, 'submissions');
    await addDoc(colRef, examObj);
  };
  
  const nav = [['overview', '🏠', 'Overview'], ['students', '👥', 'My Students'], ['analyser', '🔬', 'Exam Analyser'], ['results', '📊', 'Graded Results']];
  
  return e(Shell, { sidebar: 
      e(React.Fragment, null, 
          e(SidebarBrand, { role: 'teacher' }),
          e("div", { className: "sb-user" }, 
              e("div", { className: "av av-teacher" }, ini(currentUser.name)), 
              e("div", null, e("div", { className: "sb-uname" }, currentUser.name), e("div", { className: "sb-usub" }, "Teacher"))
          ),
          e("div", { className: "sb-nav" }, 
              nav.map(([k, ic, l]) => e("div", { key: k, className: `nav-item nt${tab === k ? ' on' : ''}`, onClick: () => setTab(k) }, e("span", { className: "nav-ic" }, ic), l))
          ),
          e("div", { className: "sb-foot" }, e("button", { className: "logout", onClick: () => logoutUser() }, "\uD83D\uDEAA Sign Out"))
      ) 
  },
      e("div", { className: "pad" }, 
          tab === 'overview' && e("div", null, 
              e("div", { className: "ph" }, e("h2", null, "Welcome back, ", currentUser.name, "!"), e("p", null, "Manage your exams and grading.")),
              e("div", { className: "stats" }, 
                  e("div", { className: "stat" }, e("div", { className: "stat-i" }, "\uD83D\uDC65"), e("div", { className: "stat-v", style: { color: 'var(--green)' } }, myStudents.length), e("div", { className: "stat-l" }, "My Students")),
                  e("div", { className: "stat" }, e("div", { className: "stat-i" }, "\uD83D\uDCDD"), e("div", { className: "stat-v", style: { color: 'var(--purple)' } }, myExams.length), e("div", { className: "stat-l" }, "Exams Graded")),
                  e("div", { className: "stat" }, e("div", { className: "stat-i" }, "\uD83D\uDCC8"), e("div", { className: "stat-v", style: { color: 'var(--gold)' } }, avgPct, "%"), e("div", { className: "stat-l" }, "Class Avg"))
              )
          ),
          tab === 'students' && e("div", null, 
              e("div", { className: "ph" }, e("h2", null, "Students"), e("p", null, "Your assigned students")),
              e("div", { className: "card" }, 
                  e("table", { className: "tbl" }, 
                      e("thead", null, e("tr", null, e("th", null, "Name"))),
                      e("tbody", null, myStudents.map(u => e("tr", { key: u.uid }, e("td", null, e("b", null, u.name)))))
                  )
              )
          ),
          tab === 'analyser' && e(ExamAnalyser, { currentUser, users, onSave: onSaveAnalysis, subjects, subjectExams }),
          tab === 'results' && e("div", null, 
              e("div", { className: "ph" }, e("h2", null, "Graded Results"), e("p", null, "Your graded exams")),
              myExams.length === 0 ? e("div", { className: "card" }, e("div", { className: "empty" }, "No exams graded yet")) : 
              myExams.map(ex => e("div", { key: ex.id, className: "card" }, e("div", { className: "card-h" }, e("span", { className: "card-ht" }, ex.subject, " - ", ex.pct, "%")), e("div", { className: "card-b" }, e(ExamView, { exam: ex }))))
          )
      )
  );
}

// ==========================================
// StudentDash
// ==========================================
export function StudentDash({ currentUser, appState }) {
  const { exams } = appState;
  const [tab, setTab] = useState('overview');
  
  const myExams = exams.filter(e => String(e.studentId) === String(currentUser.uid));
  const avgPct = myExams.length > 0 ? Math.round(myExams.reduce((s, e) => s + (e.pct || 0), 0) / myExams.length) : 0;
  
  const nav = [['overview', '🏠', 'Dashboard'], ['results', '📊', 'My Results']];
  
  return e(Shell, { sidebar: 
      e(React.Fragment, null, 
          e(SidebarBrand, { role: 'student' }),
          e("div", { className: "sb-user" }, 
              e("div", { className: "av av-student" }, ini(currentUser.name)), 
              e("div", null, e("div", { className: "sb-uname" }, currentUser.name), e("div", { className: "sb-usub" }, "Student"))
          ),
          e("div", { className: "sb-nav" }, 
              nav.map(([k, ic, l]) => e("div", { key: k, className: `nav-item ns${tab === k ? ' on' : ''}`, onClick: () => setTab(k) }, e("span", { className: "nav-ic" }, ic), l))
          ),
          e("div", { className: "sb-foot" }, e("button", { className: "logout", onClick: () => logoutUser() }, "\uD83D\uDEAA Sign Out"))
      ) 
  },
      e("div", { className: "pad" }, 
          tab === 'overview' && e("div", null, 
              e("div", { className: "ph" }, e("h2", null, "Welcome back, ", currentUser.name, "!"), e("p", null, "Your learning overview.")),
              e("div", { className: "stats" }, 
                  e("div", { className: "stat" }, e("div", { className: "stat-i" }, "\u270D\uFE0F"), e("div", { className: "stat-v", style: { color: 'var(--purple)' } }, myExams.length), e("div", { className: "stat-l" }, "Exams Taken")),
                  e("div", { className: "stat" }, e("div", { className: "stat-i" }, "\uD83D\uDCC8"), e("div", { className: "stat-v", style: { color: avgPct >= 60 ? 'var(--green)' : 'var(--gold)' } }, avgPct, "%"), e("div", { className: "stat-l" }, "Avg Score"))
              )
          ),
          tab === 'results' && e("div", null, 
              e("div", { className: "ph" }, e("h2", null, "My Graded Results"), e("p", null, "Detailed feedback for your exams")),
              myExams.length === 0 ? e("div", { className: "card" }, e("div", { className: "empty" }, "No exams graded yet")) : 
              myExams.map(ex => e("div", { key: ex.id, className: "card" }, e("div", { className: "card-h" }, e("span", { className: "card-ht" }, ex.subject, " - ", ex.pct, "%")), e("div", { className: "card-b" }, e(ExamView, { exam: ex }))))
          )
      )
  );
}
