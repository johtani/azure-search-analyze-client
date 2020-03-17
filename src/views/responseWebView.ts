import { Disposable, WebviewPanel, ViewColumn, window, Uri, Webview } from 'vscode';
import { AnalyzeResponse } from "../models/analyzeResponse";
import { TokenInfo } from '../models/tokenInfo';

export class ResponseWebView {
    public static currentPanel: ResponseWebView | undefined;
    private _panel: WebviewPanel | undefined;
    private _disposables: Disposable[] = [];

    public constructor() {
    }

    public async render(responses: AnalyzeResponse[], viewColumn: ViewColumn, originalText: string) {
        if (!this._panel) {
            this._panel = window.createWebviewPanel(
                "azure-search-analyze",
                "Analyze Response",
                viewColumn,
                {
                    enableFindWidget: true,
                    enableScripts: true,
                }
            );
            this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        }
        this._panel.webview.html = this.getHtmlForWebview(responses, originalText);

    }

    private getHtmlForWebview(responses: AnalyzeResponse[], originalText: string) {

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style type="text/css">
                div.error {
                    color: #DC143C;
                }
                </style>
                <title>Analyze Responses</title>
            </head>
            <body>
                <div>
                  Original Text: ${originalText}
                </div>
                <br/>
                ${this.getTableView(responses)}
                * [start:end] is each token's start offset and end offset in input text.
                <br/>
                <br/>
                ${this.showErrors(responses)}
            </body>
            </html>`;
    }

    private showErrors(responses: AnalyzeResponse[]) {
        let errors = '';

        for (const response of responses) { 
            if (!response.completed) {
                errors = response.analyzerName + " request has an error. " + response.errorDetail + "<br/>";
            }
        }
        if (errors.length > 0) {
            errors = '<h2>Errors</h2><div class="error">' + errors + "</div>";
        }

        return errors;
    }

    private getTableView(responses: AnalyzeResponse[]) {
        let columnSize = this.getMaxTokenListLength(responses);

        let tables = `
        <table border="1">
          <thead>
            <tr>
              ${this.getTableHeader(columnSize)}
            </tr>
          </thead>
          <tbody>
              ${this.getTableBody(responses, columnSize)}
          </tbody>
        </table>
        `;
        return tables;
    }

    private getTableHeader(columnSize: number) {
        let header = ["<td>analyzer name</td>"];

        for (let index = 0; index < columnSize; index++) {
            header.push("<td>Token[" + index + "]</td>");
        }
        return header.join("\n");
    }

    private getTableBody(responses: AnalyzeResponse[], columnSize: number) {
        let body = [""];
        for (const response of responses) {
            body.push("<tr>");
            body.push("<td>" + response.analyzerName + "<br/>[start:end]</td>");
            if (response.tokens) {
                for (let index = 0; index < columnSize; index++) {
                    body.push("<td>" + this.getTokensInCell(response.tokens, index) + "</td>");
                }
            }
            body.push("</tr>");
        }
        return body.join("\n");
    }

    private getTokensInCell(tokens: TokenInfo[], cellIndex: number) {
        let cell = "";
        for (let index = 0; index < tokens.length; index++) {
            if (tokens[index].position === cellIndex) {
                cell += tokens[index].token  + "<br/>\n[" + 
                tokens[index].startOffset+ ":" + tokens[index].endOffset + "]" + "<br/>";
            }
        }
        return cell;
    }

    private getMaxTokenListLength(responses: AnalyzeResponse[]) {
        let max = 0;
        for (const response of responses) {
            if (response.tokens) {
                let lastPosition = response.tokens[response.tokens.length - 1].position;
                if (lastPosition) {
                    if (max <= lastPosition) {
                        max = lastPosition + 1;
                    }
                }
            }
        }
        return max;
    }

    public dispose() {
        ResponseWebView.currentPanel = undefined;
        if (this._panel) {
            this._panel.dispose();
        }
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

}