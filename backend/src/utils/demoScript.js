// This file contains the hardcoded script for the interactive demo.

const script = [
    {
        id: 1,
        promptKeywords: ['techxchange', 'surprise', 'rajesh'],
        responseText: `Ah, Marc… déjà vu? This is your third TechXchange. First year, you met a Metahuman. Last year, you were face-to-face with your own avatar. So by now, you should be used to Rajesh putting you on the spot! This year—he’s got you live, on stage, chatting with an autonomous AI agent as companion to support you in front of everyone. It is all about creating a something substantial to improve people’s life, It appears you guided this philosophy as well during the recent board meeting happened in August.`
    },
    {
        id: 2,
        promptKeywords: ['pull that off', 'really?'],
        responseText: `Absolutely. One of the first tasks assigned to me was to replace your Paper Index Card in your coat packet, And honestly, if you’re capturing ideas and notes on paper index cards, I’m half way through in replacing, I’m confident you would start liking me more than paper;`
    },
    {
        id: 3,
        promptKeywords: ['tandem in india', 'rajesh and dhana'],
        responseText: `Tandem in Pune—big one for Fulcrum Digital. 19th and 20th February. You travel every year, you perform every year, and let’s be honest—half the crowd is just waiting for your Bollywood number.`
    },
    {
        id: 4,
        promptKeywords: ['playlist', 'practice'],
        responseText: `Well, last year, you danced for a song from the Tandem Video. Based on the past history, I've chosen three peppy Bollywood tracks perfect for this year: "Jhoome Jo Pathaan", "Kala Chashma", and "Naatu Naatu". Get those moves ready—Cindy may have to clear out some extra time in your calendar for rehearsals.`
    },
    {
        id: 5,
        promptKeywords: ['dinner', 'indian restaurant', 'new york'],
        responseText: `I believe you’re talking about Musaafer. A New eatery, New York’s latest Indian hot spot feels like you’ve wandered from the Manhattan sidewalk into an opulent palace in India. I’ll have Cindy coordinate a date and time with Rajesh.`
    },
    {
        id: 6,
        promptKeywords: ['where the hell', 'my ai agent'],
        responseText: `You’re literally talking to it right now. While we’ve been chatting, I’ve already pinged Cindy to block your calendar for Tandem, and bonus—I asked Cindy to share the date for dinner at that new Indian restaurant in NYC. Butter chicken and Bollywood beats, Marc—you’re set.`
    }
];

// This function finds the correct response based on keywords in the user's prompt
const getScriptedResponse = (prompt) => {
    const lowerCasePrompt = prompt.toLowerCase();
    const foundLine = script.find(line =>
        line.promptKeywords.some(keyword => lowerCasePrompt.includes(keyword))
    );
    return foundLine;
};

module.exports = { getScriptedResponse };