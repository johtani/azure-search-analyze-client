// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, window, languages, commands, workspace, TextDocument, Range } from 'vscode';
import { AnalyzeController } from './controllers/analyzeController';
import { CodelensProvider } from './providers/codeLensProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	console.log('Activate analyze api ');
    let codelensProvider = new CodelensProvider();

    const documentSelector = [
        { language: 'analyze', scheme: 'file' },
        { language: 'analyze', scheme: 'untitled' },
    ];
	languages.registerCodeLensProvider(documentSelector, codelensProvider);
	

	const analyzeController = new AnalyzeController();

	// send request to Azure 
	context.subscriptions.push(
		commands.registerCommand('send.azure-search.analyze', 
			async (document: TextDocument, range: Range) => {
				analyzeController.analyze(range);
		})
	);

}

// this method is called when your extension is deactivated
export function deactivate() {}
