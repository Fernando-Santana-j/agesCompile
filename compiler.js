const fs   = require('fs');
const path = require('path');

const { Lexer }       = require('./lexer');
const { Parser }      = require('./parser');
const { Interpreter } = require('./interpreter');


const clr = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
  blue:   '\x1b[34m',
  magenta:'\x1b[35m',
};

const c = (color, text) => `${clr[color]}${text}${clr.reset}`;
const banner = (label, color = 'cyan') =>
  console.log(`\n${c(color, c('bold', `──── ${label} ────`))}`);


const args      = process.argv.slice(2);
const showTokens = args.includes('--tokens');
const showAst    = args.includes('--ast');
const filePath   = args.find(a => !a.startsWith('--'));

if (!filePath) {
  console.error(c('red', '✗ Uso: node compiler.js <arquivo.ages> [--tokens] [--ast]'));
  process.exit(1);
}

const absPath = path.resolve(filePath);
if (!fs.existsSync(absPath)) {
  console.error(c('red', `✗ Arquivo não encontrado: ${absPath}`));
  process.exit(1);
}

const source = fs.readFileSync(absPath, 'utf8');

console.log(c('bold', `\n🔧 Ages Compiler — interpretando: ${c('cyan', path.basename(absPath))}`));
console.log(c('dim', '─'.repeat(55)));


let tokens;
try {
  banner('FASE 1 · Análise Léxica (Lexer)', 'yellow');
  const lexer = new Lexer(source);
  tokens = lexer.tokenize();
  console.log(c('green', `  ✓ ${tokens.length - 1} token(s) gerado(s)`));

  if (showTokens) {
    console.log('');
    tokens.forEach((t, i) => {
      if (t.type === 'EOF') return;
      const val = t.value !== null ? ` = ${JSON.stringify(t.value)}` : '';
      console.log(`  ${c('dim', String(i).padStart(3, '0'))}  ${c('cyan', t.type.padEnd(12))} ${c('white', val)}  ${c('dim', `linha ${t.line}`)}`);
    });
  }
} catch (e) {
  console.error(c('red', `\n✗ Erro léxico: ${e.message}`));
  process.exit(1);
}

let ast;
try {
  banner('FASE 2 · Análise Sintática (Parser)', 'yellow');
  const parser = new Parser(tokens);
  ast = parser.parse();
  console.log(c('green', `  ✓ AST construída com ${ast.body.length} statement(s) no nível raiz`));

  if (showAst) {
    console.log('');
    console.log(JSON.stringify(ast, null, 2));
  }
} catch (e) {
  console.error(c('red', `\n✗ Erro sintático: ${e.message}`));
  process.exit(1);
}

try {
  banner('FASE 3 · Execução (Interpreter)', 'yellow');
  console.log(c('dim', '  Saída do programa:\n'));

  const interpreter = new Interpreter({
    printFn: (v) => console.log(c('green', '  ▶ ') + c('white', String(v))),
  });

  const start  = Date.now();
  interpreter.run(ast);
  const elapsed = Date.now() - start;

  console.log(c('dim', '\n' + '─'.repeat(55)));
  console.log(c('green', c('bold', `  ✓ Programa finalizado em ${elapsed}ms`)));
} catch (e) {
  console.error(c('red', `\n✗ Erro em tempo de execução: ${e.message}`));
  process.exit(1);
}

console.log('');
