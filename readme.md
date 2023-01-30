Running Example:

https://og-chatbot.s3.us-west-2.amazonaws.com/index.html

1. Create Lex Bot

    Get bodId, botAliasId and botLocaleId;

2. Create S3 Bucket and make it a static website

3. Update BotId in the following files:

    setup/src/index.ts
    
    chatbot/src/chatbot.ts

4. Run buildall.sh

5. Upload SetupLambda Function (Node16, Auth Type: NONE, Timeout 1m)

    setup/build/qna_setup.zip

6. Add Lex to lambda execution role and run lambda to create intents. 

7. Upload chatbotLambda Function (Node16, Enable Function URL, Auth Type: NONE, Timeout 1m)

    chatbot/build/qna_chatbot.zip

8. Add Lex to lambda execution role and run lambda to create intents. 

9. [Optional] Save test lambda event and run
    
    chatbot/src/event.json

10. Update chatbotURL with lambda URL in the file:
    
    ui/index.html

11. Upload UI app to s3 bucket
    ui/index.html
    ui/style.css

12. Create Kendra Index

13. Index FAQ

14. Configure Lex to use Kendra Intent
    On successful fulfillment
        ((x-amz-lex:kendra-search-response-document-1))
    In case of failure
        Sorry, could not find an answer to your question. Please try again.

15. Build Lex
