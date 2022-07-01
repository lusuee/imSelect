const child_process = require("child_process");
// const path = "/opt/homebrew/bin/im-select";
const path = "/usr/local/bin/im-select";
let isRun = false;
let insertMode = false;
let im;
let imDefault = "com.apple.keylayout.ABC";

function plugin(CodeMirror) {
  if (isRun) return;

  let old = CodeMirror.Vim.findKey;
  CodeMirror.Vim.findKey = function (cm, key, origin) {
    switchInputMethod(key);
    return old(cm, key, origin);
  };

  isRun = true;
}

async function switchInputMethod(key) {
  if (insertMode && key === "<Esc>") {
    im = await getIm();
    if (im.trim() !== imDefault) {
      switchIm(imDefault);
    }
    insertMode = false;
  } else if (
    !insertMode &&
    (key === "i" ||
      key === "I" ||
      key === "a" ||
      key === "A" ||
      key === "o" ||
      key === "O" ||
      key === "s" ||
      key === "S")
  ) {
    resumeIm();
    insertMode = true;
  }
}

async function getIm() {
  return executeShell(`${path}`);
}

async function resumeIm() {
  if (!im) {
    im = imDefault;
  }
  switchIm(im);
}

async function switchIm(imName) {
  executeShell(`${path} ${imName}`);
}

async function executeShell(cmd) {
  return new Promise((resolve, reject) => {
    try {
      child_process.exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  default: function (_context) {
    return {
      plugin: plugin,
    };
  },
};
