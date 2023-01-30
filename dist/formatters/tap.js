/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 897:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/**
 * @fileoverview TAP reporter
 * @author Jonathan Kingston
 */


const yaml = __nccwpck_require__(350);

//------------------------------------------------------------------------------
// Helper Functions
//------------------------------------------------------------------------------

/**
 * Returns a canonical error level string based upon the error message passed in.
 * @param {Object} message Individual error message provided by eslint
 * @returns {string} Error level string
 */
function getMessageType(message) {
    if (message.fatal || message.severity === 2) {
        return "error";
    }
    return "warning";
}

/**
 * Takes in a JavaScript object and outputs a TAP diagnostics string
 * @param {Object} diagnostic JavaScript object to be embedded as YAML into output.
 * @returns {string} diagnostics string with YAML embedded - TAP version 13 compliant
 */
function outputDiagnostics(diagnostic) {
    const prefix = "  ";
    let output = `${prefix}---\n`;

    output += prefix + yaml.dump(diagnostic).split("\n").join(`\n${prefix}`);
    output += "...\n";
    return output;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function(results) {
    let output = `TAP version 13\n1..${results.length}\n`;

    results.forEach((result, id) => {
        const messages = result.messages;
        let testResult = "ok";
        let diagnostics = {};

        if (messages.length > 0) {
            messages.forEach(message => {
                const severity = getMessageType(message);
                const diagnostic = {
                    message: message.message,
                    severity,
                    data: {
                        line: message.line || 0,
                        column: message.column || 0,
                        ruleId: message.ruleId || ""
                    }
                };

                // This ensures a warning message is not flagged as error
                if (severity === "error") {
                    testResult = "not ok";
                }

                /*
                 * If we have multiple messages place them under a messages key
                 * The first error will be logged as message key
                 * This is to adhere to TAP 13 loosely defined specification of having a message key
                 */
                if ("message" in diagnostics) {
                    if (typeof diagnostics.messages === "undefined") {
                        diagnostics.messages = [];
                    }
                    diagnostics.messages.push(diagnostic);
                } else {
                    diagnostics = diagnostic;
                }
            });
        }

        output += `${testResult} ${id + 1} - ${result.filePath}\n`;

        // If we have an error include diagnostics
        if (messages.length > 0) {
            output += outputDiagnostics(diagnostics);
        }

    });

    return output;
};


/***/ }),

/***/ 350:
/***/ ((module) => {

module.exports = eval("require")("js-yaml");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(897);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;