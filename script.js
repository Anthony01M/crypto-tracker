// added what I could remember, not sure if some of them can even be fetched in coinGecko API
const symbolToId = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    LTC: 'litecoin',
    XRP: 'ripple',
    BCH: 'bitcoin-cash',
    ADA: 'cardano',
    DOT: 'polkadot',
    LINK: 'chainlink',
    XLM: 'stellar',
    DOGE: 'dogecoin',
};

const nameToId = {
    bitcoin: 'bitcoin',
    ethereum: 'ethereum',
    litecoin: 'litecoin',
    ripple: 'ripple',
    'bitcoin-cash': 'bitcoin-cash',
    cardano: 'cardano',
    polkadot: 'polkadot',
    chainlink: 'chainlink',
    stellar: 'stellar',
    dogecoin: 'dogecoin',
};

let chartInstance = null;
let lastFetchTime = 0;
const fetchInterval = 60000;

function updateRemainingTime() {
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastFetchTime;

    if (timeSinceLastFetch < fetchInterval) {
        const timeLeft = fetchInterval - timeSinceLastFetch;
        const secondsLeft = Math.ceil(timeLeft / 1000);
        const minutesLeft = Math.floor(secondsLeft / 60);
        const displayTime = minutesLeft > 0 ? `${minutesLeft} minute(s) and ${secondsLeft % 60} second(s)` : `${secondsLeft} second(s)`;
        document.getElementById('notice').innerHTML = `<h2>Please wait ${displayTime} before making another request.</h2>`;
    } else {
        document.getElementById('notice').innerHTML = '';
    }
}

function fetchData() {
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastFetchTime;

    if (timeSinceLastFetch < fetchInterval) {
        updateRemainingTime();
        return;
    }

    lastFetchTime = currentTime;

    const input = document.getElementById('crypto-symbol').value.toLowerCase();
    const timeRange = document.getElementById('time-range').value;
    const cryptoId = symbolToId[input.toUpperCase()] || nameToId[input];

    if (!cryptoId) {
        document.getElementById('notice').innerHTML = `<h2>Invalid Symbol or Name</h2>`;
        return;
    }

    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
    const historicalUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${timeRange}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const price = data[cryptoId]?.usd;
            if (price) {
                document.getElementById('crypto-data').innerHTML = `<h2>${input.toUpperCase()} Price: $${price}</h2>`;
            } else {
                document.getElementById('notice').innerHTML = `<h2>Invalid Symbol or Name</h2>`;
            }
        })
        .catch(error => {
            document.getElementById('notice').innerHTML = `<h2>Error fetching data</h2>`;
            console.error('Error:', error);
        });

    fetch(historicalUrl)
        .then(response => response.json())
        .then(data => {
            const prices = data.prices.map(price => ({
                x: new Date(price[0]),
                y: price[1]
            }));

            const ctx = document.getElementById('crypto-chart').getContext('2d');

            if (chartInstance) {
                chartInstance.destroy();
            }

            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: `${input.toUpperCase()} Price (Last ${timeRange} Days)`,
                        data: prices,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        },
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        })
        .catch(error => {
            document.getElementById('notice').innerHTML = `<h2>Error fetching historical data: ${error}</h2>`;
        });
}

document.getElementById('fetch-data').addEventListener('click', fetchData);
setInterval(updateRemainingTime, 1000);

document.addEventListener('DOMContentLoaded', function () {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#000000', '#FF5733', '#FF8C00', '#FFD700', '#ADFF2F', '#00FF7F', '#00CED1', '#1E90FF', '#9370DB', '#FF1493', '#000000'];
    let colorIndex = 0;

    setInterval(() => {
        document.body.style.backgroundColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
    }, 5000);
});
