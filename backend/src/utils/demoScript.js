// This file contains the hardcoded script for the interactive demo.

const script = [
    // Turn 1
    `Ah, Marc… déjà vu? This is your third TechXchange. First year, you met a Metahuman. Last year, you were face-to-face with your own avatar. So by now, you should be used to Rajesh putting you on the spot! This year—he’s got you live, on stage, chatting with an autonomous AI agent as companion to support you in front of everyone. It is all about creating a something substantial to improve people’s life, It appears you guided this philosophy as well during the recent board meeting happened in August.`,
    // Turn 2
    `Absolutely. One of the first tasks assigned to me was to replace your Paper Index Card in your coat packet, And honestly, if you’re capturing ideas and notes on paper index cards, I’m half way through in replacing, I’m confident you would start liking me more than paper;`,
    // Turn 3
    `Tandem in Pune—big one for Fulcrum Digital. 19th and 20th February. You travel every year, you perform every year, and let’s be honest—half the crowd is just waiting for your Bollywood number.`,
    // Turn 4
    `Well, last year, you danced for a song from the Tandem Video. Based on the past history, I've chosen three peppy Bollywood tracks perfect for this year: "Jhoome Jo Pathaan", "Kala Chashma", and "Naatu Naatu". Get those moves ready—Cindy may have to clear out some extra time in your calendar for rehearsals.`,
    // Turn 5
    `I believe you’re talking about Musaafer. A New eatery, New York’s latest Indian hot spot feels like you’ve wandered from the Manhattan sidewalk into an opulent palace in India. I’ll have Cindy to coordinate a date and time with Rajesh.`,
    // Turn 6
    `You’re literally talking to it right now. While we’ve been chatting, I’ve already pinged Cindy to block your calendar for Tandem, and bonus—I asked Cindy to share the date for dinner at that new Indian restaurant in NYC. Butter chicken and Bollywood beats, Marc—you’re set.`
];

// This function now finds the correct response based on the turn number
const getScriptedResponse = (turn) => {
    // The turn is 0-indexed, so we can use it as an array index
    if (turn >= 0 && turn < script.length) {
        return script[turn];
    }
    // Return a default or error message if the script is over
    return "This concludes our scripted demo. Thank you!";
};

module.exports = { getScriptedResponse };