const fs = require('fs');

class LexicalAnalyser {
  constructor(args) {
    this.verbose = args.verbose;
    this.goldConfig = args.goldConfig;
    this.sourceCode = args.sourceCode;
    this.listTokens = args.listTokens;
    this.resultSet = [];
    this.errors = [];
    
    if (this.verbose) console.log('Lexical Constructor.');
  }
  
  start() {
    if (this.verbose) console.log('Lexical analyzer started sucessfully.\n');

    let steps = filtered_steps(this.goldConfig.stepsArray);

    let current_state;
    let previous_state;
    let next_state;
    
    let line;
    let char;
    let previous_char;
    
    let new_token = true;
    let token_init;
    let lexeme;

    for (let line_index in this.sourceCode) {
      if (!new_token) {
        let token = this.goldConfig.final_states_tokens[this.goldConfig.final_states.indexOf(current_state)];

        this.resultSet.push({
          token: token,
          lexeme: lexeme,
          line: +line_index,
          column: token_init
        });
      }

      line = this.sourceCode[line_index];
      char = '\n';
      new_token = true;
      
      for (let char_index = 0; char_index < line.length; char_index++) {
        if (new_token) {
          previous_state = null;
          current_state = this.goldConfig.initial_state[0];
          next_state = null;

          token_init = char_index + 1;
          lexeme = '';
        }
        

        previous_char = char;
        char = line[char_index];

        if (steps.hasOwnProperty(current_state) && steps[current_state].includes(char)) {
          lexeme = lexeme + char;
          new_token = false;
          
          next_state = this.goldConfig.stepsObj[current_state + ',' + char];
          previous_state = current_state;
          current_state = next_state;
        } else {
          let char_accepted = false;

          if (steps.hasOwnProperty(current_state)) {
            for (let prop in this.goldConfig.regex) {
              if (steps[current_state].includes(prop) && this.goldConfig.regex[prop].test(char)) {
                lexeme = lexeme + char;
                new_token = false;
  
                next_state = this.goldConfig.stepsObj[current_state + ',' + prop];
                previous_state = current_state;
                current_state = next_state;
  
                char_accepted = true;
  
                break;
              }
            }
          }

          if (!char_accepted) {
            if (!this.goldConfig.regex['WS'].test(char)) {
              if (this.goldConfig.final_states.includes(current_state)) {
                let token = this.goldConfig.final_states_tokens[this.goldConfig.final_states.indexOf(current_state)];
                
                this.resultSet.push({
                  token: token,
                  lexeme: lexeme,
                  line: +line_index + 1,
                  column: token_init
                });

                new_token = true;
                char_index--;
              } else {
                this.errors.push({
                  error: `Erro léxico: token inválido na linha ${+line_index + 1} coluna ${token_init}.`,
                  incorrect_lexeme:  lexeme + char
                });

                new_token = true;
              }
            } else {
              if (this.goldConfig.final_states.includes(current_state)) {
                let token = this.goldConfig.final_states_tokens[this.goldConfig.final_states.indexOf(current_state)];
                
                this.resultSet.push({
                  token: token,
                  lexeme: lexeme,
                  line: +line_index + 1,
                  column: token_init
                });

                new_token = true;
              } else if (!this.goldConfig.regex['WS'].test(previous_char)) {
                this.errors.push({
                  error: `Erro léxico: token inválido na linha ${+line_index + 1} coluna ${token_init}.`,
                  incorrect_lexeme:  lexeme + char
                });

                new_token = true;
              }
            }
          }
        }
      }
    }

    if (this.listTokens) console.log(this.resultSet);
    console.log(this.errors);
    console.log('\n');
  }
}

function filtered_steps(stepsArray) {
  let filtered_steps = {};

  for (let step of stepsArray) {
    if (filtered_steps.hasOwnProperty(step[0]))
      filtered_steps[step[0]].push(step[1]);
    else
      filtered_steps[step[0]] = [step[1]];
  }

  return filtered_steps;
}

module.exports = LexicalAnalyser;
