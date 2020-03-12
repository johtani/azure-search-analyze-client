export class AnalyzeRequest {
    public constructor (
        public serviceName: string,
        public apiVersion: string,
        public apiKey: string,
        public indexName: string,
        public analyzeName: string,
        public text: string
    ) {

    }

    public get url() {
        return 'https://' + this.serviceName + '.search.windows.net/indexes/' + 
            this.indexName + '/analyze' + this.apiVersion;
    }

    public get headers() {
        return {
            'Content-Type': 'application/json',
            'api-key': this.apiKey
        };
    }

    public get body() {
        return {
            "analyzer": this.analyzeName,
            "text": this.text
        };
    }
}