class SemanticAnalyzer {
  constructor(args) {
    this.verbose = args.verbose;
    
    if (this.verbose) console.log('Semantic Constructor.');
  }
  
  start() {
    if (this.verbose)
      console.log('Semantic analyzer started sucessfully.');
  }
}

module.exports = SemanticAnalyzer;
