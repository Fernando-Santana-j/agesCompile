
const TOKEN = {
  // Literais
  NUMBER:     'NUMBER',
  STRING:     'STRING',
  BOOL:       'BOOL',
  NULL:       'NULL',
  IDENT:      'IDENT',

  // Palavras-chave
  VAR:        'VAR',
  FUNC:       'FUNC',
  RETURN:     'RETURN',
  IF:         'IF',
  ELSE:       'ELSE',
  WHILE:      'WHILE',
  PRINT:      'PRINT',

  // Operadores aritméticos
  PLUS:       'PLUS',
  MINUS:      'MINUS',
  STAR:       'STAR',
  SLASH:      'SLASH',
  PERCENT:    'PERCENT',

  // Operadores de comparação
  EQ:         'EQ',       // ==
  NEQ:        'NEQ',      // !=
  LT:         'LT',       // <
  LTE:        'LTE',      // <=
  GT:         'GT',       // >
  GTE:        'GTE',      // >=

  // Operadores lógicos
  AND:        'AND',      // &&
  OR:         'OR',       // ||
  NOT:        'NOT',      // !

  // Atribuição
  ASSIGN:     'ASSIGN',   // =

  // Pontuação
  LPAREN:     'LPAREN',   // (
  RPAREN:     'RPAREN',   // )
  LBRACE:     'LBRACE',   // {
  RBRACE:     'RBRACE',   // }
  COMMA:      'COMMA',    // ,

  EOF:        'EOF',
};

const KEYWORDS = {
  variavel:    TOKEN.VAR,
  funcao:   TOKEN.FUNC,
  return: TOKEN.RETURN,
  se:     TOKEN.IF,
  senao:   TOKEN.ELSE,
  while:  TOKEN.WHILE,
  escreva:  TOKEN.PRINT,
  sim:   TOKEN.BOOL,
  nao:  TOKEN.BOOL,
  null:   TOKEN.NULL,
};

class Token {
  constructor(type, value, line) {
    this.type  = type;
    this.value = value;
    this.line  = line;
  }
  toString() {
    return `Token(${this.type}, ${JSON.stringify(this.value)}, linha ${this.line})`;
  }
}

class Lexer {
  constructor(source) {
    this.source  = source;
    this.pos     = 0;
    this.line    = 1;
    this.tokens  = [];
  }

  error(msg) {
    throw new Error(`[Lexer] Linha ${this.line}: ${msg}`);
  }

  peek(offset = 0) {
    return this.source[this.pos + offset] ?? '';
  }

  advance() {
    const ch = this.source[this.pos++];
    if (ch === '\n') this.line++;
    return ch;
  }

  match(expected) {
    if (this.peek() === expected) { this.advance(); return true; }
    return false;
  }

  skipWhitespaceAndComments() {
    while (this.pos < this.source.length) {
      const ch = this.peek();
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
        this.advance();
      } else if (ch === '#') {                    
        while (this.pos < this.source.length && this.peek() !== '\n') this.advance();
      } else {
        break;
      }
    }
  }

  readNumber() {
    let num = '';
    while (/[0-9.]/.test(this.peek())) num += this.advance();
    if ((num.match(/\./g) || []).length > 1) this.error(`Número mal formado: ${num}`);
    return parseFloat(num);
  }

  readString(quote) {
    this.advance(); 
    let str = '';
    while (this.pos < this.source.length && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance();
        const esc = this.advance();
        str += ({ n: '\n', t: '\t', '\\': '\\', '"': '"', "'": "'" }[esc] ?? esc);
      } else {
        str += this.advance();
      }
    }
    if (this.pos >= this.source.length) this.error('String não fechada');
    this.advance(); 
    return str;
  }

  readIdent() {
    let id = '';
    while (/[a-zA-Z0-9_]/.test(this.peek())) id += this.advance();
    return id;
  }

  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.source.length) break;

      const line = this.line;
      const ch   = this.peek();

      if (/[0-9]/.test(ch)) {
        this.tokens.push(new Token(TOKEN.NUMBER, this.readNumber(), line));
        continue;
      }

      if (ch === '"' || ch === "'") {
        this.tokens.push(new Token(TOKEN.STRING, this.readString(ch), line));
        continue;
      }

      if (/[a-zA-Z_]/.test(ch)) {
        const id  = this.readIdent();
        const kw  = KEYWORDS[id];
        if (kw) {
          const val = (kw === TOKEN.BOOL) ? (id === 'true') : (kw === TOKEN.NULL ? null : id);
          this.tokens.push(new Token(kw, val, line));
        } else {
          this.tokens.push(new Token(TOKEN.IDENT, id, line));
        }
        continue;
      }

      this.advance();
      switch (ch) {
        case '+': this.tokens.push(new Token(TOKEN.PLUS,    '+', line)); break;
        case '-': this.tokens.push(new Token(TOKEN.MINUS,   '-', line)); break;
        case '*': this.tokens.push(new Token(TOKEN.STAR,    '*', line)); break;
        case '/': this.tokens.push(new Token(TOKEN.SLASH,   '/', line)); break;
        case '%': this.tokens.push(new Token(TOKEN.PERCENT, '%', line)); break;
        case '(': this.tokens.push(new Token(TOKEN.LPAREN,  '(', line)); break;
        case ')': this.tokens.push(new Token(TOKEN.RPAREN,  ')', line)); break;
        case '{': this.tokens.push(new Token(TOKEN.LBRACE,  '{', line)); break;
        case '}': this.tokens.push(new Token(TOKEN.RBRACE,  '}', line)); break;
        case ',': this.tokens.push(new Token(TOKEN.COMMA,   ',', line)); break;
        case '=':
          this.tokens.push(this.match('=')
            ? new Token(TOKEN.EQ,     '==', line)
            : new Token(TOKEN.ASSIGN, '=',  line)); break;
        case '!':
          this.tokens.push(this.match('=')
            ? new Token(TOKEN.NEQ, '!=', line)
            : new Token(TOKEN.NOT, '!',  line)); break;
        case '<':
          this.tokens.push(this.match('=')
            ? new Token(TOKEN.LTE, '<=', line)
            : new Token(TOKEN.LT,  '<',  line)); break;
        case '>':
          this.tokens.push(this.match('=')
            ? new Token(TOKEN.GTE, '>=', line)
            : new Token(TOKEN.GT,  '>',  line)); break;
        case '&':
          if (this.match('&')) this.tokens.push(new Token(TOKEN.AND, '&&', line));
          else this.error(`Caractere inesperado: &`);
          break;
        case '|':
          if (this.match('|')) this.tokens.push(new Token(TOKEN.OR, '||', line));
          else this.error(`Caractere inesperado: |`);
          break;
        default:
          this.error(`Caractere desconhecido: '${ch}'`);
      }
    }

    this.tokens.push(new Token(TOKEN.EOF, null, this.line));
    return this.tokens;
  }
}

module.exports = { Lexer, Token, TOKEN };
