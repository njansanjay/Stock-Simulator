let balance = localStorage.getItem("balance")
    ? parseInt(localStorage.getItem("balance"))
    : 100000;

let portfolio = localStorage.getItem("portfolio")
    ? JSON.parse(localStorage.getItem("portfolio"))
    : {};

let initialBalance = 100000;

const balanceElement = document.getElementById("balance");
const stockContainer = document.getElementById("stockContainer");
const portfolioList = document.getElementById("portfolioList");
const portfolioValue = document.getElementById("portfolioValue");
const profitLoss = document.getElementById("profitLoss");
const searchInput = document.getElementById("searchInput");

let chart;
let marketHistory = [];

balanceElement.innerText = balance;

fetch("stocks.json")
    .then(response => response.json())
    .then(stocks => {

        displayStocks(stocks);

        createChart();

        setInterval(() => {

            updatePrices(stocks);

            displayStocks(stocks);

            updateChart(stocks);

        }, 2000);

        searchInput.addEventListener("input", () => {

            const filtered = stocks.filter(stock =>
                stock.name.toLowerCase()
                .includes(searchInput.value.toLowerCase())
            );

            displayStocks(filtered);
        });

    });

function displayStocks(stocks) {

    stockContainer.innerHTML = "";

    stocks.forEach(stock => {

        const card = document.createElement("div");

        card.classList.add("stock-card");

        const randomChange = (Math.random() * 20 - 10).toFixed(2);

        const color = randomChange >= 0 ? "green" : "red";

card.innerHTML = `

    <div class="stock-top">

        <div class="stock-name">
            ${stock.name}
        </div>

        <div>
            📊
        </div>

    </div>

    <div class="stock-price ${color}">
        ₹${stock.price.toFixed(2)}
    </div>

    <div class="stock-change ${color}">
        ${randomChange >= 0 ? "+ " : "- "}
        ₹${Math.abs(randomChange)}
    </div>

    <div class="button-group">

        <button class="buy-btn"
            onclick="buyStock('${stock.name}', ${stock.price})">

            Buy
        </button>

        <button class="sell-btn"
            onclick="sellStock('${stock.name}', ${stock.price})">

            Sell
        </button>

    </div>

`;

        stockContainer.appendChild(card);
    });

    updatePortfolio(stocks);
}

function buyStock(name, price) {

    if(balance >= price) {

        balance -= price;

        if(portfolio[name]) {
            portfolio[name]++;
        } else {
            portfolio[name] = 1;
        }

        saveData();

        showToast(`Bought ${name}`);

        updatePortfolio();

    } else {

        alert("Insufficient Balance!");
    }
}

function sellStock(name, price) {

    if(portfolio[name] && portfolio[name] > 0) {

        portfolio[name]--;

        balance += price;

        if(portfolio[name] === 0) {
            delete portfolio[name];
        }

        saveData();

        showToast(`Sold ${name}`);

        updatePortfolio();

    } else {

        alert("You don't own this stock!");
    }
}

function updatePortfolio(stocks = []) {

    portfolioList.innerHTML = "";

    balanceElement.innerText = balance.toFixed(2);

    let totalValue = 0;

    for(let stock in portfolio) {

        const row = document.createElement("tr");

        row.innerHTML = `
        
            <td>${stock}</td>
            <td>${portfolio[stock]}</td>

        `;

        portfolioList.appendChild(row);

        const stockData = stocks.find(s => s.name === stock);

        if(stockData) {
            totalValue += stockData.price * portfolio[stock];
        }
    }

    portfolioValue.innerText = totalValue.toFixed(2);

    const totalAssets = balance + totalValue;

    const pnl = totalAssets - initialBalance;

    profitLoss.innerText = `₹${pnl.toFixed(2)}`;

    profitLoss.className = pnl >= 0 ? "green" : "red";
}

function saveData() {

    localStorage.setItem("balance", balance);

    localStorage.setItem("portfolio",
        JSON.stringify(portfolio));
}

function updatePrices(stocks) {

    stocks.forEach(stock => {

        const change = Math.random() * 30 - 15;

        stock.price += change;

        if(stock.price < 50) {
            stock.price = 50;
        }
    });
}

function createChart() {

    const ctx = document.getElementById("marketChart");

    chart = new Chart(ctx, {

        type: "line",

        data: {

            labels: [],

            datasets: [{

                data: [],

                borderWidth: 2,

                tension: 0.5,

                pointRadius: 0,

                fill: true,

                backgroundColor: "rgba(34,197,94,0.08)",

                borderColor: "#22c55e"
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {
                    enabled: false
                }
            },

            scales: {

                x: {
                    display: false
                },

                y: {
                    display: false
                }
            }
        }
    });
}

function updateChart(stocks) {

    const avg = stocks.reduce((sum, stock) =>
        sum + stock.price, 0) / stocks.length;

    marketHistory.push(avg.toFixed(2));

    if(marketHistory.length > 15) {
        marketHistory.shift();
    }

    chart.data.labels =
        marketHistory.map((_, i) => i + 1);

    chart.data.datasets[0].data = marketHistory;

    chart.update();
}

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")) {

        themeBtn.innerText = "☀ Light Mode";

    } else {

        themeBtn.innerText = "🌙 Dark Mode";
    }
});
function showToast(message) {

    const toast = document.createElement("div");

    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "black";
    toast.style.color = "white";
    toast.style.padding = "15px";
    toast.style.borderRadius = "10px";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}