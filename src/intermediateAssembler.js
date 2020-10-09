const fs = require('fs');
const prompt = require('prompt');
const postfix = require('infix-to-postfix');

prompt.start();

class IntermediateAssembler {
  constructor(args) {
    this.verbose = args.verbose;
    this.declaredIds = args.declaredIds;
    this.tokensSet = args.tokensSet;
    this.listLog = args.listLog;
    this.intermediateFile = args.intermediateFile;
    this.intermediateLog = [];
    this.intermediateCode = [];
    this.tempVarNumber = 0;
  }
  
  start() {
    if (this.verbose)
      console.log('Intemediate Code Assembler started sucessfully.');
  
    try {
      if (fs.existsSync(this.intermediateFile)) {
        console.log('Intermediate file already exists to this source file.');
        this.checkOverwrite();
      } else {
        if (this.verbose)
          console.log('Intemediate file does not exists.');
        this.createIntermediateFile();
      }
    } catch(err) {
      console.log(err);
    }
  }
  
  checkOverwrite() {
    console.log('Do you want to overwrite? (y/n)');
    
    prompt.get(['answer'], (err, result) => {
      if (err)
        return console.log(err);
        
      const answer = result.answer.toUpperCase();
      
      if (answer === 'Y' || answer === 'YES') {
        fs.unlinkSync(this.intermediateFile);
        if (this.verbose)
          console.log('\nIntermediate file cleaned successfully.');
        this.createIntermediateFile();
      } else if (answer === 'N' || answer === 'NO') {
        if (this.verbose)
          console.log('You have chosen to keep the file, no changes have been made.');
      } else this.checkOverwrite();
    });
  }
  
  createIntermediateFile() {
    if(this.verbose)
      console.log('Building intermediate file...\n');
    
    const curlyBracketsOrder = [];
    let lastCurlyBracketOpener;
    
    for (let id of this.declaredIds) {
      this.intermediateCode.push('_var ' + id);
      this.intermediateLog.push('Declaration of variable ' + id + '.');
    }
    
    for (let index = 0; index < this.tokensSet.length; index++) {
      let token = this.tokensSet[index];
      
      if (token.lexeme === 'in') {
        let variable = this.tokensSet[index + 2].lexeme;
        
        this.intermediateCode.push('INPUT ' + variable);
        this.intermediateLog.push('Read of variable ' + variable);
      } else if (token.lexeme === 'out') {
        let i = 2; // out(text, id, text, id...)
        let currentToken = this.tokensSet[index + i];
        
        do {
          this.intermediateCode.push('OUTPUT ' + currentToken.lexeme);
          currentToken.token == 'text' ? 
          this.intermediateLog.push('Write of text.') :
          this.intermediateLog.push(`Write of variable ${currentToken.lexeme}.`);
            
          i = i + 2;
          currentToken = this.tokensSet[index + i];
        } while (currentToken.lexeme != ';');
        
        index = index + i - 1;
      } else if (token.lexeme === 'if') {
        lastCurlyBracketOpener = 'IF';
        
        let i = 2;
        let currentToken = this.tokensSet[index + i];
        let expression = [];
        
        do {
          expression.push(currentToken.lexeme);
          
          i++;
          currentToken = this.tokensSet[index + i];
        } while (currentToken.lexeme != '{');
        
        index = index + i - 1;
        
        expression.pop();
        
        this.intermediateCode.push('IF ' + expression.join().replace(/,/g, ' '));
        this.intermediateLog.push('If statement found.');
      } else if (token.lexeme === 'else') {
        lastCurlyBracketOpener = 'ELSE';
        
        this.intermediateCode.push('ELSE');
        this.intermediateLog.push('Else statement found.');
      } else if (token.lexeme === 'while') {
        lastCurlyBracketOpener = 'WHILE';
        
        let i = 2;
        let currentToken = this.tokensSet[index + i];
        let expression = [];
        
        do {
          expression.push(currentToken.lexeme);
          
          i++;
          currentToken = this.tokensSet[index + i];
        } while (currentToken.lexeme != '{');
        
        index = index + i - 1;
        
        expression.pop();
        
        this.intermediateCode.push('WHILE ' + expression.join().replace(/,/g, ' '));
        this.intermediateLog.push('While statement found.');
      } else if (token.lexeme === '<-') {
        let i = 1;
        let id = this.tokensSet[index - 1].lexeme;
        let currentToken = this.tokensSet[index + i];
        let expression = [];
        
        let signedParenthesisLevel = 0;
        let levelsToCloseSignedParenthesis = [];
        
        do {
          let signedIdOrNumber = Boolean(
            (currentToken.token === 'id' || currentToken.token === 'number') &&
            this.tokensSet[index + i - 1].token === 'sub' &&
            this.tokensSet[index + i - 2].token !== 'id' &&
            this.tokensSet[index + i - 2].token !== 'number' &&
            this.tokensSet[index + i - 2].token !== 'closeParenthesis'
          );
          
          let signedExpression = Boolean(
            currentToken.token === 'openParenthesis' &&
            this.tokensSet[index + i - 1].token === 'sub' &&
            this.tokensSet[index + i - 2].token !== 'id' &&
            this.tokensSet[index + i - 2].token !== 'number' &&
            this.tokensSet[index + i - 2].token !== 'closeParenthesis'
          );
          
          if (currentToken.token === 'openParenthesis') {
            signedParenthesisLevel++;
          } else if (currentToken.token === 'closeParenthesis') {
            if (levelsToCloseSignedParenthesis[levelsToCloseSignedParenthesis.length - 1] == signedParenthesisLevel) {
              expression.push(')');
              levelsToCloseSignedParenthesis.pop();
            }
            signedParenthesisLevel--;
          }
          
          if (signedIdOrNumber) {
            expression.pop();
            expression.push('(0-');
            expression.push(currentToken.lexeme);
            expression.push(')');
          } else if (signedExpression) {
            expression.pop();
            expression.push('(0-');
            signedParenthesisLevel++;
            expression.push(currentToken.lexeme);
            levelsToCloseSignedParenthesis.push(signedParenthesisLevel);
          } else {
            expression.push(currentToken.lexeme);
          }
          
          i++;
            
          currentToken = this.tokensSet[index + i];
        } while (currentToken.lexeme != ';');
        
        index = index + i - 1; // jump the for index to ;
        
        const expressionFixed = expression.join().replace(/,/g, ' ');
        const expressionPostfix = postfix(expressionFixed);
        const expressionPostfixArray = expressionPostfix.split(" ");
        
        if (expressionPostfixArray.length > 3)
          this.convertPostfixTo3Address(id, expressionPostfixArray);
        else
          this.intermediateCode.push(`${id} := ${expressionPostfix}`);
        
        this.intermediateLog.push('Assignment statement found.');
      } else if (token.lexeme === '{') {
        curlyBracketsOrder.push(lastCurlyBracketOpener);
      } else if (token.lexeme === '}') {
        let lastStatement = curlyBracketsOrder.pop();
        
        this.intermediateCode.push('END' + lastStatement);
        this.intermediateLog.push(`End of ${lastStatement} statement.`);
      }
    };
      
    fs.writeFileSync(
      this.intermediateFile,
      this.intermediateCode.join().replace(/,/g, '\n'),
      (err) => { if (err) return console.log(err); }
    );
    
    if (this.listLog) {
      for (let itemLog of this.intermediateLog)
        console.log('log: ', itemLog);
    }
    
    console.log('Intermediate file built.');
  }
  
  convertPostfixTo3Address(id, expression) {
    for (let index = 0; index < expression.length; index ++) {
      let item = expression[index];
      
      if (expression.length > 3) {
        if (item == "+" || item == "-" || item == "*" || item == "/") {
          this.intermediateCode.unshift("_var #temp" + this.tempVarNumber);
          
          let expression3Address =
            `$temp${this.tempVarNumber} := ${expression[index-2]} ${expression[index-1]} ${item}`;
          
          expression.splice(index-2, 3, `#temp${this.tempVarNumber}`);
          index = index-2;

          this.tempVarNumber++;
          this.intermediateCode.push(expression3Address);
        }
      } else {
        this.intermediateCode.push(`${id} := ${expression.join().replace(/,/g, ' ')}`);
        this.tempVarNumber = 0;
        
        break;
      }
    };
  }
}

module.exports = IntermediateAssembler;
