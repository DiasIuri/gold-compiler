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
    this.goldConfigFile = '.goldconfig';
  }

  start() {
    if (this.verbose) console.log('Gold Compiler started sucessfully.');

    this.sanitizeGoldConfig();
    this.sanitizeSourceCode();
  }

  sanitizeGoldConfig() {
    let content;
    let config_set = {};  

    fs.readFile(this.goldConfigFile, 'utf8', (err, file_content) => {
      if (err)
        console.log(`Error opening ${this.goldConfigFile} file. Check the specified path.`);
      else {
        if (this.verbose) console.log(`File ${this.goldConfigFile} opened sucessfully.`);
       
        content = 
          file_content.
          split('$').
          filter((element) => element != '').
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

        // steps


        console.log(config_set);

        this.goldConfig = config_set;
      }
    });
  }

  sanitizeSourceCode() {
    let content;
    let ignore = false;

    fs.readFile(this.sourceFile, 'utf8', (err, file_content) => {
      if (err)
        console.log(`Error opening ${this.sourceFile} file. Check the specified path.`);
      else {
        if (this.verbose) console.log(`File ${this.sourceFile} opened sucessfully.`);

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
        this.sendDataToLexical();
      }
    });
  }

  sendDataToLexical() {
    const lexical = new LexicalAnalyser(this);
    lexical.start();
  }
}

const gold = new goldCompiler(process.argv);
gold.start();
