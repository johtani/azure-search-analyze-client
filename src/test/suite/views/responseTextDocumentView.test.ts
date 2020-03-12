import * as assert from 'assert';
import {ResponseTextDocuemntView} from '../../../views/responseTextDocumentView';
import {AnalyzeResponse} from '../../../models/analyzeResponse';
import {TokenInfo} from '../../../models/tokenInfo';


suite("ResponseTextDocuemntView", () => {
    test("getTextDocuemntResponse", () => {
        const target = new ResponseTextDocuemntView();
        const responses: AnalyzeResponse[] = [
            {
                statusCode: 200,
                analyzerName: "analyzer1",
                tokens: [
                    {
                        token: "token1",
                        startOffset: 0,
                        endOffset: 5,
                        position: 0
                    },
                    {
                        token: "token2",
                        startOffset: 6,
                        endOffset: 10,
                        position: 1
                    }
                ]

            }, 
            {
                statusCode: 200,
                analyzerName: "analyzer2",
                tokens: [
                    {
                        token: "token1",
                        startOffset: 0,
                        endOffset: 5,
                        position: 0
                    }
                ]
            }
        ];

        assert((target as any).getTextDocumentResponse(responses), 
            "analyzer1\ttoken1, token2\n"+ 
            "analyzer2\ttoken1"
        );

    });
});