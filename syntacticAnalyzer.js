class SyntaticAnalyzer {
  constructor(args) {
    this.verbose = args.verbose;
    this.listSyntactic = args.listSyntactic;
    this.tokensSet = args.tokensSet;
    
    if (this.verbose) console.log('Syntatic Constructor.');
  }
  
  start() {
    const LL1_syntactic_table = {
      '<PROGRAM>var': '0',
      '<VARIABLES>id': '1',
      '<VARIABLES>begin': '2',
      '<VARIABLE_LIST>comma': '3',
      '<VARIABLE_LIST>dotcomma': '4',
      '<STATEMENTS>$': '6',
      '<STATEMENTS>id': '5',
      '<STATEMENTS>if': '5',
      '<STATEMENTS>while': '5',
      '<STATEMENTS>in': '5',
      '<STATEMENTS>out': '5',
      '<STATEMENTS>closeCurlyBrackets': '6',
      '<STATEMENT>id': '9',
      '<STATEMENT>if': '11',
      '<STATEMENT>while': '10',
      '<STATEMENT>in': '8',
      '<STATEMENT>out': '7',
      '<IF_STATEMENT>if': '12',
      '<ELSE_IF_LIST>$': '14',
      '<ELSE_IF_LIST>id': '14',
      '<ELSE_IF_LIST>if': '14',
      '<ELSE_IF_LIST>else': '13',
      '<ELSE_IF_LIST>while': '14',
      '<ELSE_IF_LIST>in': '14',
      '<ELSE_IF_LIST>out': '14',
      '<ELSE_IF_LIST>closeCurlyBrackets': '14',
      '<ELSE_IF>if': '16',
      '<ELSE_IF>openCurlyBrackets': '15',
      '<VALUE>id': '26',
      '<VALUE>number': '26',
      '<VALUE>openParenthesis': '26',
      '<VALUE>sub': '26',
      '<SIGNAL>id': '22',
      '<SIGNAL>number': '22',
      '<SIGNAL>openParenthesis': '22',
      '<SIGNAL>sub': '21',
      '<ELEMENT>id': '23',
      '<ELEMENT>number': '24',
      '<ELEMENT>openParenthesis': '25',
      '<OUT_ARGUMENT>id': '18',
      '<OUT_ARGUMENT>text': '17',
      '<OUT_ARGUMENT_LIST>comma': '19',
      '<OUT_ARGUMENT_LIST>closeParenthesis': '20',
      '<LOGICAL_EXPRESSION>id': '27',
      '<LOGICAL_EXPRESSION>number': '27',
      '<LOGICAL_EXPRESSION>openParenthesis': '27',
      '<LOGICAL_EXPRESSION>sub': '27',
      '<LOGICAL_OPERATOR>less_than': '28',
      '<LOGICAL_OPERATOR>greater_than': '29',
      '<LOGICAL_OPERATOR>less_or_equal': '30',
      '<LOGICAL_OPERATOR>greater_or_equal': '31',
      '<LOGICAL_OPERATOR>equal': '32',
      '<LOGICAL_OPERATOR>different': '33',
      '<MATH_EXPRESSION>id': '34',
      '<MATH_EXPRESSION>number': '34',
      '<MATH_EXPRESSION>openParenthesis': '34',
      '<MATH_EXPRESSION>sub': '34',
      '<MATH_OPERATOR>add': '35',
      '<MATH_OPERATOR>sub': '36',
      '<MATH_OPERATOR>mult': '37',
      '<MATH_OPERATOR>div': '38'
    };
    const LL1_functions = {
      '0': ['var', '<VARIABLES>', 'begin', '<STATEMENTS>'],
      '1': ['id', '<VARIABLE_LIST>', 'dotcomma'],
      '2': ['î'],
      '3': ['comma', 'id', '<VARIABLE_LIST>'],
      '4': ['î'],
      '5': ['<STATEMENT>', '<STATEMENTS>'],
      '6': ['î'],
      '7': ['out', 'openParenthesis', '<OUT_ARGUMENT>', '<OUT_ARGUMENT_LIST>', 'closeParenthesis', 'dotcomma'],
      '8': ['in', 'openParenthesis', 'id', 'closeParenthesis', 'dotcomma'],
      '9': ['id', 'assignment', '<VALUE>', 'dotcomma'],
      '10': ['while', 'openParenthesis', '<LOGICAL_EXPRESSION>', 'closeParenthesis', 'openCurlyBrackets', '<STATEMENTS>', 'closeCurlyBrackets'],
      '11': ['<IF_STATEMENT>'],
      '12': ['if', 'openParenthesis', '<LOGICAL_EXPRESSION>', 'closeParenthesis', 'openCurlyBrackets', '<STATEMENTS>', 'closeCurlyBrackets', '<ELSE_IF_LIST>'],
      '13': ['else', '<ELSE_IF>'],
      '14': ['î'],
      '15': ['openCurlyBrackets', '<STATEMENTS>', 'closeCurlyBrackets'],
      '16': ['<IF_STATEMENT>'],
      '17': ['text'],
      '18': ['id'],
      '19': ['comma', '<OUT_ARGUMENT>', '<OUT_ARGUMENT_LIST>'],
      '20': ['î'],
      '21': ['sub'],
      '22': ['î'],
      '23': ['id'],
      '24': ['number'],
      '25': ['openParenthesis', '<MATH_EXPRESSION>', 'closeParenthesis'],
      '26': ['<SIGNAL>', '<ELEMENT>'],
      '27': ['<VALUE>', '<LOGICAL_OPERATOR>', '<VALUE>'],
      '28': ['less_than'],
      '29': ['greater_than'],
      '30': ['less_or_equal'],
      '31': ['greater_or_equal'],
      '32': ['equal'],
      '33': ['different'],
      '34': ['<VALUE>', '<MATH_OPERATOR>', '<VALUE>'],
      '35': ['add'],
      '36': ['sub'],
      '37': ['mult'],
      '38': ['div']
    };
    
    if (this.verbose)
      console.log('Syntatic analyzer started sucessfully.');
    
    let tokens = this.tokensSet;
    let stack = [];
    let i = 0;
    
    tokens.push({
      'token': '$',
      'row': this.tokensSet[this.tokensSet.length-1].row + 1,
      'column': 1
    });
    
    stack = ['$', '<PROGRAM>'];
    
    while (tokens) {
      if (this.listSyntactic) {
        let tokens_to_show = tokens.slice(0, 7);
        let tokens_to_show_array = [];
        
        for (let token of tokens_to_show)
          tokens_to_show_array.push(token['token']);
          
        console.log('\n\x1b[33mSTEP: \x1b[0m', i);
        console.log('\x1b[32mSTACK: \x1b[0m', stack);
        console.log('\x1b[31mTOKENS: \x1b[0m', tokens_to_show_array);
      }
      
      let top_stack = stack.pop();
      let first_token = tokens[0];
      
      if (top_stack == '$' && top_stack == first_token.token) {
        if (this.listSyntactic) console.log('Syntax analisys completed successfully.\n');
        break;
      } else if (top_stack == first_token.token) {
        tokens.shift().token;
        if (this.listSyntactic) console.log(`Top of stack (\x1b[32m${top_stack}\x1b[0m) REMOVED for equality.`);
      } else {
        try {
          let function_key = LL1_syntactic_table[top_stack + first_token.token];
          let function_value = LL1_functions[function_key];
          
          if (function_value.includes('î')) {
            if (this.listSyntactic) {
              console.log(`\x1b[32m${top_stack}\x1b[0m\x1b[31m${first_token.token}\x1b[0m: ${function_key} -> ${function_value}`);
              console.log(`Top of stack (\x1b[32m${top_stack}\x1b[0m) REMOVED for empty symbol.`);
            }
          } else {
            if (this.listSyntactic)
              console.log(`[${function_value}] STACKED.`);
            
            stack = stack.concat(function_value.reverse());
            function_value.reverse();
          }
        } catch (err) {
          this.error = {
            error: 'Syntax error',
            message: 'Invalid or unexpected token',
            token: first_token.token,
            row: first_token.row,
            column: first_token.column
          };
          
          console.log(`${this.error.error}: ${this.error.message} (\x1b[31m${this.error.token}\x1b[0m) in line \x1b[33m${this.error.row}\x1b[0m column \x1b[33m${this.error.column}\x1b[0m.\n`);
          break;
        }
      }
      
      i++;
    }
  }
}

module.exports = SyntaticAnalyzer;
