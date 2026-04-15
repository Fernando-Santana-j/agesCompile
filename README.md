# 🚀 AGES Compiler

> Compilador de Linguagem Própria em Português

Um compilador educacional completo desenvolvido para facilitar a programação através de características e sintaxe totalmente em português. Projeto acadêmico criado para a faculdade AGES.

[![GitHub](https://img.shields.io/badge/GitHub-Fernando--Santana--j-blue?logo=github)](https://github.com/Fernando-Santana-j/agesCompile)
[![Language](https://img.shields.io/badge/Language-JavaScript-yellow?logo=javascript)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/Version-1.0.0-green)]()
[![License](https://img.shields.io/badge/License-ISC-blue)]()

---

## 📋 Objetivo

O **AGES Compiler** é um compilador desenvolvido para:

- ✅ Facilitar a programação com **sintaxe 100% em português**
- ✅ Criar uma linguagem de programação própria para fins educacionais
- ✅ Demonstrar a implementação completa de um compilador (léxer, parser e interpretador)
- ✅ Simplificar o aprendizado de conceitos de compiladores para iniciantes

---

## 🛠️ Como Foi Feito

### Arquitetura do Compilador

```
Código .ages → Lexer → Parser → Interpretador → Execução
```

### Etapas Implementadas

1. **Lexer (lexer.js)**
   - Análise léxica do código
   - Converte texto em tokens
   - Reconhece palavras-chave, operadores e identificadores

2. **Parser (parser.js)**
   - Análise sintática dos tokens
   - Cria Árvore de Sintaxe Abstrata (AST)
   - Valida estrutura do programa

3. **Interpretador (interpreter.js)**
   - Executa a AST gerada
   - Gerencia variáveis e funções
   - Produz os resultados

4. **Compilador (compiler.js)**
   - Orquestra todo o processo
   - Integra lexer, parser e interpretador

5. **CLI (bin/agesCompile)**
   - Interface de linha de comando
   - Permite executar arquivos .ages diretamente

---

## 💻 Linguagem AGES

### Sintaxe Básica

A linguagem AGES suporta os seguintes elementos:

#### Variáveis
```ages
variavel nome = "Fernando"
variavel idade = 25
variavel ativo = verdadeiro
```

#### Funções
```ages
funcao saudacao(nome) {
  escreva("Olá, " + nome + "!")
}
```

#### Condicionais
```ages
se idade >= 18 {
  escreva("Maior de idade")
} senao {
  escreva("Menor de idade")
}
```

#### Loops
```ages
enquanto contador < 10 {
  escreva(contador)
  contador = contador + 1
}
```

#### Exemplo Completo
```ages
variavel nome = "Ages"
variavel numero = 7
escreva(numero)

se numero == 7 {
  escreva("Número encontrado!")
  escreva(nome)
}
```

### Tipos Suportados

- **Números:** inteiros e decimais
- **Strings:** textos entre aspas
- **Booleanos:** verdadeiro ou falso
- **Null:** valor nulo

### Palavras-chave

| Palavra-chave | Função |
|---|---|
| `variavel` | Declare uma variável |
| `funcao` | Declare uma função |
| `se` | Condicional if |
| `senao` | Condicional else |
| `enquanto` | Loop while |
| `retorne` | Retorna um valor |
| `escreva` | Imprime na tela |

---

## 📦 Instalação

### Pré-requisitos
- Node.js v14+
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/Fernando-Santana-j/agesCompile.git
cd agesCompile
```

2. **Instale as dependências**
```bash
npm install
```

3. **Torne o compilador executável (Linux/Mac)**
```bash
chmod +x bin/agesCompile
```

---

## 🚀 Como Usar

### Executar um arquivo Ages

```bash
agesCompile seu_arquivo.ages
```

### Exemplo Prático

1. **Crie um arquivo `exemplo.ages`:**
```ages
variavel x = 10
variavel y = 20
escreva(x + y)

se x < y {
  escreva("x é menor que y")
}
```

2. **Execute o arquivo:**
```bash
agesCompile exemplo.ages
```

3. **Resultado esperado:**
```
30
x é menor que y
```

---

## 📁 Estrutura do Projeto

```
agesCompile/
├── lexer.js           # Análise léxica
├── parser.js          # Análise sintática
├── interpreter.js     # Interpretador
├── compiler.js        # Compilador principal
├── package.json       # Dependências do projeto
├── exemplo.ages       # Arquivo de exemplo
├── README.md          # Este arquivo
├── index.html         # Relatório completo
└── bin/
    └── agesCompile    # CLI do compilador
```

---

## 👨‍💻 Autor

**Fernando Santana**

- GitHub: [@Fernando-Santana-j](https://github.com/Fernando-Santana-j)
- Projeto: [AGES Compiler](https://github.com/Fernando-Santana-j/agesCompile)

---

## 📚 Tecnologias

- **JavaScript (Node.js)** - Linguagem de implementação
- **Análise Léxica** - Tokenização de código
- **Análise Sintática** - Criação de AST
- **Interpretação** - Execução do programa

---

## 📜 Licença

ISC

---

## 🎓 Conceitos Aprendidos

Este projeto demonstra:

- Fundamentos de design de linguagens de programação
- Implementação de compiladores
- Análise léxica e sintática
- Árvores de sintaxe abstrata (AST)
- Interpretação de código
- Design de padrões em JavaScript

---

## 📝 Notas

- Este é um projeto educacional e pode ser expandido com novos recursos
- Sugestões e melhorias são bem-vindas
- Para contribuições, abra uma issue ou pull request no GitHub

---

**Desenvolvido para a Faculdade AGES • 2026**
