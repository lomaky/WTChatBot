import { APIGatewayProxyResult } from "aws-lambda";

export class BaseFunction {

    constructor() { }

    async JsonResponse(
        response: object | string
    ): Promise<APIGatewayProxyResult> {
        return {
            statusCode: response ? 200 : 204,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods':
                    'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'
            },
            body: response ? JSON.stringify(response) : '',
        };
    }

    async BadRequestResponse(
        err: string
    ): Promise<APIGatewayProxyResult> {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods':
                    'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT',
                'Access-Control-Allow-Headers':
                    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'
            },
            body: JSON.stringify({ error: err }),
        };
    }      
}