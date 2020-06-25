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
    if (this.verbose) console.log('Lexical analyzer started sucessfully.');

    try {
      mountLexicalSet(this);
    } catch(err) {
      console.log('\nError when mounting the lexical set.\n', err);
    }
  }
}

function mountLexicalSet(configObj) {
  let steps = filtered_steps(configObj.goldConfig.stepsArray);

  let current_state;
  let previous_state;
  let next_state;
    
  let row;
  let char;
  let previous_char;
    
  let new_token = true;
  let token_init;
  let lexeme;

  for (let row_index in configObj.sourceCode) {
    if (!new_token) {
      if (lexeme[0] == "'") {
        configObj.errors.push({
          error: 'Lexical error',
          error_code: 1,
          row: +row_index,
          column: token_init,
          incorrect_lexeme: lexeme
        });
      } else {
        let token = configObj.goldConfig.final_states_tokens[
          configObj.goldConfig.final_states.indexOf(current_state)
        ];
  
        configObj.resultSet.push({
          token: token,
          lexeme: lexeme,
          row: +row_index, // parseInt(row_index)
          column: token_init
        });
      }
    }

    row = configObj.sourceCode[row_index];
    char = '\n';
    new_token = true;
    
    for (let char_index = 0; char_index < row.length; char_index++) {
      if (new_token) {
        previous_state = null;
        current_state = configObj.goldConfig.initial_state[0];
        next_state = null;

        token_init = char_index + 1;
        lexeme = '';
      }
      
      previous_char = char;
      // Seleciona um novo caractere
      char = row[char_index];

      // Busca todos caracteres disponíveis para estado atual
      // com excessão daqueles que são chaves de regex
      // Se o caractere for válido segue para o próximo estado
      if (steps.hasOwnProperty(current_state)
        && !configObj.goldConfig.regex.hasOwnProperty(char)
        && steps[current_state].includes(char)) {
        lexeme = lexeme + char;
        new_token = false;
        
        next_state = configObj.goldConfig.stepsObj[current_state + ',' + char];
        previous_state = current_state;
        current_state = next_state;
      
      // Trata as situações em que o caractere
      // não é válido para o estado atual
      } else {
        // Flag utilizada para verificar se o caractere
        // é válido em um grupo de regex
        let char_accepted = false;

        // Verifica se o caractere se enquadra nos grupos de regex 
        // L, N, # ou . sendo que (L e N podem ser # ou .)
        if (steps.hasOwnProperty(current_state)) {
          for (let prop in configObj.goldConfig.regex) {
            // Se o caractere for válido segue para o próximo estado 
            if (steps[current_state].includes(prop)
              && configObj.goldConfig.regex[prop].test(char)) {
              lexeme = lexeme + char;
              new_token = false;

              next_state = configObj.goldConfig.stepsObj[current_state + ',' + prop];
              previous_state = current_state;
              current_state = next_state;

              char_accepted = true;

              break;
            }
          }
        }

        if (!char_accepted) {
          // Verifica se o caractere não é um white space
          if (!configObj.goldConfig.regex['WS'].test(char)) {
            // Se o caractere for válido segue para o próximo estado
            if (configObj.goldConfig.final_states.includes(current_state)) {
              // Insere o token no conjunto resultado e inicia um novo token
              // verificando novamente o caractere atual
              let token = configObj.goldConfig.final_states_tokens[
                configObj.goldConfig.final_states.indexOf(current_state)
              ];
              
              configObj.resultSet.push({
                token: token,
                lexeme: lexeme,
                row: +row_index + 1, // parseInt(row_index + 1)
                column: token_init
              });

              new_token = true;
              char_index--;
            } else {
              // Insere o caractere no conjunto de erros e inicia um novo token
              
              configObj.errors.push({
                error: 'Lexical error',
                error_code: 0,
                row: +row_index + 1,
                column: token_init,
                incorrect_lexeme: lexeme + char
              });

              new_token = true;
            }

          // Se o caractere for um white space
          } else {
            // Verifica se finalizou um token válido
            if (configObj.goldConfig.final_states.includes(current_state)) {
              // Insere o token no conjunto resultado e inicia um novo token

              let token = configObj.goldConfig.final_states_tokens[
                configObj.goldConfig.final_states.indexOf(current_state)
              ];
              
              configObj.resultSet.push({
                token: token,
                lexeme: lexeme,
                row: +row_index + 1, // parseInt(row_index + 1)
                column: token_init
              });

              new_token = true;

            // Se não finalizou um token válido e o último caractere
            // também não é um white space
            } else if (!configObj.goldConfig.regex['WS'].test(previous_char)) {
              // Insere o caractere no conjunto de erros e inicia um novo token
              
              configObj.errors.push({
                error: 'Lexical error',
                error_code: 0,
                row: +row_index + 1,
                column: token_init,
                incorrect_lexeme: lexeme + char
              });

              new_token = true;
            }
          }
        }
      }
    }
  }

  if (configObj.listTokens)
    listTokens(configObj.resultSet, configObj.errors);
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

function listTokens(resultSet, errors) {
  if (resultSet.length) {
    let ws = ' ';
    console.log('\n');
    console.log(
      '|       \x1b[31m TOKEN \x1b[0m        ' + 
      '| \x1b[32m LEXEME \x1b[0m ' +
      '| \x1b[33m ROW \x1b[0m ' +
      '| \x1b[33m COLUMN \x1b[0m |');
    console.log('-'.repeat(54));

    for (let item of resultSet)
      console.log(
        `|  \x1b[31m${item.token}\x1b[0m${ws.repeat(18 - item.token.length)}  |  \x1b[32m${item.lexeme}\x1b[0m  |  \x1b[33m${item.row}\x1b[0m  |  \x1b[33m${item.column}\x1b[0m  |`
      );

    if (errors.length) listErrors(errors);

    console.log('\n');
  }
}

function listErrors(errors) {
  console.log('\n-- Errors --');

  for (let item of errors) {
    switch (item.error_code) {
      case 0:
        console.log(
          `${item.error}: The token associated with the lexeme (\x1b[32m${item.incorrect_lexeme}\x1b[0m) of row \x1b[33m${item.row}\x1b[0m and column \x1b[33m${item.column}\x1b[0m could not be found.`
        );
        break;
      case 1:
        console.log(
          `${item.error}: The end of the string lexeme (\x1b[32m'\x1b[0m) could not be found in lexeme (\x1b[32m${item.incorrect_lexeme}\x1b[0m) of row \x1b[33m${item.row}\x1b[0m and column \x1b[33m${item.column}\x1b[0m.`
        );
        break;
    }    
  }
}

module.exports = LexicalAnalyser;
