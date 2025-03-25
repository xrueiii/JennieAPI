import * as vscode from 'vscode';
import { registerGenerateApiJsonCommand } from './commands/generateApiJson';
import { registerSuggestApiEndpointCommand } from './commands/suggestApiEndpoint';
import { registerOpenWebCommand } from './commands/openTestWeb';

export function activate(context: vscode.ExtensionContext) {
  registerGenerateApiJsonCommand(context);
  registerSuggestApiEndpointCommand(context);
  registerOpenWebCommand(context);
}
