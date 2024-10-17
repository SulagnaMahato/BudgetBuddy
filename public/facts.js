// List of random financial facts
const quotes = [
    "Paper money’s origins? China introduced it during the Tang Dynasty (618–907 AD) and it spread widely by the Song Dynasty.",
    "Ever seen a $100,000 bill? You wouldn’t! It existed in the U.S. but was only used for transfers between Federal Reserve Banks, not the public.",
    "Want to stop impulse buying? Wait 24 hours before making a purchase! This simple 'cooling-off' trick helps cut down on unnecessary spending.",
    "The Diners Club created the first credit card in the 1950s, initially just for restaurants in New York City. Now, look where we are!",
    "The word 'budget' comes from the Latin 'bulga,' meaning a leather bag or wallet. It used to mean the king’s financial plan.",
    "Heard of the 50-30-20 rule? It’s a popular budgeting strategy where you spend 50% on needs, 30% on wants, and save 20%.",
    "Making a penny costs more than it’s worth! It costs about 2.1 cents to make a single penny in the U.S.",
    "Going cashless? Sweden’s almost there! Less than 1% of transactions involve cash, and they’re eyeing the title of first fully cashless country.",
    "Einstein called compound interest the 'eighth wonder of the world'! It’s a powerful force for growing your investments over time.",
    "Tracking your spending can reveal surprising habits! Even small purchases add up, helping you make better financial decisions."
];

// Function to generate a random quote
function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

// Display the random quote
document.getElementById("random-quote").textContent = getRandomQuote();
