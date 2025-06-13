import * as path from 'path';
import * as vscode from 'vscode';

type UseTerminalMode = 'auto' | 'always' | 'never' | 'global'
type GUseTerminalMode = 'auto' | 'always' | 'never'

interface CommandPair {
	plugin: string;
	terminal: string;
}

interface LangCommandConfig {
	commands: CommandPair;
	useTerminal: UseTerminalMode;
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

function shouldUseTerminal(lang: string, mode: UseTerminalMode, globalMode: GUseTerminalMode): boolean {
	const effectiveMode = (mode == 'global') ? globalMode : mode;

	if (effectiveMode == 'always') {
		return true;
	} else if (effectiveMode == 'never') {
		return false;
	} else {
		if (lang == 'python') {
			return !isPluginActive('ms-python.python');
		} else if (lang == 'c' || lang == 'cpp') {
			return !isPluginActive('ms-vscode.cmake-tools');
		}
	}

	return true;
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
		const commandMap = config.get<Record<string, LangCommandConfig>>('commandsMap');

		const langConfig = commandMap?.[lang];

		if (!langConfig || typeof langConfig !== 'object') {
			vscode.window.showErrorMessage(`Invalid config for language: ${lang}.`);

			return;
		}

		const { commands, useTerminal } = langConfig;
		const terminalCommand = replaceVars(commands.terminal, editor.document);
		const globalUseTerminal = config.get<GUseTerminalMode>('useTerminal', 'auto');
		const shouldUseTerm = shouldUseTerminal(lang, useTerminal, globalUseTerminal);

		try {
			if (shouldUseTerm) {
				const terminal = vscode.window.createTerminal(`Run ${lang}`);
				terminal.show();
				terminal.sendText(terminalCommand);
			} else {
				await vscode.commands.executeCommand(commands.plugin);
			}
		} catch (err) {
			vscode.window.showErrorMessage(`${err}.`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
