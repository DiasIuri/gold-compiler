const fs = require('fs');

class FinalAssembler {
  constructor(args) {
    this.verbose = args.verbose;
    this.intermediateCode = args.intermediateCode;
    this.finalFile = args.finalFile;
    this.finalCode = [];
  }
  
  start() {
    if (this.verbose)
      console.log('Final Code Assembler started sucessfully.');
      
    this.createFinalCode();
  }
  
  createFinalCode() {
    const data = ['.data\n', '\tbl:\t\t.asciiz "\\n"\n'];
    const text = ['\n.text\n'];
    const main = ['main:\n'];
    const printValue = ['printValue:\n', 'li $v0, 1\n', 'syscall\n', 'jr $ra\n\n'];
    const printText = ['printText:\n', 'li $v0, 4\n', 'syscall\n', 'jr $ra\n\n'];
    const userInput = ['userInput:\n', 'li $v0, 5\n', 'syscall\n', 'jr $ra\n\n'];
    const breakLine = ['breakLine:\n', 'li $v0, 4\n', 'la $a0, bl\n', 'syscall\n', 'jr $ra\n\n'];
    const finishProgram = ['finishProgram:\n', 'li $v0, 10\n', 'syscall\n\n'];
    
    const statementList = [];
    const endIfStack = [];
    const endElseStack = [];
    const endWhileStack = [];
    const firstElseToCloseStack = [];
    
    let statementCounter = 0;
    let ifCounter = 0;
    let elseCounter = 0;
    let whileCounter = 0;
    
    let textCounter = 0;
    
    for (let lineItem of this.intermediateCode) {
      let lineElements = lineItem.split(' ');
      
      for (let statement of lineElements) {
        if (
          statement == 'IF' ||
          statement == 'ENDIF' ||
          statement == 'ELIF' ||
          statement == 'ELSE' ||
          statement == 'ENDELSE'
        ) {
          statementList.push(statement);
        }
      }
    }
    
    for (let lineIndex in this.intermediateCode) {
      let lineElements = this.intermediateCode[lineIndex].split(' ');
      let lineInCode = Number(lineIndex);
      
      if (lineElements[0] === '_var') {
        if (lineElements[1][0] !== '$')
          data.push(`\t${lineElements[1]}:\t\t.word 0\n`);
      } else if (lineElements[0] === 'INPUT') {
        main.push(`# Line ${lineInCode + 1} - Input \n`);
        main.push('jal userInput\n');
        main.push(`sw $v0, ${lineElements[1]}\n`);
        main.push('\n');
      } else if (lineElements[0] === 'OUTPUT') {
        main.push(`# Line ${lineInCode + 1} - Output \n`);
        
        if (lineElements[1][0] === "'") {
          let outputText = this.intermediateCode[lineIndex];
          data.push(`\ttext${textCounter}:\t\t.asciiz ${outputText.slice(7).replace(/'/g, '"')}\n`);
          main.push(`la $a0, text${textCounter}\n`);
          main.push('jal printText\n');
          main.push('jal breakLine\n');
          main.push('\n');
          textCounter++;
        } else {
          main.push(`lw $a0, ${lineElements[1]}\n`);
				  main.push('jal printValue\n');
				  main.push('jal breakLine\n');
          main.push('\n');
        }
      } else if (lineElements[0] === 'IF') {
        main.push(`# Line ${lineInCode + 1} - If \n`);
        
        let el1 = lineElements[1];
        let op = lineElements[2];
        let el2 = lineElements[3];
        let opInstruction;
        let opInstructionInverse;
        let endIfInstructions = '';
        let endIfPosition = getEndIfPosition();
        
        if (/[0-9]/.test(el1[0]))
           main.push(`addi $s7, $zero, ${el1}\n`);
         else
           main.push(`lw $s7, ${el1}\n`);
         
         if (/[0-9]/.test(el2[0])) 
           main.push(`addi $s6, $zero, ${el2}\n`);
         else
           main.push(`lw $s6, ${el2}\n`);
        
        switch (op) {
          case '>':
            opInstruction = 'bgt';
            opInstructionInverse = 'ble';
            break;
          case '<':
            opInstruction = 'blt';
            opInstructionInverse = 'bge';
            break;
          case '<=':
            opInstruction = 'ble';
            opInstructionInverse = 'bgt';
            break;
          case '>=':
            opInstruction = 'bge';
            opInstructionInverse = 'blt';
            break;
          case '><':
            opInstruction = 'beq';
            opInstructionInverse = 'bne';
            break;
          case '<>':
            opInstruction = 'bne';
            opInstructionInverse = 'beq';
            break;
        }
        
        if (statementList[endIfPosition + 1] !== 'ELSE' && statementList[endIfPosition + 1] !== 'ELIF')
          simpleIfStatement();
        else if (statementList[endIfPosition + 1] === 'ELSE' || statementList[endIfPosition + 1] === 'ELIF') {
          // if this IF is the first of elif list
          if (statementList[statementCounter - 1] !== 'ELIF') {
            firstElseToCloseStack.push(elseCounter);
          }
          ifElseStatement();
        }
        
        statementCounter++;
        ifCounter++;
        
        function getEndIfPosition() {
          let i = 0;
          let openIf = 1;
          
          do {
            i++;
            let statement = statementList[statementCounter + i];
            if (statement == "IF")
              openIf++;
            else if (statement == "ENDIF")
              openIf--;
          } while (openIf != 0);
          
          return statementCounter + i;
        }
        
        function simpleIfStatement() {
          main.push(`${opInstruction} $s7, $s6, if${ifCounter}\n`);
          main.push(`j endIf${ifCounter}\n`);
          main.push(`\nif${ifCounter}:\n`);
          
          endIfInstructions = `endIf${ifCounter}:\n`;
            endIfStack.push(endIfInstructions);
        }
        
        function ifElseStatement() {
          main.push(`${opInstructionInverse} $s7, $s6, else${elseCounter}\n`);
          main.push(`\nif${ifCounter}:\n`);
        
          endIfInstructions =
            `j endElse${elseCounter}\n` +
            `\nelse${elseCounter}:\n`;
          
          endIfStack.push(endIfInstructions);
        }
      } else if (lineElements[0] === 'ENDIF') {
        main.push(`# Line ${lineInCode + 1} - End if \n`);
        
        main.push(endIfStack.pop());
        
        statementCounter++;
      } else if (lineElements[0] === 'ELSE') {
        main.push(`# Line ${lineInCode + 1} - Else \n`);
        
        let endElseInstructions =
          `\nendElse${elseCounter}:\n`;
          
        endElseStack.push(endElseInstructions);
        
        statementCounter++;
        elseCounter++;
      } else if (lineElements[0] === 'ENDELSE') {
        main.push(`# Line ${lineInCode + 1} - End if \n`);
        
        let firstElseToClose = firstElseToCloseStack.pop();
        let remaining = (elseCounter - 1) - firstElseToClose;
        
        for (let i = 0; i <= remaining; i++)
          main.push(endElseStack.pop());
        
        statementCounter++;
      } else if (lineElements[0] === 'ELIF') {
        main.push(`# Line ${lineInCode + 1} - Elif \n`);
        
        let endElseInstructions =
          `\nendElse${elseCounter}:\n`;
          
        endElseStack.push(endElseInstructions);
        
        statementCounter++;
        elseCounter++;
      } else if (lineElements[0] === 'ENDELIF') {
        main.push(`# Line ${lineInCode + 1} - End elif \n`);
        
        main.push(endElseStack.pop());
        
        statementCounter++;
      } else if (lineElements[0] === 'WHILE') {
        main.push(`# Line ${lineInCode + 1} - While \n`);
        
        let el1 = lineElements[1];
        let op = lineElements[2];
        let el2 = lineElements[3];
        let opInstruction;
        let endWhileInstructions = '';
        
        if (/[0-9]/.test(el1[0])) {
          main.push(`addi $s7, $zero, ${el1}\n`);
          endWhileInstructions = endWhileInstructions + `addi $s7, $zero, ${el1}\n`;
        } else {
          main.push(`lw $s7, ${el1}\n`);
          endWhileInstructions = endWhileInstructions + `lw $s7, ${el1}\n`;
        }
         
        if (/[0-9]/.test(el2[0])) {
          main.push(`addi $s6, $zero, ${el2}\n`);
          endWhileInstructions = endWhileInstructions + `addi $s6, $zero, ${el2}\n`;
        } else {
          main.push(`lw $s6, ${el2}\n`);
          endWhileInstructions = endWhileInstructions + `lw $s6, ${el2}\n`;
        }
        
        switch (op) {
          case '>':
            opInstruction = 'bgt';
            break;
          case '<':
            opInstruction = 'blt';
            break;
          case '<=':
            opInstruction = 'ble';
            break;
          case '>=':
            opInstruction = 'bge';
            break;
          case '><':
            opInstruction = 'beq';
            break;
          case '<>':
            opInstruction = 'bne';
            break;
        }
        
        main.push(`${opInstruction} $s7, $s6, while${whileCounter}\n`);
        main.push(`j endWhile${whileCounter}\n`);
        main.push(`\nwhile${whileCounter}:\n`);
        
        endWhileInstructions =
          endWhileInstructions + 
          `${opInstruction} $s7, $s6, while${whileCounter}\n` +
          `\nendWhile${whileCounter}:\n`;
        endWhileStack.push(endWhileInstructions);
        
        whileCounter++;
      } else if (lineElements[0] === 'ENDWHILE') {
        main.push(`# Line ${lineInCode + 1} - End while \n`);
        
        main.push(endWhileStack.pop());
      } else if (lineElements[1] === ':=') {
        main.push(`# Line ${lineInCode + 1} - Assignment \n`);
        
        let threeAddr = Boolean(lineElements.length === 5);
        let res = lineElements[0]; 
        let el1 = lineElements[2];
        let el2 = lineElements[3];
        let op = lineElements[4];
        let opInstruction;
        let el1Type = 0;  // 0 - register $t, 1 - register $s7
        let el2Type = 0;  // 0 - register $t or integer, 1 - register $s6
        
        // creates lines of instrutions for assignments with 2 elements and 1 operador
        if (threeAddr) {
          switch (op) {
            case '+':
              opInstruction = 'add';
              break;
            case '-':
              opInstruction = 'sub';
              break;
            case '*':
              opInstruction = 'mul';
              break;
            case '/':
              opInstruction = 'div';
              break;
          }
          
          // change to register if FIRST element is a integer 
          if (/[0-9]/.test(el1[0])) {
            main.push(`addi $s7, $zero, ${el1}\n`);
            el1Type = 1;
          }
          // or a variable (label in mibs)
          else if (/[a-zA-Z_]/.test(el1[0])) {
            main.push(`lw $s7, ${el1}\n`);
            el1Type = 1;
          }
          
          // change to register if SECOND element is a variable (label in mips)
          if (/[a-zA-Z_]/.test(el2[0])) {
            main.push(`lw $s6, ${el2}\n`);
            el2Type = 1 
          }
          
          // execute operation and store result on a temporary register $t
          let firstElement = '';
          if (opInstruction !== 'div') {
            if (res[0] == '$') {
              firstElement = `${res}, `;
            } else {
              firstElement = '$s7, ';
            }
          }
          
          if (el1Type == 0 && el2Type == 0) {
            main.push(`${opInstruction} ${firstElement}${el1}, ${el2}\n`);
          } else if (el1Type == 0 && el2Type == 1) {
            main.push(`${opInstruction} ${firstElement}${el1}, $s6\n`);
          } else if (el1Type == 1 && el2Type == 0) {
            main.push(`${opInstruction} ${firstElement}$s7, ${el2}\n`);
          } else if (el1Type == 1 && el2Type == 1) {
            main.push(`${opInstruction} ${firstElement}$s7, $s6\n`);
          }
          
          if (opInstruction == 'div') {
            main.push(`mflo $s7\n`);
            main.push(`sw $s7, ${res}\n`);
          }
          
          if (firstElement == '$s7, ' && opInstruction != 'div')
            main.push(`sw $s7, ${res}\n`);
        }
        // creates lines of instrutions for simple assignment, just 1 element
        else {
          // puts first (and unique) element in register $t
          if (res[0] === "$") {
            if (/[0-9]/.test(el1[0]))
              main.push(`addi ${res}, $zero, ${el1}\n`);
            else
              main.push(`lw ${res}, ${el1}\n`);
          }
          // puts the element in a variable (label in mibs)
          else {
            if (/[0-9]/.test(el1[0]))
              main.push(`addi $s7, $zero, ${el1}\n`);
            else
              main.push(`lw $s7, ${el1}\n`);
            main.push(`sw $s7, ${res}\n`);
          }
        }
        
        main.push('\n');
      }
    }
    
    for (let item of data)
      this.finalCode = this.finalCode + item;
    
    for (let item of text)
      this.finalCode = this.finalCode + item;
    
    for (let item of main) 
      this.finalCode = this.finalCode + item;
      
    this.finalCode = this.finalCode + 'j finishProgram\n\n';
    
    for (let item of printValue)
      this.finalCode = this.finalCode + item;
    
    for (let item of printText)
      this.finalCode = this.finalCode + item;
    
    for (let item of userInput)
      this.finalCode = this.finalCode + item;
    
    for (let item of breakLine)
      this.finalCode = this.finalCode + item;
    
    for (let item of finishProgram)
      this.finalCode = this.finalCode + item;
    
    fs.writeFileSync(
      './assembly/' + this.finalFile,
      this.finalCode,
      (err) => { if (err) return console.log(err); }
    );
  }
}

module.exports = FinalAssembler;