const { Client, GatewayIntentBits, Emoji, ReactionEmoji } = require('discord.js');
require('dotenv').config();
const openAi = require('openai');
const OpenAI = openAi.OpenAI;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

client.once("ready", () => {
    setTimeout(() => {
        console.log(`Client is ready, logged on as: ${client.user.tag}`);
    }, 150);
});

/*client.on("messageCreate", message => {
    if (message.content.toLowerCase() === "testbot") {
        message.reply("Hi there, did you say my name?");
    }
});*/

client.on("messageCreate", async message => {
    if(message.content.toLowerCase() === "testbot give me a quote") {
        const result = await callAiForQuote("Hello");
        message.reply(result);
    }
    if(message.mentions.has(client.user)) {
        const contentWithoutPing = message.content
            .replace(`<@${client.user.id}>`, "")
            .replace(`<@!${client.user.id}`, "")
            .trim();
        console.log(`Ping recieved with this content: ${contentWithoutPing}`);
        console.log(`Passing message to AI language model...`);
        try {
            const result = await callAiForQuote(contentWithoutPing);
            if (result.length > 2000) {
                message.reply("I generated a response over 2k characters. My developer is activley working on a workaround!\n Sorry for the time being!");
            } else if (result.length <= 2000) {
                message.react('✅');
                message.reply(result);
            } else {
                message.react('❌');
                message.reply("An error has occured.");
            }
        } catch (e) {
            console.log(e);
            message.reply("Sorry I cannot help with that as i suffered an error internally.");
        }
    }
 })

client.login(process.env.TOKEN);


async function callAiForQuote(body) {
    const openai = new OpenAI({
        apiKey: process.env.APIKEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });
    
    const response = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
            { 
                role: "system", 
                content: "You are a helpful assistant in the form of a discord bot. DO NOT exceed 2000 characters on ANY of your answers." 
            },
            {
                role: "user",
                content: body,
            },
        ],
    });
    
    const reply = response.choices[0].message["content"];
    console.log(reply);  
    return reply;
}
