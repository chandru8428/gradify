const fs = require('fs');
const babel = require('@babel/core');

const code = fs.readFileSync('./frontend/src/ExamSystem.jsx', 'utf8');

const result = babel.transformSync(code, {
  presets: [
    ['@babel/preset-react', { pragma: 'e', pragmaFrag: 'React.Fragment' }]
  ]
});

fs.writeFileSync('./compiled-ExamSystem.js', result.code);
console.log('Compiled to ./compiled-ExamSystem.js');
