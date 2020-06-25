# <span style="color:orange">GOLD:</span> Gold over limits, dude

## Overview

It is a very nice compiler (I hope so).

Seriously, **<span style="color:orange">Gold Compiler</span>** is a JavaScript-based compiler **in development, so far**. The construction of this compiler is a project of the Compilers discipline of the Computer Engineering course at IFMT.

The construction of **<span style="color:orange">Gold Compiler</span>** is divided into:

**<span style="color:green">✓</span>** Lexical analysis <br />
**<span style="color:#d00000">✗</span>** Syntax analisys <br />
**<span style="color:#d00000">✗</span>** Semantic analysis <br />
**<span style="color:#d00000">✗</span>** Generation of intermediate code <br />
**<span style="color:#d00000">✗</span>** Final code generation <br />

## How to run 

You will need to have Node.js installed on your machine.
After that, open your terminal in the project folder and run:

```bash
node gold [options] [script.js] [arguments]
```

#### Options

<table>
	<tr>
    	<td>-lt, --listTokens</td>
    	<td>shows a table that displays each tokens in script</td>
    </tr>
</table>

#### Arguments
<table>
    <tr>
    	<td>-v, --verbose</td>
    	<td>shows hidden execution messages</td>
    </tr>
</table>

## License

[MIT](LICENSE)
