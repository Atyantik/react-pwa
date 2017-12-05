import fs from "fs";
import path from "path";

function MoveAfterEmit(params) {
  this.params = params;
}

function copyFileSync( source, target ) {
  
  let targetFile = target;
  
  //if target is a directory a new file with the same name will be created
  if ( fs.existsSync( target ) ) {
    if ( fs.lstatSync( target ).isDirectory() ) {
      targetFile = path.join( target, path.basename( source ) );
    }
  }
  
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
  let files = [];
  
  //check if folder needs to be created or integrated
  let targetFolder = path.join( target, path.basename( source ) );
  if ( !fs.existsSync( targetFolder ) ) {
    fs.mkdirSync( targetFolder );
  }
  
  //copy
  if ( fs.lstatSync( source ).isDirectory() ) {
    files = fs.readdirSync( source );
    files.forEach( function ( file ) {
      let curSource = path.join( source, file );
      if ( fs.lstatSync( curSource ).isDirectory() ) {
        copyFolderRecursiveSync( curSource, targetFolder );
      } else {
        copyFileSync( curSource, targetFolder );
      }
    } );
  }
}

const rmdir = function(dir) {
  let list = fs.readdirSync(dir);
  for(let i = 0; i < list.length; i++) {
    const filename = path.join(dir, list[i]);
    const stat = fs.statSync(filename);
    
    if(filename === "." || filename === "..") {
      // pass these files
    } else if(stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename);
    } else {
      // rm fiilename
      fs.unlinkSync(filename);
    }
  }
  fs.rmdirSync(dir);
};

MoveAfterEmit.prototype.apply = function(compiler) {
  const params = this.params;
  let outputPath = "";
  try {
    outputPath = compiler.options.output.path;
  } catch(ex) {
    outputPath = "";
  }
  
  compiler.plugin("done", function(compilation) {
    outputPath = outputPath || compilation.compiler.outputPath;
    params.forEach(function({ from, to }) {
      
      const completeFromPath = path.join(outputPath, from);
      const completeToPath = path.join(outputPath, to);
      if (fs.existsSync(completeFromPath)) {
        copyFolderRecursiveSync(completeFromPath, completeToPath);
        rmdir(completeFromPath);
      }
    });
  });
};

module.exports = MoveAfterEmit;