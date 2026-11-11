const app = document.getElementById("app");
const $ = id => document.getElementById(id);
const ADMIN = "admin@eliterewards.com";
const TIERS = ["Silver", "Gold", "Platinum", "Diamond"];
const LEVELS = [0, 1000, 3000, 6000];

const GIFTS = [
    {id:1,name:"Coffee Voucher",points:200,icon:"☕",description:"Enjoy your favourite coffee."},
    {id:2,name:"Shopping Voucher",points:500,icon:"🛍️",description:"Get a shopping reward voucher."},
    {id:3,name:"Wireless Earbuds",points:1500,icon:"🎧",description:"A wireless audio experience."},
    {id:4,name:"Smart Watch",points:3000,icon:"⌚",description:"A smart lifestyle accessory."},
    {id:5,name:"Travel Voucher",points:2500,icon:"✈️",description:"A reward for your next journey."},
    {id:6,name:"Gift Hamper",points:1000,icon:"🎁",description:"A special surprise gift hamper."}
];

const SEED = [
    ["Rahul Sharma","rahul@gmail.com","9876543210",850],
    ["Priya Singh","priya@gmail.com","9876543211",1650],
    ["Arjun Kumar","arjun@gmail.com","9876543212",3200],
    ["Sneha Reddy","sneha@gmail.com","9876543213",6200],
    ["Aarav Mehta","aarav@gmail.com","9876543214",450],
    ["Ananya Rao","ananya@gmail.com","9876543215",1250],
    ["Karthik Verma","karthik@gmail.com","9876543216",2800],
    ["Ishita Kapoor","ishita@gmail.com","9876543217",3500],
    ["Aditya Reddy","aditya@gmail.com","9876543218",4800],
    ["Meera Nair","meera@gmail.com","9876543219",6200],
    ["Rohan Das","rohan@gmail.com","9876543220",7500],
    ["Diya Sharma","diya@gmail.com","9876543221",9200]
];

const saved = JSON.parse(localStorage.getItem("customers") || "[]");
let customers = SEED.map(([name,email,phone,points],i) => {
    const old = saved.find(c => c.email === email);
    return old || {id:i+1,name,email,phone,password:"1234",points,earned:points};
});
customers.push(...saved.filter(c => !SEED.some(s => s[1] === c.email)));

let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
let currentUser = null;
let role = "customer";
let page = "dashboard";
let selectedTier = null;

const isAdmin = () => currentUser.email === ADMIN;
const current = () => customers.find(c => c.email === currentUser.email);
const myTx = () => isAdmin() ? transactions : transactions.filter(t => t.email === currentUser.email);

function save() {
    localStorage.setItem("customers",JSON.stringify(customers));
    localStorage.setItem("transactions",JSON.stringify(transactions));
}

function tierOf(points) {
    if (points >= 6000) return "Diamond";
    if (points >= 3000) return "Platinum";
    if (points >= 1000) return "Gold";
    return "Silver";
}

function toast(msg) {
    document.querySelector(".toast")?.remove();
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(),2500);
}

function addTx(c,activity,points) {
    transactions.unshift({
        id:"ER"+Date.now(),
        customer:c.name,
        email:c.email,
        activity,
        points,
        date:new Date().toLocaleString()
    });
    save();
}

const stat = (label,value,note) =>
    `<div class="stat-card"><p>${label}</p><h2>${value}</h2><small>${note}</small></div>`;

const row = (label,value) =>
    `<div class="detail-row"><span>${label}</span><strong>${value}</strong></div>`;

const heading = (eyebrow,title,sub="",button="") => `
    <div class="page-heading">
        <div>
            <div class="eyebrow">${eyebrow}</div>
            <h1>${title}</h1>
            ${sub ? `<p class="muted">${sub}</p>` : ""}
        </div>
        ${button}
    </div>`;

function table(heads,rows) {
    if (!rows.length) return `<p class="empty">Nothing to show yet.</p>`;
    return `<div class="table-wrap"><table>
        <thead><tr>${heads.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
}

const txTable = list => table(
    ["TRANSACTION ID","CUSTOMER","ACTIVITY","POINTS","DATE"],
    list.map(t=>[t.id,t.customer,t.activity,(t.points>0?"+":"")+t.points,t.date])
);

const customerTable = list => table(
    ["NAME","EMAIL","PHONE","POINTS","MEMBERSHIP"],
    list.map(c=>[c.name,c.email,c.phone,c.points,tierOf(c.earned)])
);

function card(c) {
    const tier = tierOf(c.earned);
    return `
        <div class="membership-card ${tier.toLowerCase()}">
            <div class="card-top"><strong>ELITE REWARDS</strong><span>✦</span></div>
            <div class="card-label">MEMBERSHIP CARD</div>
            <div class="card-number">ER-${String(c.id).slice(-8)}</div>
            <div class="card-bottom">
                <strong>${c.name}</strong>
                <strong>${tier.toUpperCase()}</strong>
            </div>
        </div>`;
}

function progress(c) {
    const i = TIERS.indexOf(tierOf(c.earned));
    if (i === 3) return `<p class="muted mt">You have reached Diamond membership!</p>`;

    const from = LEVELS[i], to = LEVELS[i+1];
    const pct = Math.min((c.earned-from)/(to-from)*100,100);

    return `
        <p class="mt">Progress to ${TIERS[i+1]}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <p class="muted">${to-c.earned} more lifetime points needed</p>`;
}

function showLanding() {
    app.innerHTML = `
        <div class="landing">
            <header class="topbar">
                <div class="brand">
                    <img src="elite_rewards_logo_9.png" alt="Elite Rewards">
                    <div class="brand-name">ELITE REWARDS</div>
                </div>
                <nav class="nav-links">
                    <a href="#" data-action="landing">HOME</a>
                    <a href="#benefits">BENEFITS</a>
                    <a href="#about">ABOUT</a>
                    <button class="btn" data-action="login">LOGIN</button>
                </nav>
            </header>

            <section class="hero">
                <div>
                    <div class="eyebrow">A PREMIUM LOYALTY EXPERIENCE</div>
                    <h1>Every Purchase.<br>More Rewards.</h1>
                    <h2>Where loyalty meets exclusive privileges.</h2>
                    <p>Discover a smarter way to shop, earn reward points, unlock exclusive membership benefits and redeem exciting gifts with Elite Rewards.</p>
                    <button class="btn" data-action="register">JOIN ELITE REWARDS →</button>
                </div>
                <div class="hero-art">
                    <img src="elite_rewards_logo_9.png" alt="Elite Rewards Logo">
                </div>
            </section>

            <section class="page-content" id="benefits">
                <div class="page-heading"><h1>Membership Benefits</h1></div>
                <div class="stats-grid">
                    ${stat("Silver Membership","0–999","Starter rewards")}
                    ${stat("Gold Membership","1,000–2,999","Exclusive benefits")}
                    ${stat("Platinum Membership","3,000–5,999","Premium rewards")}
                    ${stat("Diamond Membership","6,000+","Elite privileges")}
                </div>
            </section>

            <section class="page-content" id="about">
                <div class="panel">
                    <h3>About Elite Rewards</h3>
                    <p class="muted">Elite Rewards is a customer loyalty platform that allows customers to earn points through purchases and redeem them for exciting rewards.</p>
                </div>
            </section>
        </div>`;
}

function authPage(eyebrow,title,text,box) {
    return `
        <div class="login-page">
            <section class="login-showcase">
                <div class="eyebrow">${eyebrow}</div>
                <h1>${title}</h1>
                <p>${text}</p>
            </section>
            <section class="login-box-wrap">
                <div class="login-box">${box}</div>
            </section>
        </div>`;
}

function showLogin() {
    app.innerHTML = authPage(
        "WELCOME TO ELITE REWARDS",
        "Your Loyalty.<br>Your Rewards.",
        "Access your membership, track your points and discover exclusive rewards.",
        `
        <div class="eyebrow">MEMBER ACCESS</div>
        <h2>Welcome Back</h2>
        <p class="muted">Login to continue to your account.</p>

        <div class="role-switch">
            <button class="${role==="customer"?"active":""}" data-action="role" data-value="customer">Customer</button>
            <button class="${role==="admin"?"active":""}" data-action="role" data-value="admin">Admin</button>
        </div>

        <form id="loginForm">
            <div class="field"><label>Email Address</label><input type="email" id="loginEmail" required placeholder="Enter your email"></div>
            <div class="field"><label>Password</label><input type="password" id="loginPassword" required placeholder="Enter password"></div>
            <button class="btn btn-full" type="submit">LOGIN</button>
        </form>

        <p class="switch-text" data-action="register">New member? Create an account</p>
        <p class="switch-text" data-action="landing">← Back to Home</p>
        <p class="muted">Demo Admin: admin@eliterewards.com / admin123</p>
        <p class="muted">Demo Customer: rahul@gmail.com / 1234</p>`
    );
}

function showRegister() {
    app.innerHTML = authPage(
        "BECOME A MEMBER",
        "Join The<br>Elite Circle.",
        "Create your account and start collecting reward points.",
        `
        <div class="eyebrow">NEW MEMBERSHIP</div>
        <h2>Create Account</h2>
        <form id="registerForm">
            <div class="field"><label>Full Name</label><input id="regName" required></div>
            <div class="field"><label>Email Address</label><input type="email" id="regEmail" required></div>
            <div class="field"><label>Phone Number</label><input type="tel" id="regPhone" pattern="[0-9]{10}" required></div>
            <div class="field"><label>Password</label><input type="password" id="regPassword" minlength="4" required></div>
            <button class="btn btn-full" type="submit">CREATE ACCOUNT</button>
        </form>
        <p class="switch-text" data-action="login">Already a member? Login</p>`
    );
}

function login() {
    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;

    if (role === "admin") {
        if (email === ADMIN && password === "admin123")
            startSession("Administrator",email);
        else toast("Invalid admin login");
        return;
    }

    const c = customers.find(x=>x.email===email && x.password===password);
    if (c) startSession(c.name,email);
    else toast("Invalid email or password");
}

function register() {
    const email = $("regEmail").value.trim().toLowerCase();
    if (customers.some(c=>c.email===email)) return toast("Email already registered");

    const c = {
        id:Date.now(),
        name:$("regName").value.trim(),
        email,
        phone:$("regPhone").value.trim(),
        password:$("regPassword").value,
        points:50,
        earned:50
    };

    customers.push(c);
    addTx(c,"Registration Bonus",50);
    toast("Account created successfully");
    showLogin();
}

function startSession(name,email) {
    currentUser = {name,email};
    page = "dashboard";
    showShell();
}

function showShell() {
    const pages = isAdmin()
        ? [["dashboard","Dashboard"],["customers","Customers"],["points","Manage Points"]]
        : [["dashboard","Dashboard"],["profile","My Membership"]];

    pages.push(["gifts","Rewards Catalogue"],["transactions","Transactions"]);

    const links = pages.map(([key,label]) =>
        `<button class="side-link ${page===key?"active":""}" data-action="nav" data-value="${key}">${label}</button>`
    ).join("");

    app.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                <h2>ELITE REWARDS</h2>
                <div class="side-label">MAIN MENU</div>
                ${links}
                <button class="side-link" data-action="logout">Logout</button>
            </aside>
            <main class="main-area">
                <header class="top-header">
                    <h2>Elite Rewards</h2>
                    <div class="user-chip">${currentUser.name}</div>
                </header>
                <section class="page-content" id="pageContent"></section>
            </main>
        </div>`;
    renderPage();
}

function renderPage() {
    const views = {
        dashboard:isAdmin()?adminDashboard:customerDashboard,
        tier:tierPage,
        customers:customersPage,
        points:pointsPage,
        profile:profilePage,
        gifts:giftsPage,
        transactions:transactionsPage
    };
    $("pageContent").innerHTML = views[page]();
}

function adminDashboard() {
    const totalPoints = customers.reduce((sum,c)=>sum+c.points,0);

    const tierCards = TIERS.map(name => {
        const count = customers.filter(c=>tierOf(c.earned)===name).length;
        return `
            <div class="membership-card tier-card ${name.toLowerCase()}" data-action="tier" data-value="${name}">
                <div class="card-top"><strong>${name.toUpperCase()}</strong><span>✦</span></div>
                <div class="card-number">${count} members</div>
                <small>Click to view members</small>
            </div>`;
    }).join("");

    return `
        ${heading("OVERVIEW","Admin Dashboard","Welcome back, Administrator.")}
        <div class="stats-grid">
            ${stat("Total Customers",customers.length,"Registered members")}
            ${stat("Total Points",totalPoints.toLocaleString(),"Customer point balance")}
            ${stat("Total Transactions",transactions.length,"Recorded activities")}
            ${stat("Available Gifts",GIFTS.length,"Rewards catalogue")}
        </div>
        <div class="customer-grid">${tierCards}</div>
        <div class="panel mt">
            <h3>Recent Transactions</h3>
            ${txTable(transactions.slice(0,5))}
        </div>`;
}

function tierPage() {
    const members = customers.filter(c=>tierOf(c.earned)===selectedTier);
    return `
        ${heading("MEMBER LIST",`${selectedTier} Members`,`${members.length} members in this tier`,
            `<button class="btn" data-action="nav" data-value="dashboard">← Back to Dashboard</button>`)}
        <div class="panel">${customerTable(members)}</div>`;
}

function customerDashboard() {
    const c = current(), mine = myTx();

    return `
        ${heading("CUSTOMER OVERVIEW",`Welcome, ${c.name}`,"Your rewards journey starts here.")}
        <div class="stats-grid">
            ${stat("Available Points",c.points,"Ready to redeem")}
            ${stat("Lifetime Points",c.earned,"Total points earned")}
            ${stat("Membership",tierOf(c.earned),"Your current tier")}
            ${stat("Transactions",mine.length,"Your activity")}
        </div>
        <div class="dashboard-grid">
            <div class="panel">
                <h3>Your Membership</h3>
                ${card(c)}
                ${progress(c)}
            </div>
            <div class="panel">
                <h3>Points Information</h3>
                ${row("Purchase","10 points / ₹100")}
                ${row("Registration","50 points")}
                ${row("Birthday Bonus","100 points")}
                ${row("Referral Bonus","150 points")}
                ${row("Promotion Bonus","200 points")}
            </div>
        </div>
        <div class="panel mt">
            <h3>Recent Transactions</h3>
            ${txTable(mine.slice(0,5))}
        </div>`;
}

function profilePage() {
    const c = current();
    return `
        ${heading("YOUR ACCOUNT","My Membership")}
        <div class="dashboard-grid">
            <div class="panel">
                <h3>Membership Card</h3>
                ${card(c)}
                ${progress(c)}
            </div>
            <div class="panel">
                <h3>Personal Details</h3>
                ${row("Name",c.name)}
                ${row("Email",c.email)}
                ${row("Phone",c.phone)}
                ${row("Available Points",c.points)}
                ${row("Lifetime Points",c.earned)}
            </div>
        </div>`;
}

function customersPage() {
    return `
        ${heading("MEMBER MANAGEMENT","Customers")}
        <div class="toolbar">
            <input class="search-input" id="custSearch" placeholder="Search customers...">
        </div>
        <div class="panel" id="custTable">${customerTable(customers)}</div>`;
}

function pointsPage() {
    const options = customers.map(c=>
        `<option value="${c.email}">${c.name} - ${c.email}</option>`
    ).join("");

    return `
        ${heading("POINTS MANAGEMENT","Manage Customer Points")}
        <div class="panel">
            <h3>Adjust Points</h3>
            <form id="pointsForm">
                <div class="field">
                    <label>Select Customer</label>
                    <select id="pointCustomer" required>
                        <option value="">Choose customer</option>${options}
                    </select>
                </div>
                <div class="field"><label>Points</label><input type="number" id="pointAmount" min="1" required></div>
                <div class="field">
                    <label>Action</label>
                    <select id="pointAction">
                        <option value="add">Add Points</option>
                        <option value="remove">Remove Points</option>
                    </select>
                </div>
                <button class="btn btn-full" type="submit">UPDATE POINTS</button>
            </form>
        </div>`;
}

function adjustPoints() {
    const c = customers.find(x=>x.email===$("pointCustomer").value);
    const amount = Number($("pointAmount").value);
    if (!c || amount<=0) return;

    if ($("pointAction").value==="add") {
        c.points += amount;
        c.earned += amount;
        addTx(c,"Admin Points Bonus",amount);
    } else {
        if (c.points<amount) return toast("Not enough available points");
        c.points -= amount;
        addTx(c,"Admin Points Deduction",-amount);
    }

    save();
    toast("Points updated successfully");
    renderPage();
}

function giftsPage() {
    const items = GIFTS.map(g=>`
        <div class="gift-card">
            <div class="gift-art">${g.icon}</div>
            <div class="gift-info">
                <h3>${g.name}</h3>
                <p>${g.description}</p>
                <div class="gift-points">${g.points.toLocaleString()} Points</div>
                <button class="btn" data-action="redeem" data-value="${g.id}">REDEEM</button>
            </div>
        </div>`).join("");

    return `
        ${heading("EXCLUSIVE COLLECTION","Rewards Catalogue","Choose a reward and redeem using your points.")}
        <div class="gift-grid">${items}</div>`;
}

function redeem(id) {
    if (isAdmin()) return toast("Customers can redeem rewards");

    const c = current();
    const gift = GIFTS.find(g=>g.id===id);
    if (c.points<gift.points) return toast("Not enough points to redeem");

    c.points -= gift.points;
    addTx(c,"Gift Redemption - "+gift.name,-gift.points);
    toast("Reward redeemed successfully");
    renderPage();
}

function transactionsPage() {
    return `
        ${heading("ACTIVITY HISTORY","Transactions","",
            `<button class="btn" data-action="csv">EXPORT CSV</button>`)}
        <div class="toolbar">
            <input class="search-input" id="txSearch" placeholder="Search transactions...">
        </div>
        <div class="panel" id="txTable">${txTable(myTx())}</div>`;
}

function exportCSV() {
    const rows = [["Transaction ID","Customer","Activity","Points","Date"]]
        .concat(myTx().map(t=>[t.id,t.customer,t.activity,t.points,t.date]));

    const csv = rows.map(r=>
        r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")
    ).join("\n");

    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    link.download = "elite-rewards-transactions.csv";
    link.click();
}

app.addEventListener("click",e=>{
    const el = e.target.closest("[data-action]");
    if (!el) return;
    e.preventDefault();

    const {action,value} = el.dataset;

    if (action==="landing") showLanding();
    else if (action==="login") showLogin();
    else if (action==="register") showRegister();
    else if (action==="role") { role=value; showLogin(); }
    else if (action==="nav") { page=value; showShell(); }
    else if (action==="logout") { currentUser=null; showLanding(); }
    else if (action==="tier") { selectedTier=value; page="tier"; showShell(); }
    else if (action==="redeem") redeem(Number(value));
    else if (action==="csv") exportCSV();
});

app.addEventListener("submit",e=>{
    e.preventDefault();
    if (e.target.id==="loginForm") login();
    else if (e.target.id==="registerForm") register();
    else if (e.target.id==="pointsForm") adjustPoints();
});

app.addEventListener("input",e=>{
    const q = e.target.value.toLowerCase();

    if (e.target.id==="custSearch") {
        $("custTable").innerHTML = customerTable(
            customers.filter(c=>(c.name+c.email).toLowerCase().includes(q))
        );
    }

    if (e.target.id==="txSearch") {
        $("txTable").innerHTML = txTable(
            myTx().filter(t=>(t.customer+t.activity+t.id).toLowerCase().includes(q))
        );
    }
});

save();
showLanding();
