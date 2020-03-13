import { Disposable, WebviewPanel, ViewColumn, window, Uri, Webview } from 'vscode';
import { AnalyzeResponse } from "../models/analyzeResponse";
import { TokenInfo } from '../models/tokenInfo';

export class ResponseWebView {
    public static currentPanel: ResponseWebView | undefined;
    private _panel: WebviewPanel | undefined;
    private _disposables: Disposable[] = [];

    public constructor() {
    }

    public async render(responses: AnalyzeResponse[], viewColumn: ViewColumn) {
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
        this._panel.webview.html = this.getHtmlForWebview(responses);

    }

    private getHtmlForWebview(responses: AnalyzeResponse[]) {

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <title>Analyze Responses</title>
            </head>
            <body>
                ${this.getTableView(responses)}
            </body>
            </html>`;
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
            body.push("<td>" + response.analyzerName + "</td>");
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
                cell += tokens[index].token + "<br/>";
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