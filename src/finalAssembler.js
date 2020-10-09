class FinalAssembler {
  constructor(args) {
    this.verbose = args.verbose;
    this.intermediateCode = args.intermediateCode;
  }
  
  start() {
    if (this.verbose)
      console.log('Final Code Assembler started sucessfully.');
  }
}