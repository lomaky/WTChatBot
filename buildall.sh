rm -r chatbot/build/*
cd chatbot/
npx tsc
cd build/
zip qna_chatbot.zip * -r
cd ../../
rm -r setup/build/*
cp setup/lex_intents.csv setup/build/lex_intents.csv
cd setup/
npx tsc
cd build/
zip qna_setup.zip * -r