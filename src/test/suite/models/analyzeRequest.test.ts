import * as assert from 'assert';
import {AnalyzeRequest} from '../../../models/analyzeRequest';

suite("AnalyzeRequest.test", () => {
    test("All get methods test", () => {
        let serviceName = "service_name";
        let indexName = "index_name";
        let apiVersion = "?version=1.0";
        let apiKey = "apiKey";
        let analyzer = "analyzer";
        let text = "This is text";

        let request = new AnalyzeRequest(
            serviceName,
            apiVersion,
            apiKey,
            indexName,
            analyzer,
            text
        );
        assert.equal(request.url, "https://"+serviceName+".search.windows.net/indexes/"+indexName+"/analyze"+apiVersion);
        assert.deepEqual(request.headers, { 
            "Content-Type": "application/json",
            "api-key": apiKey
        });
        assert.deepEqual(request.body, {
            "analyzer": analyzer,
            "text": text
        });

    });
});