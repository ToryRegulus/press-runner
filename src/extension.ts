import * as path from 'path';
import * as vscode from 'vscode';

type UseTerminalMode = 'auto' | 'always' | 'never' | 'global'
type GUseTerminalMode = 'auto' | 'always' | 'never'

let cachedTerminal: vscode.Terminal | undefined;

interface CommandsConfig {
	plugin: string;
	command: string;
	terminal: string;
}

function replaceVars(command: string, document: vscode.TextDocument): string {
	const filePath = document.uri.fsPath;
	const fileName = path.basename(filePath);
	const fileNameWithoutExt = path.parse(filePath).name;
	const dir = path.dirname(filePath);
	const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
	const workspaceRoot = workspaceFolder ? workspaceFolder.uri.fsPath : '';

	return command
		.replace(/\${file}/g, filePath)
		.replace(/\${fileName}/g, fileName)
		.replace(/\${fileNameWithoutExt}/g, fileNameWithoutExt)
		.replace(/\${dir}/g, dir + "/")
		.replace(/\${workspaceRoot}/g, workspaceRoot + "/");
}

function isPluginActive(extensionId: string): boolean {
	const ext = vscode.extensions.getExtension(extensionId);
	
	return !!ext?.isActive;
}

function shouldUseTerminal(extensionId: string, mode: UseTerminalMode, globalMode: GUseTerminalMode): boolean {
	const effectiveMode = (mode === 'global') ? globalMode : mode;

	if (effectiveMode === 'always') {
		return true;
	} else if (effectiveMode === 'never') {
		return false;
	} else {
		return !isPluginActive(extensionId);
	}
}

function runInTerminal(terminalCommand: string, lang: string) {
	if (!cachedTerminal) {
		cachedTerminal = vscode.window.createTerminal(`Run ${lang}`);
	}
	cachedTerminal.show();
	cachedTerminal.sendText(terminalCommand);
  }

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('press-runner.run', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor.');

			return;
		}

		const lang = editor.document.languageId;
		const config = vscode.workspace.getConfiguration('press-runner');

		const commandPath = `commandsMap.${lang}.Commands`;
		const modePath = `commandsMap.${lang}.useTerminal`;
		
		const langCommands = config.get<CommandsConfig>(commandPath);
		const langMode = config.get<UseTerminalMode>(modePath, 'global');
		const globalMode = config.get<GUseTerminalMode>('globalUseTerminal', 'auto');

		if (!langCommands) {
			vscode.window.showErrorMessage(`No command configuration found for language: ${lang}.`);

			return;
		}

		const terminalCommand = replaceVars(langCommands.terminal, editor.document);
		const shouldUseTerm = shouldUseTerminal(langCommands.plugin, langMode, globalMode);

		try {
			if (shouldUseTerm) {
				runInTerminal(terminalCommand, lang);
			} else {
				await vscode.commands.executeCommand(langCommands.command);
			}
		} catch (err) {
			vscode.window.showErrorMessage(`${err}.`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
