import { AnalyzeRequest } from "../models/analyzeRequest";
import { HttpClient } from "../utils/httpClient";
import { ResponseTextDocuemntView } from "../views/responseTextDocumentView";
import { AnalyzeResponse } from "../models/analyzeResponse";
import { Range, TextEditor, window, ViewColumn, Uri, workspace } from "vscode";
import { Selector } from "../utils/selector";
import { ResponseWebView } from "../views/responseWebView";

export class AnalyzeController {
    private _httpClient: HttpClient;
    private _textView: ResponseTextDocuemntView;
    private _webview: ResponseWebView;

    public constructor() {
        this._httpClient = new HttpClient();
        this._textView = new ResponseTextDocuemntView();
        this._webview = new ResponseWebView();
    }

    private static messageBoxOption = {modal: true};

    public async analyze( range: Range) {
        const editor = window.activeTextEditor;
        const document = window.activeTextEditor?.document;
        if (!editor || !document) {
             return;
        }

        const selectedRequest = await Selector.getRequest(editor, range);

        if (!selectedRequest) {
            window.showErrorMessage("There is no parameters/text in the editor. ", AnalyzeController.messageBoxOption);
            return;
        }

        const errors = selectedRequest.hasErrors();
        if (errors && errors.length > 0) {
            window.showErrorMessage(errors.join("\r\n"), AnalyzeController.messageBoxOption);
            return;
        }

        let request = new AnalyzeRequest(
            selectedRequest.serviceName,
            selectedRequest.apiVersion,
            selectedRequest.apiKey,
            selectedRequest.indexName,
            "",
            selectedRequest.text
        );
        let responses: AnalyzeResponse[] = [];

        for (var analyzer of selectedRequest.analyzerNames) {
            request.analyzeName = analyzer;
            let response = await this._httpClient.send(request);
            responses.push(response);
        }

        const editorColumn = window.activeTextEditor!.viewColumn;
        const viewColumn = ((editorColumn as number) + 1) as ViewColumn;
        
        //this._textView.render(responses, viewColumn, selectedRequest.text);
        this._webview.render(responses, viewColumn, selectedRequest.text);
    }

    public async createAnalyzeEditor(filename?: string) {
        //Analyze 用のパラメータを設定する".analyze"拡張子のファイル生成する処理
        const content = '###\napiVersion = "?api-version=2019-05-06"\nserviceName = ""\napiKey = ""\nindexName = ""\nanalyzerNames = [""]\ntext = ""\n';
        const language = 'analyze';
        let doc = await workspace.openTextDocument({language, content});
        let editorColumn;
        if (window.activeTextEditor) {
            editorColumn = window.activeTextEditor.viewColumn;
        }
        if (!editorColumn) {
            editorColumn = 1 as ViewColumn;
        }
        window.showTextDocument(doc, editorColumn);
    }

    public dispose() {
        this._webview.dispose();
    }


}