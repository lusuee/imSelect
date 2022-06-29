const child_process = require("child_process");
const util = require("util");
const path = "/opt/homebrew/bin/im-select";
let isRun = false;

function plugin(CodeMirror) {
	if (isRun) return;

	let im;
	let imDefault = "com.apple.keylayout.ABC";
	let i = util.promisify(imChange);
	let old = CodeMirror.Vim.findKey;
	CodeMirror.Vim.findKey = function (cm, key, origin) {
		let p = old(cm, key, origin);
		i(key);
		return p;
	};

	function imChange(key) {
		if (key === "<Esc>") {
			child_process.exec(
				path,
				{ shell: "/bin/zsh", timeout: 500, windowsHide: true },
				(err, stdout, stderr) => {
					im = stdout;
				}
			);
			child_process.exec(path + " " + imDefault, {
				shell: "/bin/zsh",
				timeout: 500,
				windowsHide: true,
			});
		} else if (
			key === "i" ||
			key === "I" ||
			key === "a" ||
			key === "A" ||
			key === "o" ||
			key === "O" ||
			key === "s" ||
			key === "S"
		) {
			if (!im) {
				im = imDefault;
			}
			child_process.exec(path + " " + im, {
				shell: "/bin/zsh",
				timeout: 500,
				windowsHide: true,
			});
		}
	}

	isRun = true;
}

module.exports = {
	default: function (_context) {
		return {
			plugin: plugin,
		};
	},
};