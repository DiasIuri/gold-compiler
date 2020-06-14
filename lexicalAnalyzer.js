class LexicalAnalyser {
  constructor(args){
    this.verbose = args.verbose;
    this.file_content = args.file_content;
    this.resultSet = [];
    if(this.verbose) console.log('Lexical Constructor.');
  }
  
  start(){
    var content;
    var ignore = false;

    if(this.verbose) console.log('Lexical analyzer started sucessfully.');

    // Ignora os comentários e remove espaços vazios no início e fim do código
    //content = this.file_content.replace(/\/\*(\*(?!\/)|[^*])*\*\//, '').trim();
    
    // Separa o código fonte por linha
    content = this.file_content.split('\n');

    content = content.map(element => element.replace('\r', ''));

    for (var row in content) {
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

    console.log(content);
  }
}

module.exports = LexicalAnalyser;
