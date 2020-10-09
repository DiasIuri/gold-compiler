const fs = require('fs');

const LexicalAnalyzer = require('./lexicalAnalyzer');
const SyntacticAnalyzer = require('./syntacticAnalyzer');
const SemanticAnalyzer = require('./semanticAnalyzer');
const IntermediateAssembler = require('./intermediateAssembler');

class goldCompiler {
  constructor(args) {
    this.arguments = args;
    this.listTokens = args.includes('-all') || args.includes('-lt') || args.includes('--listTokens');
    this.listSyntactic = args.includes('-all') || args.includes('-ls') || args.includes('--listSyntactic');
    this.listSemantic = args.includes('-all') || args.includes('-lse') || args.includes('--listSemantic');
    this.listLog = args.includes('-all') || args.includes('-lgc') || args.includes('--listLog');
    this.verbose = args.includes('-v') || args.includes('--verbose');
    this.sourceFile = args.find((file) => file.includes('.gold'));
    this.goldConfigFile = '.goldconfig';
    this.intermediateFile = this.sourceFile.replace('.gold', '.igold');
  }

  start() {
    if (this.verbose) console.log('\nGold Compiler started sucessfully.');

    this.sanitizeGoldConfig();
    this.sanitizeSourceCode();
    this.sendDataToLexical();
    if (this.errors.length === 0) 
      this.sendDataToSyntactic();
    if (!this.errors)
      this.sendDataToSemantic();
    if (this.errors.length === 0)
      this.mountIntermediateCode();
    this.mountFinalCode();
  }

  sanitizeGoldConfig() {
    let content;
    let config_set = {};

    try {
      let file_content = fs.readFileSync(this.goldConfigFile, 'utf8');

      content = 
        file_content.
        split('$').
        filter((element) => element !== '').
        map((element) => element.split('\r\n'));

      for (let el_index in content) {
        config_set[content[el_index][0]] = content[el_index].filter(element => 
          (element != '' && element != content[el_index][0])
        );
      }

      // regex
      let pre_regex = {};
      let regex = {};

      for (let regex_index in config_set.regex) {
        let split = config_set.regex[regex_index].split(': ');
        let key = split[0];
        let value = split[1];
        
        pre_regex[key] = value;
        regex[key] = new RegExp(value);
      }

      config_set.regex = regex;

      // lexemes
      let lexemes = config_set.lexemes.map(element => {
        if (element.includes('N') || 
            element.includes('L') || 
            element.includes('WS') || 
            element.includes('#') || 
            element.includes('.')) {
          return (
            new RegExp(
              element.
              replace(/L/g, pre_regex['L']).
              replace(/N/g, pre_regex['N']).
              replace(/WS/g, pre_regex['WS']).
              replace(/#/g, pre_regex['#']).
              replace(/\./g, pre_regex['.'])
            )
          )
        } else
          return element;
      });

      config_set.lexemes = lexemes;

      // possible_states
      config_set.possible_states = config_set.possible_states[0].split('| ');
      
      // alphabet
      config_set.alphabet = config_set.alphabet[0].split('| ');
      
      // final_states
      config_set.final_states = config_set.final_states[0].split('| ');

      // final_states_tokens
      config_set.final_states_tokens = config_set.final_states_tokens[0].split('| ');

      // steps
      let stepsObj = {};
      let stepsArray = [];

      for (let step of config_set.steps) {
        let configuration = step.split(' ');
        let actual_state = configuration[0];
        let value = configuration[1];
        let next_state = configuration[2];
        
        stepsObj[([actual_state, value])] = next_state;
        stepsArray.push([ actual_state, value, next_state ]);
      }

      config_set.stepsObj = stepsObj;
      config_set.stepsArray = stepsArray;
      this.goldConfig = config_set;
      
      if (this.verbose) console.log(`File ${this.goldConfigFile} opened sucessfully.`);
    } catch {
      console.log(`Error opening ${this.goldConfigFile} file. Check the specified path.`);
    }
  }

  sanitizeSourceCode() {
    let content;
    let ignore = false;
    
    try {
      let file_content = fs.readFileSync(this.sourceFile, 'utf8');
      
      content = file_content.split('\n').map(element => element.replace('\r', ''));

      for (let row in content) {
        if ((content[row].trim() === '/*' && ignore === false) ||
            (content[row].trim() === '*/' && ignore === true) ||
            ignore === true) {
          if (content[row].trim() === '/*')
            ignore = true;
          else if (content[row].trim() === '*/')
            ignore = false;
          content[row] = '';
        }
      }

      this.sourceCode = content;
      
      if (this.verbose) console.log(`File ${this.sourceFile} opened sucessfully.`);
    } catch {
      console.log(`Error opening ${this.sourceFile} file. Check the specified path.`);
    }
  }

  sendDataToLexical() {
    this.lexical = new LexicalAnalyzer(this);
    this.lexical.start();
    this.tokensSet = this.lexical.resultSet;
    this.errors = this.lexical.errors;
  }
  
  sendDataToSyntactic() {
    this.syntactic = new SyntacticAnalyzer(this);
    this.syntactic.start();
    this.errors = this.syntactic.error;
  }
  
  sendDataToSemantic() {
    this.semantic = new SemanticAnalyzer(this);
    this.semantic.start();
    this.declaredIds = this.semantic.declared_ids_unique;
    this.errors = this.semantic.errors;
  }
  
  mountIntermediateCode() {
    this.intermediate = new IntermediateAssembler(this);
    this.intermediate.start();
  }
  
  mountFinalCode() {
    this.final = new FinalAssembler(this);
    this.final.start();
  }
}

const gold = new goldCompiler(process.argv);
gold.start();
