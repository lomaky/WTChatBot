import { APIGatewayProxyEvent, APIGatewayProxyHandler} from 'aws-lambda';
import { ChatbotHandler } from './chatbot';
import { BaseFunction } from './basefunction';


export const handler: APIGatewayProxyHandler = async (
    _event: any,
    _context
) => {    
    switch (_event.rawPath.toLowerCase()) {
        case '/chat':
            return new ChatbotHandler().lambdaHandler(_event);
        default:
            return new BaseFunction().BadRequestResponse('Unrecognized path ' + _event.rawPath);
    }
};

