import fs from "fs";
import path from  "path";

function RemoveAfterEmit(params) {
  this.params = params;
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

RemoveAfterEmit.prototype.apply = function(compiler) {
  const params = this.params;
  let outputPath = "";
  try {
    outputPath = compiler.options.output.path;
  } catch(ex) {
    outputPath = "";
  }
  
  compiler.plugin("done", function(compilation) {
    outputPath = outputPath || compilation.compiler.outputPath;
    params.forEach(function(dir) {
      const completeDirPath = path.join(outputPath, dir);
      if (fs.existsSync(completeDirPath)) {
        rmdir(completeDirPath);
      }
    });
  });
};

module.exports = RemoveAfterEmit;