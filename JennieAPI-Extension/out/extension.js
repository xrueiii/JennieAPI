"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const generateApiJson_1 = require("./commands/generateApiJson");
const suggestApiEndpoint_1 = require("./commands/suggestApiEndpoint");
const openTestWeb_1 = require("./commands/openTestWeb");
function activate(context) {
    (0, generateApiJson_1.registerGenerateApiJsonCommand)(context);
    (0, suggestApiEndpoint_1.registerSuggestApiEndpointCommand)(context);
    (0, openTestWeb_1.registerOpenWebCommand)(context);
}
//# sourceMappingURL=extension.js.map