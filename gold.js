const fs = require('fs');

const LexicalAnalyser = require('./lexicalAnalyzer');
const SyntacticAnalyzer = require('./syntacticAnalyzer');
const SemanticAnalyzer = require('./semanticAnalyzer');

class goldCompiler {
  constructor(args) {
    this.arguments = args;
    this.listTokens = args.includes('-lt') || args.includes('--listTokens');
    this.verbose = args.includes('-v') || args.includes('--verbose');
    this.sourceFile = args.find((file) => file.includes('.gold'));
  }

  start() {
    if(this.verbose) console.log('Gold Compiler started sucessfully.');

    fs.readFile(this.sourceFile, 'utf8', (err, file_content) => {
      if (err)
        console.log('Error opening the file. Check the specified path.');
      else {
        this.file_content = file_content;
        this.sendDataToLexical(this);
      }
    });
  }

  sendDataToLexical(data) {
    const lexical = new LexicalAnalyser(data);
    lexical.start();
  }
}

const gold = new goldCompiler(process.argv);
gold.start();
