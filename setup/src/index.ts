import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { readFileSync } from 'fs';
import AWS, { LexModelsV2 } from 'aws-sdk';


export const handler: APIGatewayProxyHandler = async (
    _event: APIGatewayProxyEvent | any,
    _context
) => {
    
    let database = readFileSync('lex_intents.csv', 'utf-8');
    let updator = new IntentUpdator();
    let lines = database.split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
        await updator.UpsertIntent(lines[index].split(';')[0], lines[index].split(';')[1], lines[index].split(';')[2]);
    };
    await updator.BuildLocale();

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods':
                'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT',
        },
        body: JSON.stringify(updator.GetUpdatorReport()),
    };
};


export class IntentUpdator {

    private fail:number = 0;
    private success: number = 0;
    private bodId: string = 'TDCQJHKPOM';
    private botVersion: string = 'DRAFT';
    private botLocale: string = 'en_US';
    private intentsList: Map<string, string> = new Map<string, string>();
    private duplicatesIntentIds: string[] = [];
    
    constructor() {
    }

    private GetLexClient(): LexModelsV2 {
        return new LexModelsV2({
            maxRetries: 0, 
            signatureCache: false, 
            maxRedirects: 0
        });
    }

    async GetIntentsList(): Promise<void>{
        if (this.intentsList.size === 0){
            console.log('Getting intents list...');
            this.duplicatesIntentIds = [];
            (await this.GetLexClient().listIntents({
                botId: this.bodId,
                botVersion: this.botVersion,
                localeId: this.botLocale
            }, (err, data) => {
                if (err && data){
                    console.log(err);
                    console.log(data);
                }
            }).promise()).intentSummaries?.forEach(intent => {
                if (intent.intentId && intent.intentName)
                { 
                    if([...this.intentsList.values()].find(name => name.trim().toLowerCase() === intent.intentName?.trim().toLowerCase()) )
                    { this.duplicatesIntentIds.push(intent.intentId); }
                    this.intentsList?.set(intent.intentId?.toString(), intent.intentName); 
                }
            });
        }
    }

    async UpsertIntent(intentName: string, intentQ: string, intentA: string): Promise<void> {
        await this.GetIntentsList();
        console.log(`Upserting ${intentName}...`);
        if ([...this.intentsList.values()].find(iName => iName?.trim().toLowerCase() === intentName.trim().toLowerCase())) 
        { console.log(`${intentName} already exists.`); return; }
        try {
            let intentId = (await this.GetLexClient().createIntent({
                botId: this.bodId,                
                intentName: intentName.trim().toLowerCase(),
                description: intentQ,
                botVersion: this.botVersion,
                localeId: this.botLocale,
                sampleUtterances: [ 
                    { 
                        'utterance': intentQ
                    }
                ],
                intentClosingSetting: {
                    closingResponse: {
                        messageGroups: [ {
                            message: {  
                                plainTextMessage: {
                                    value: intentA
                                }
                            }
                        }]
                    }
                }
            }, (err, data) => {
                if (err && data){
                    console.log(err);
                    console.log(data);
                }
            }).promise()).intentId;
            if (intentId)
            { this.success++; console.log(`Intent created: ${intentId}`); } else { this.fail++; }
        } catch (error) {
            console.log(error);
            this.fail++;
        }      
    }

    async BuildLocale(){
        try {
            // Not sure why Lex creates duplicate intents, delete them if created.
            this.intentsList = new Map<string, string>();
            await this.GetIntentsList();
            if (this.duplicatesIntentIds && this.duplicatesIntentIds.length > 0){
                console.log('Duplicates found.');
                let lexClient = this.GetLexClient();
                for (let index = 0; index < this.duplicatesIntentIds.length; index++) {
                    const id = this.duplicatesIntentIds[index];
                    let response = (await lexClient.deleteIntent({
                        intentId: id, 
                        botId: this.bodId,
                        botVersion: this.botVersion,
                        localeId: this.botLocale
                   }).promise()).$response;
                   console.log(`${response.requestId} executed(${response.httpResponse.statusCode}).`);                    
                }
            }            
            else {console.log('No duplicates found.');}

            // Build Bot
            console.log('Building Bot');
            let buildResponse = (await this.GetLexClient().buildBotLocale(
            {
                botId: this.bodId, 
                localeId: this.botLocale, 
                botVersion: this.botVersion
            },
            (err, data) => {
                if (err && data){
                    console.log(err);
                    console.log(data);
                }
            }).promise()).$response;
            console.log('Bot Built');
            if(buildResponse.httpResponse.statusCode != 202) { console.log('error building bot.') }
        } catch (error) {
            console.log(error);
        }
    }

    public GetUpdatorReport():string{
        return 'Successfully imported intents:' + this.success + '; Failed intents:' + this.fail;
    }
  
}