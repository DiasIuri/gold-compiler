class SemanticAnalyzer {
  constructor(args) {
    this.verbose = args.verbose;
    this.listSemantic = args.listSemantic;
    this.tokensSet = args.tokensSet;
    this.errors = [];
  }
  
  start() {
    if (this.verbose)
      console.log('Semantic analyzer started sucessfully.');
      
    const begin_index = this.tokensSet.findIndex(item => item.token == 'begin');
    
    const declared_ids = this.tokensSet.filter((item, item_index) =>
      item.token == 'id' && item_index < begin_index
    );
    const ids_in_body = this.tokensSet.filter((item, item_index) =>
      item.token == 'id' && item_index > begin_index
    );
    
    const declared_ids_lexemes = [];
    const ids_in_body_unique = [];
    const assignment_ids = [];
    const assignments = [];
    const ids_values = {};
    
    this.declared_ids_unique = [];
    
    for (let id of declared_ids) {
      declared_ids_lexemes.push(id.lexeme);
      
      if (!ids_values.hasOwnProperty(id.lexeme))
        ids_values[id.lexeme] = '';
    }
    
    for (let id of ids_in_body) {
      if (!ids_in_body_unique.some(item => item.lexeme == id.lexeme))
        ids_in_body_unique.push(id);
    }
    
    for (let id of declared_ids_lexemes) {
      if (!this.declared_ids_unique.some(item => item == id))
        this.declared_ids_unique.push(id);
    }
    
    // verificação de declaração duplicada
    declared_ids_lexemes.forEach((item, item_index) => {
      if (declared_ids_lexemes.indexOf(item) != item_index) {
        this.errors.push({
          error: 'Semantic error',
          error_code: 0,
          lexeme: declared_ids[item_index].lexeme,
          message: 'duplicated',
          row: declared_ids[item_index].row,
          column: declared_ids[item_index].column
        });
      }
    });
    
    // verificação do uso de variáveis não declaradas
    ids_in_body_unique.forEach(item => {
      if (!declared_ids.some(item_declared => item_declared.lexeme == item.lexeme)) {
        this.errors.push({
          error: 'Semantic error',
          error_code: 1,
          lexeme: item.lexeme,
          message: 'was not declared',
          row: item.row,
          column: item.column
        });
      }
    });
    
    // verificação de divisão por zero
    this.tokensSet.forEach((item, item_index) => {
      let next_item = this.tokensSet[item_index + 1];
      let another_next_item = this.tokensSet[item_index + 2];
      
      // verificação de divisão explícita por zero
      if (item.token == 'div' && next_item.lexeme == 0) {
        this.errors.push({
          error: 'Semantic error',
          error_code: 2,
          lexeme: next_item.lexeme,
          message: 'division by zero',
          row: next_item.row,
          column: next_item.column
        });
      } else if (item.token == 'div' && next_item.token == 'sub' && another_next_item.lexeme == 0) {
        this.errors.push({
          error: 'Semantic error',
          error_code: 2,
          lexeme: next_item.lexeme + another_next_item.lexeme,
          message: 'division by zero',
          row: next_item.row,
          column: next_item.column
        });
      }
      
      // atribuição de valores para variáveis, ignorando expressões complexas e entradas do teclado
      else if (item.token == 'id' && next_item.token == 'assignment') {
        let current_token = another_next_item;
        let current_assignment_list = [];
        
        for (let i = 3; current_token.token != 'dotcomma'; i++) {
          current_assignment_list.push(current_token);
          current_token = this.tokensSet[item_index + i];
        }
        
        let length = current_assignment_list.length;
        if (!(length == 1 || (length == 2 && current_assignment_list[0].token == 'sub'))) {
          current_assignment_list = [{
            token: 'math_expression',
            lexeme: 'ignore',
            row: current_assignment_list[0].row,
            column: current_assignment_list[0].column
          }];
          
          ids_values[item.lexeme] = 'ignore';
        } else {
          if (length == 1 && current_assignment_list[0].token == 'id') {
            if (ids_values[current_assignment_list[0].lexeme] != 'ignore')
              ids_values[item.lexeme] = Number(ids_values[current_assignment_list[0].lexeme]);
            else
              ids_values[item.lexeme] = 'ignore';
          } else if (length == 1 && current_assignment_list[0].token == 'number') {
            if (current_assignment_list[0].lexeme != 'ignore')
              ids_values[item.lexeme] = Number(current_assignment_list[0].lexeme);
            else
              ids_values[item.lexeme] = 'ignore';
          } else if (length == 2 && current_assignment_list[1].token == 'id') {
            if (ids_values[current_assignment_list[1].lexeme] != 'ignore')
              ids_values[item.lexeme] = Number('-' + ids_values[current_assignment_list[1].lexeme]);
            else
              ids_values[item.lexeme] = 'ignore';
          } else if (length == 2 && current_assignment_list[1].token == 'number') {
            if (current_assignment_list[1].lexeme != 'ignore')
              ids_values[item.lexeme] = Number('-' + current_assignment_list[1].lexeme);
            else
              ids_values[item.lexeme] = 'ignore';
          }
        }
        
        assignment_ids.push(item);
        assignments.push(current_assignment_list);
      } else if (item.token == 'id' && item_index > begin_index && this.tokensSet[item_index - 2].token == 'in') {
        assignment_ids.push(item);
        assignments.push([{
          token: 'in',
          lexeme: 'ignore',
          row: item.row,
          column: item.column
        }]);
        
        ids_values[item.lexeme] = 'ignore';
      }
      
      // verificação de divisão implícita por zero, 
      else if (
        item.token == 'div' &&
        ((next_item.token == 'id' &&
        (ids_values[next_item.lexeme] == 0)) ||
        (next_item.token == 'sub' &&
        another_next_item.token == 'id' &&
        ids_values[another_next_item.lexeme] == 0))) 
      {
        this.errors.push({
          error: 'Semantic error',
          error_code: 3,
          lexeme: next_item.lexeme,
          message: 'division by id equal to zero',
          row: next_item.row,
          column: next_item.column
        });
      }
    });
    
    if (this.listSemantic)
      this.showSemanticList();
      
    if (this.errors.length)
      this.showErrorsList();
  }
  
  showSemanticList() {
    console.log('\nIds successfully declared: ');
    
    for (let id of this.declared_ids_unique)
      console.log(id);
      
    console.log('\n');
  }
  
  showErrorsList() {
    console.log('\n-- Errors --');
    
    for (let item of this.errors) {
      switch (item.error_code) {
        case 0:
          console.log(
            `${item.error}: id (\x1b[32m${item.lexeme}\x1b[0m) in row \x1b[33m${item.row}\x1b[0m and column \x1b[33m${item.column}\x1b[0m are \x1b[31m${item.message}\x1b[0m.`
          );
          break;
        case 1:
          console.log(
            `${item.error}: id (\x1b[32m${item.lexeme}\x1b[0m) in row \x1b[33m${item.row}\x1b[0m and column \x1b[33m${item.column}\x1b[0m \x1b[31m${item.message}\x1b[0m.`
          );
          break;
        case 2:
          console.log(
            `${item.error}: \x1b[31m${item.message}\x1b[0m in row \x1b[33m${item.row}\x1b[0m and column \x1b[33m${item.column}\x1b[0m.`
          );
          break;
        case 3:
          console.log(
            `${item.error}: \x1b[31m${item.message}\x1b[0m in row \x1b[33m${item.row}\x1b[0m and column \x1b[33m${item.column}\x1b[0m.`
          );
          break;
      }    
    }
  }
}

module.exports = SemanticAnalyzer;
