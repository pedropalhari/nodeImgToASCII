var fs = require("fs"),
  PNG = require("node-png").PNG;

const sharp = require("sharp");

//Transformer para fazer qualquer imagem virar png
const transformer = sharp()
  .resize(isNaN(parseInt(process.argv[3])) ? 100 : parseInt(process.argv[3]))
  .png();

//Tabela grayscale 0 -> 255 em passos de 25.5
let grayscaleConvert = [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"];

console.log();
fs.createReadStream(process.argv[2])
  .pipe(transformer)
  .pipe(
    new PNG({
      filterType: 4
    })
  )
  .on("parsed", function() {
    for (var y = 0; y < this.height - 2; y += 3) {
      let line = "";
      for (var x = 0; x < this.width; x++) {
        //Processando 3 pixels verticais de uma vez (y + 1) para manter o tamanho
        //Aprox da imagem
        let grayscaleSum = 0;
        for (let i = 0; i < 3; i++) {
          //Vai de 4 em 4 bytes
          let idx = (this.width * (y + i) + x) << 2; //Mesma coisa que * 4

          //32bits de informação no data, 0 - R, 1 - G, 2 - B, 3 - ALPHA
          let red = this.data[idx];
          let green = this.data[idx + 1];
          let blue = this.data[idx + 2];

          //Vai juntando a soma de 4 linhas de pixels
          //grayscale image = ( (0.3 * R) + (0.59 * G) + (0.11 * B) )
          grayscaleSum += red * 0.3 + green * 0.59 + blue * 0.11;
        }

        //grayscale image = ( (0.3 * R) + (0.59 * G) + (0.11 * B) )
        let grayscale = Math.floor(grayscaleSum / ((255.0 / 10.0) * 3));

        //console.log(grayscale);
        //Concatena o caractere
        line += grayscaleConvert[grayscale > 9 ? 9 : grayscale]; 
      }
      console.log(line);
    }
    console.log();
  });
