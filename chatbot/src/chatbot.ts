import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { BaseFunction } from "./basefunction";
import { LexRuntimeV2 } from "aws-sdk";


export class ChatbotHandler extends BaseFunction {

    private bodId: string = 'TDCQJHKPOM';
    private botAlias: string = 'TSTALIASID';
    private botLocale: string = 'en_US';

    constructor() {
        super();
    }

    async lambdaHandler(event: any): Promise<APIGatewayProxyResult> {
        switch (event.requestContext.http.method) {
            case 'GET':
                return await this.doGet(event);
        }
        return this.BadRequestResponse('Unrecognized method ' + event.requestContext.http.method);
    }    

    async doGet(event: any): Promise<APIGatewayProxyResult> {
        if (event.queryStringParameters
            && event.queryStringParameters.q) {
            return await this.doQuery(event.queryStringParameters.q);
        }
        return this.BadRequestResponse(
            'Unrecognized parameters ' +
                JSON.stringify(event.queryStringParameters)
        );
    }

    async doQuery(question: string): Promise<APIGatewayProxyResult> {
        let sessionString = 'CB' + (new Date().getTime()) + 6213559680000000;
        let client = this.GetLexClient();
        let sessionId = ( await client.putSession({
            botAliasId: this.botAlias, 
            botId: this.bodId, 
            localeId: this.botLocale,
            responseContentType: 'text/plain; charset=utf-8',
            sessionState: { },
            sessionId: sessionString
        }).promise()).sessionId;
        if (sessionId){
            let messages = (await client.recognizeText(
                {
                    botId: this.bodId,
                    localeId: this.botLocale, 
                    text: question, 
                    sessionId : sessionId,
                    botAliasId: this.botAlias
                }
            ).promise()).messages;
            if (messages && messages.length > 0 && messages[0].content){
                return this.JsonResponse(messages[0].content);
            }
        }
        return this.JsonResponse('Sorry, I did not understand your question. Can you try to rephrase it?');
    }

    private GetLexClient(): LexRuntimeV2 {
        return new LexRuntimeV2({
            maxRetries: 0, 
            signatureCache: false, 
            maxRedirects: 0
        });
    }
  
}