const fs = require('fs');

class LexicalAnalyser {
  constructor(args) {
    this.verbose = args.verbose;
    this.goldConfig = args.goldConfig;
    this.sourceCode = args.sourceCode;
    this.resultSet = [];
    
    if (this.verbose) console.log('Lexical Constructor.');
  }
  
  start() {
    if (this.verbose) console.log('Lexical analyzer started sucessfully.');
  }
}

module.exports = LexicalAnalyser;
