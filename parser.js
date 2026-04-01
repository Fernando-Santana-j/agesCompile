
const { TOKEN } = require('./lexer');


class Program        { constructor(body)                    { this.type = 'Program';        this.body = body; } }
class VarDecl        { constructor(name, init)              { this.type = 'VarDecl';        this.name = name; this.init = init; } }
class Assign         { constructor(name, value, line)       { this.type = 'Assign';         this.name = name; this.value = value; this.line = line; } }
class FuncDecl       { constructor(name, params, body)      { this.type = 'FuncDecl';       this.name = name; this.params = params; this.body = body; } }
class ReturnStmt     { constructor(value)                   { this.type = 'ReturnStmt';     this.value = value; } }
class IfStmt         { constructor(cond, cons, alt)         { this.type = 'IfStmt';         this.cond = cond; this.cons = cons; this.alt = alt; } }
class WhileStmt      { constructor(cond, body)              { this.type = 'WhileStmt';      this.cond = cond; this.body = body; } }
class PrintStmt      { constructor(value)                   { this.type = 'PrintStmt';      this.value = value; } }
class Block          { constructor(stmts)                   { this.type = 'Block';          this.stmts = stmts; } }
class BinaryExpr     { constructor(op, left, right, line)   { this.type = 'BinaryExpr';     this.op = op; this.left = left; this.right = right; this.line = line; } }
class UnaryExpr      { constructor(op, operand, line)       { this.type = 'UnaryExpr';      this.op = op; this.operand = operand; this.line = line; } }
class CallExpr       { constructor(callee, args, line)      { this.type = 'CallExpr';       this.callee = callee; this.args = args; this.line = line; } }
class Literal        { constructor(value)                   { this.type = 'Literal';        this.value = value; } }
class Identifier     { constructor(name, line)              { this.type = 'Identifier';     this.name = name; this.line = line; } }


class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos    = 0;
  }

  error(msg, line) {
    const l = line ?? this.peek().line;
    throw new Error(`[Parser] Linha ${l}: ${msg}`);
  }

  peek()    { return this.tokens[this.pos]; }
  advance() { return this.tokens[this.pos++]; }

  check(type)   { return this.peek().type === type; }
  match(...types) {
    for (const t of types) {
      if (this.check(t)) { this.advance(); return true; }
    }
    return false;
  }

  expect(type, msg) {
    if (!this.check(type)) this.error(msg ?? `Esperado '${type}', encontrado '${this.peek().type}'`);
    return this.advance();
  }

  parse() {
    const body = [];
    while (!this.check(TOKEN.EOF)) body.push(this.statement());
    return new Program(body);
  }

  statement() {
    if (this.check(TOKEN.VAR))    return this.varDecl();
    if (this.check(TOKEN.FUNC))   return this.funcDecl();
    if (this.check(TOKEN.RETURN)) return this.returnStmt();
    if (this.check(TOKEN.IF))     return this.ifStmt();
    if (this.check(TOKEN.WHILE))  return this.whileStmt();
    if (this.check(TOKEN.PRINT))  return this.printStmt();

    if (this.check(TOKEN.IDENT)) {
      const saved = this.pos;
      const name  = this.advance();
      if (this.check(TOKEN.ASSIGN)) {
        this.advance();
        const value = this.expression();
        return new Assign(name.value, value, name.line);
      }
      this.pos = saved;
    }

    return this.expression();
  }

  varDecl() {
    this.expect(TOKEN.VAR);
    const name = this.expect(TOKEN.IDENT, 'Esperado nome de variável após "variavel"').value;
    this.expect(TOKEN.ASSIGN, 'Esperado "=" após o nome da variável');
    const init = this.expression();
    return new VarDecl(name, init);
  }

  funcDecl() {
    this.expect(TOKEN.FUNC);
    const name = this.expect(TOKEN.IDENT, 'Esperado nome de função após "funcao"').value;
    this.expect(TOKEN.LPAREN, 'Esperado "(" após o nome da função');
    const params = [];
    if (!this.check(TOKEN.RPAREN)) {
      params.push(this.expect(TOKEN.IDENT).value);
      while (this.match(TOKEN.COMMA))
        params.push(this.expect(TOKEN.IDENT, 'Esperado nome de parâmetro').value);
    }
    this.expect(TOKEN.RPAREN, 'Esperado ")" após os parâmetros');
    const body = this.block();
    return new FuncDecl(name, params, body);
  }

  returnStmt() {
    this.expect(TOKEN.RETURN);
    const value = this.expression();
    return new ReturnStmt(value);
  }

  ifStmt() {
    this.expect(TOKEN.IF);
    const cond = this.expression();
    const cons = this.block();
    let alt = null;
    if (this.match(TOKEN.ELSE)) alt = this.block();
    return new IfStmt(cond, cons, alt);
  }

  whileStmt() {
    this.expect(TOKEN.WHILE);
    const cond = this.expression();
    const body = this.block();
    return new WhileStmt(cond, body);
  }

  printStmt() {
    this.expect(TOKEN.PRINT);
    this.expect(TOKEN.LPAREN, 'Esperado "(" após "escreva"');
    const value = this.expression();
    this.expect(TOKEN.RPAREN, 'Esperado ")" após o argumento do escreva');
    return new PrintStmt(value);
  }

  block() {
    this.expect(TOKEN.LBRACE, 'Esperado "{"');
    const stmts = [];
    while (!this.check(TOKEN.RBRACE) && !this.check(TOKEN.EOF))
      stmts.push(this.statement());
    this.expect(TOKEN.RBRACE, 'Esperado "}" para fechar o bloco');
    return new Block(stmts);
  }

  
  expression() { return this.or(); }

  or() {
    let left = this.and();
    while (this.check(TOKEN.OR)) {
      const op = this.advance().value;
      left = new BinaryExpr(op, left, this.and(), this.peek().line);
    }
    return left;
  }

  and() {
    let left = this.equality();
    while (this.check(TOKEN.AND)) {
      const op = this.advance().value;
      left = new BinaryExpr(op, left, this.equality(), this.peek().line);
    }
    return left;
  }

  equality() {
    let left = this.comparison();
    while (this.check(TOKEN.EQ) || this.check(TOKEN.NEQ)) {
      const op = this.advance().value;
      left = new BinaryExpr(op, left, this.comparison(), this.peek().line);
    }
    return left;
  }

  comparison() {
    let left = this.addition();
    while ([TOKEN.LT, TOKEN.LTE, TOKEN.GT, TOKEN.GTE].some(t => this.check(t))) {
      const op = this.advance().value;
      left = new BinaryExpr(op, left, this.addition(), this.peek().line);
    }
    return left;
  }

  addition() {
    let left = this.multiplication();
    while (this.check(TOKEN.PLUS) || this.check(TOKEN.MINUS)) {
      const op = this.advance().value;
      left = new BinaryExpr(op, left, this.multiplication(), this.peek().line);
    }
    return left;
  }

  multiplication() {
    let left = this.unary();
    while (this.check(TOKEN.STAR) || this.check(TOKEN.SLASH) || this.check(TOKEN.PERCENT)) {
      const op = this.advance().value;
      left = new BinaryExpr(op, left, this.unary(), this.peek().line);
    }
    return left;
  }

  unary() {
    if (this.check(TOKEN.NOT) || this.check(TOKEN.MINUS)) {
      const tok = this.advance();
      return new UnaryExpr(tok.value, this.unary(), tok.line);
    }
    return this.call();
  }

  call() {
    let expr = this.primary();
    if (this.check(TOKEN.LPAREN) && expr.type === 'Identifier') {
      const line = this.peek().line;
      this.advance(); // consome '('
      const args = [];
      if (!this.check(TOKEN.RPAREN)) {
        args.push(this.expression());
        while (this.match(TOKEN.COMMA))
          args.push(this.expression());
      }
      this.expect(TOKEN.RPAREN, 'Esperado ")" após os argumentos');
      expr = new CallExpr(expr.name, args, line);
    }
    return expr;
  }

  primary() {
    const tok = this.peek();
    if (tok.type === TOKEN.NUMBER) { this.advance(); return new Literal(tok.value); }
    if (tok.type === TOKEN.STRING) { this.advance(); return new Literal(tok.value); }
    if (tok.type === TOKEN.BOOL)   { this.advance(); return new Literal(tok.value); }
    if (tok.type === TOKEN.NULL)   { this.advance(); return new Literal(null); }
    if (tok.type === TOKEN.IDENT)  { this.advance(); return new Identifier(tok.value, tok.line); }
    if (tok.type === TOKEN.LPAREN) {
      this.advance();
      const expr = this.expression();
      this.expect(TOKEN.RPAREN, 'Esperado ")" para fechar a expressão');
      return expr;
    }
    this.error(`Token inesperado: '${tok.value ?? tok.type}'`, tok.line);
  }
}

module.exports = {
  Parser,
  Program, VarDecl, Assign, FuncDecl, ReturnStmt,
  IfStmt, WhileStmt, PrintStmt, Block,
  BinaryExpr, UnaryExpr, CallExpr, Literal, Identifier,
};
