
class ReturnSignal {
  constructor(value) { this.value = value; }
}

class Environment {
  constructor(parent = null) {
    this.vars   = {};
    this.parent = parent;
  }

  define(name, value) {
    this.vars[name] = value;
  }

  get(name, line) {
    if (name in this.vars) return this.vars[name];
    if (this.parent)        return this.parent.get(name, line);
    throw new Error(`[Runtime] Linha ${line ?? '?'}: Variável '${name}' não definida`);
  }

  set(name, value, line) {
    if (name in this.vars)          { this.vars[name] = value; return; }
    if (this.parent?.has(name))     { this.parent.set(name, value, line); return; }
    throw new Error(`[Runtime] Linha ${line ?? '?'}: Variável '${name}' não definida (use "var" para declarar)`);
  }

  has(name) {
    if (name in this.vars) return true;
    return this.parent?.has(name) ?? false;
  }
}

class AgesFunction {
  constructor(name, params, body, closure) {
    this.name    = name;
    this.params  = params;
    this.body    = body;
    this.closure = closure; 
  }
  toString() { return `<função ${this.name}>`; }
}

class Interpreter {
  constructor(options = {}) {
    this.outputLines = [];                 
    this.printFn     = options.printFn ?? (v => { console.log(v); this.outputLines.push(String(v)); });
    this.globals     = new Environment();
    this._seedBuiltins();
  }

  _seedBuiltins() {
    const def = (n, fn) => this.globals.define(n, fn);

    def('tipo',     v => typeof v === 'object' ? (v === null ? 'null' : 'objeto') : typeof v);
    def('paraNum',  v => Number(v));
    def('paraStr',  v => String(v));
    def('raiz',     v => Math.sqrt(v));
    def('potencia', (b, e) => Math.pow(b, e));
    def('abs',      v => Math.abs(v));
    def('arred',    v => Math.round(v));
    def('piso',     v => Math.floor(v));
    def('teto',     v => Math.ceil(v));
    def('aleatorio',  () => Math.random());
    def('max',      (a, b) => Math.max(a, b));
    def('min',      (a, b) => Math.min(a, b));
    def('tamanho',  v => (typeof v === 'string' ? v.length : null));
    def('maiusculo',v => (typeof v === 'string' ? v.toUpperCase() : v));
    def('minusculo',v => (typeof v === 'string' ? v.toLowerCase() : v));
  }

  error(msg) { throw new Error(`[Runtime] ${msg}`); }

  run(ast) {
    return this.execBlock(ast.body, this.globals);
  }

  execBlock(stmts, env) {
    let result;
    for (const stmt of stmts) {
      result = this.exec(stmt, env);
      if (result instanceof ReturnSignal) return result; // propaga return
    }
    return result;
  }

  exec(node, env) {
    switch (node.type) {
      case 'Program':    return this.execBlock(node.body, env);
      case 'Block':      return this.execBlock(node.stmts, new Environment(env));
      case 'VarDecl':    return this.execVarDecl(node, env);
      case 'Assign':     return this.execAssign(node, env);
      case 'FuncDecl':   return this.execFuncDecl(node, env);
      case 'ReturnStmt': return this.execReturn(node, env);
      case 'IfStmt':     return this.execIf(node, env);
      case 'WhileStmt':  return this.execWhile(node, env);
      case 'PrintStmt':  return this.execPrint(node, env);
      case 'BinaryExpr': return this.execBinary(node, env);
      case 'UnaryExpr':  return this.execUnary(node, env);
      case 'CallExpr':   return this.execCall(node, env);
      case 'Literal':    return node.value;
      case 'Identifier': return env.get(node.name, node.line);
      default: this.error(`Nó desconhecido: ${node.type}`);
    }
  }

  execVarDecl(node, env) {
    const value = this.exec(node.init, env);
    env.define(node.name, value);
    return value;
  }

  execAssign(node, env) {
    const value = this.exec(node.value, env);
    env.set(node.name, value, node.line);
    return value;
  }

  execFuncDecl(node, env) {
    const fn = new AgesFunction(node.name, node.params, node.body, env);
    env.define(node.name, fn);
    return fn;
  }

  execReturn(node, env) {
    const value = this.exec(node.value, env);
    return new ReturnSignal(value);
  }

  execIf(node, env) {
    const cond = this.exec(node.cond, env);
    if (this.isTruthy(cond)) return this.exec(node.cons, env);
    if (node.alt)             return this.exec(node.alt, env);
    return null;
  }

  execWhile(node, env) {
    let result;
    let iterations = 0;
    while (this.isTruthy(this.exec(node.cond, env))) {
      result = this.exec(node.body, env);
      if (result instanceof ReturnSignal) return result;
      if (++iterations > 100_000) this.error('Loop infinito detectado (limite de 100.000 iterações)');
    }
    return result;
  }

  execPrint(node, env) {
    const value = this.exec(node.value, env);
    this.printFn(this.stringify(value));
    return value;
  }

  execBinary(node, env) {
    if (node.op === '&&') {
      const l = this.exec(node.left, env);
      return this.isTruthy(l) ? this.exec(node.right, env) : l;
    }
    if (node.op === '||') {
      const l = this.exec(node.left, env);
      return this.isTruthy(l) ? l : this.exec(node.right, env);
    }

    const left  = this.exec(node.left,  env);
    const right = this.exec(node.right, env);

    switch (node.op) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string')
          return String(left) + String(right);
        return this.numCheck(left, node.line) + this.numCheck(right, node.line);
      case '-': return this.numCheck(left, node.line) - this.numCheck(right, node.line);
      case '*': return this.numCheck(left, node.line) * this.numCheck(right, node.line);
      case '/':
        if (right === 0) this.error(`Linha ${node.line}: Divisão por zero`);
        return this.numCheck(left, node.line) / this.numCheck(right, node.line);
      case '%': return this.numCheck(left, node.line) % this.numCheck(right, node.line);
      case '==': return left === right;
      case '!=': return left !== right;
      case '<':  return this.numCheck(left, node.line) <  this.numCheck(right, node.line);
      case '<=': return this.numCheck(left, node.line) <= this.numCheck(right, node.line);
      case '>':  return this.numCheck(left, node.line) >  this.numCheck(right, node.line);
      case '>=': return this.numCheck(left, node.line) >= this.numCheck(right, node.line);
      default: this.error(`Operador desconhecido: ${node.op}`);
    }
  }

  execUnary(node, env) {
    const val = this.exec(node.operand, env);
    switch (node.op) {
      case '-': return -this.numCheck(val, node.line);
      case '!': return !this.isTruthy(val);
      default: this.error(`Operador unário desconhecido: ${node.op}`);
    }
  }

  execCall(node, env) {
    const callee = env.get(node.callee, node.line);
    const args   = node.args.map(a => this.exec(a, env));

    if (typeof callee === 'function') {
      return callee(...args) ?? null;
    }

    if (callee instanceof AgesFunction) {
      if (args.length !== callee.params.length)
        this.error(`Linha ${node.line}: '${node.callee}' espera ${callee.params.length} argumento(s), recebeu ${args.length}`);
      const fnEnv = new Environment(callee.closure);
      callee.params.forEach((p, i) => fnEnv.define(p, args[i]));
      const result = this.exec(callee.body, fnEnv);
      return result instanceof ReturnSignal ? result.value : null;
    }

    this.error(`Linha ${node.line}: '${node.callee}' não é uma função`);
  }

  isTruthy(v) {
    if (v === null || v === false || v === 0 || v === '') return false;
    return true;
  }

  numCheck(v, line) {
    if (typeof v !== 'number') this.error(`Linha ${line}: Esperado número, encontrado '${this.stringify(v)}'`);
    return v;
  }

  stringify(v) {
    if (v === null)    return 'null';
    if (v === true)    return 'verdadeiro';
    if (v === false)   return 'falso';
    if (typeof v === 'number') return String(Number.isInteger(v) ? v : v.toFixed(6).replace(/0+$/, '').replace(/\.$/, ''));
    if (v instanceof AgesFunction) return v.toString();
    return String(v);
  }
}

module.exports = { Interpreter };
