class SyntaticAnalyser {
  constructor(args) {
    this.verbose = args.verbose;
    
    if (this.verbose) console.log('Syntatic Constructor.');
  }
  
  start() {
    if (this.verbose)
      console.log('Syntatic analyzer started sucessfully.');
  }
}

module.exports = SyntaticAnalyser;
