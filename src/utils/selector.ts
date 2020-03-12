import { EOL } from 'os';
import { TextEditor, Range } from "vscode";
import { AnalyzeRequest } from '../models/analyzeRequest';

export const LineSplitterRegex: RegExp = /\r?\n/g;
export const CommentIdentifiersRegex: RegExp = /^\s*(#|\/{2})/;

export interface RequestRangeOptions {
    ignoreCommentLine?: boolean;
    ignoreEmptyLine?: boolean;
}

export interface SelectedRequest {
    text: string;
    serviceName: string,
    apiVersion: string,
    apiKey: string,
    indexName: string,
    analyzerNames: string[]
}


export class Selector {

    public static async getRequest(editor: TextEditor, range: Range | null = null): Promise<SelectedRequest | null> {
        if (!editor.document) {
            return null;
        }

        let selectedText: string | null;
        if (editor.selection.isEmpty || range) {
            const activeLine = !range ? editor.selection.active.line : range.start.line;
            selectedText = this.getDelimitedText(editor.document.getText(), activeLine);
        } else {
            selectedText = editor.document.getText(editor.selection);
        }

        if (selectedText === null) {
            return null;
        }

        // remove comment lines
        let lines: string[] = selectedText.split(LineSplitterRegex).filter(l => !Selector.isCommentLine(l));
        if (lines.length === 0) {
            return null;
        }

        let serviceName: string = "";
        let apiVersion: string = "";
        let apiKey: string = "";
        let analyzerNames: string[] = [];
        let indexName: string = "";
        let text: string = "";
       
        for (const line of lines) {
            if (line.match(/serviceName/)) {
                serviceName = this.getVariable(line);
            } else if (line.match(/apiVersion/)) {
                apiVersion = this.getVariable(line);
            } else if (line.match(/apiKey/)) {
                apiKey = this.getVariable(line);
            } else if (line.match(/analyzerNames/)){
                analyzerNames = this.getVariables(line);
            } else if (line.match(/indexName/)) {
                indexName = this.getVariable(line);
            } else if (line.match(/text/)) {
                text = this.getVariable(line);
            }
        }
        
        return {
            text: text,
            serviceName: serviceName,
            apiVersion: apiVersion,
            apiKey: apiKey,
            indexName: indexName,
            analyzerNames: analyzerNames
        };
    }
    

    private static getVariable(line: string): string {
        return line.substring(line.indexOf("=")+1).trim();
    }

    private static getVariables(line: string): string[] {
        return JSON.parse(line.substring(line.indexOf("=")+1));
    }

    public static getRequestRanges(lines: string[], options?: RequestRangeOptions): [number, number][] {
        options = {
                ignoreCommentLine: true,
                ignoreEmptyLine: true,
            ...options};
        const requestRanges: [number, number][] = [];
        const delimitedLines = this.getDelimiterRows(lines);
        delimitedLines.push(lines.length);

        let prev = -1;
        for (const current of delimitedLines) {
            let start = prev + 1;
            let end = current - 1;
            while (start <= end) {
                const startLine = lines[start];

                if (options.ignoreCommentLine && this.isCommentLine(startLine)
                    || options.ignoreEmptyLine && this.isEmptyLine(startLine)) {
                    start++;
                    continue;
                }

                const endLine = lines[end];
                if (options.ignoreCommentLine && this.isCommentLine(endLine)
                    || options.ignoreEmptyLine && this.isEmptyLine(endLine)) {
                    end--;
                    continue;
                }

                requestRanges.push([start, end]);
                break;
            }
            prev = current;
        }

        return requestRanges;
    }

    public static isEmptyLine(line: string): boolean {
        return line.trim() === '';
    }
    private static getDelimitedText(fullText: string, currentLine: number): string | null {
        const lines: string[] = fullText.split(LineSplitterRegex);
        const delimiterLineNumbers: number[] = this.getDelimiterRows(lines);
        if (delimiterLineNumbers.length === 0) {
            return fullText;
        }

        // return null if cursor is in delimiter line
        if (delimiterLineNumbers.includes(currentLine)) {
            return null;
        }

        if (currentLine < delimiterLineNumbers[0]) {
            return lines.slice(0, delimiterLineNumbers[0]).join(EOL);
        }

        if (currentLine > delimiterLineNumbers[delimiterLineNumbers.length - 1]) {
            return lines.slice(delimiterLineNumbers[delimiterLineNumbers.length - 1] + 1).join(EOL);
        }

        for (let index = 0; index < delimiterLineNumbers.length - 1; index++) {
            const start = delimiterLineNumbers[index];
            const end = delimiterLineNumbers[index + 1];
            if (start < currentLine && currentLine < end) {
                return lines.slice(start + 1, end).join(EOL);
            }
        }

        return null;
    }

    private static getDelimiterRows(lines: string[]): number[] {
        const rows: number[] = [];
        for (let index = 0; index < lines.length; index++) {
            if (lines[index].match(/^#{3,}/)) {
                rows.push(index);
            }
        }
        return rows;
    }

    public static isCommentLine(line: string): boolean {
        return CommentIdentifiersRegex.test(line);
    }

}