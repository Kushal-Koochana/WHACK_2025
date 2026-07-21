const form = document.getElementById('cashForm');
let entries = [];
let savedItems = {};

const dateInput = document.getElementById('date');
const itemDropdown = document.getElementById('itemDropdown');

const modal = document.getElementById('newItemModal');
const newItemForm = document.getElementById('newItemForm');
const newItemDesc = document.getElementById('newItemDesc');
const newItemType = document.getElementById('newItemType');
const newItemAmount = document.getElementById('newItemAmount');
const newItemRepeat = document.getElementById('newItemRepeat');
const cancelItemBtn = document.getElementById('cancelItemBtn');

const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const applyFilterBtn = document.getElementById('applyFilterBtn');

const today = new Date();
const todayISO = today.toISOString().split('T')[0];
const startDate = new Date(today);
startDate.setDate(startDate.getDate() - 30);
const endDate = new Date(today);
endDate.setDate(endDate.getDate() + 30);

dateInput.value = todayISO;
startDateInput.value = startDate.toISOString().split('T')[0];
endDateInput.value = endDate.toISOString().split('T')[0];

const cashFlowCtx = document.getElementById('cashFlowPie').getContext('2d');
const netFlowCtx = document.getElementById('netFlowChart').getContext('2d');

const cashFlowChart = new Chart(cashFlowCtx, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
});

const netFlowChart = new Chart(netFlowCtx, {
    type: 'line',
    data: {
        labels: [], datasets: [{
            label: 'Net Cash Flow', data: [], borderColor: 'blue', backgroundColor: 'rgba(0,0,255,0.08)', fill: true, tension: 0.2, segment: {
                borderColor: ctx => ctx.p0.parsed.y >= 0 && ctx.p1.parsed.y >= 0 ? '#10b981' : ctx.p0.parsed.y < 0 && ctx.p1.parsed.y < 0 ? '#ef4444' : 'blue',
                backgroundColor: ctx => ctx.p0.parsed.y >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
            }
        }]
    },
    options: {
        responsive: true,
        interaction: { mode: 'index' },
        plugins: {
            legend: { display: false },
            annotation: {
                annotations: {
                    zeroLine: {
                        type: 'line',
                        yMin: 0,
                        yMax: 0,
                        borderColor: '#374151',
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }
                }
            }
        },
        scales: {
            y: {
                grid: {
                    color: ctx => ctx.tick.value === 0 ? '#374151' : 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    }
});

function getGreenShade() { return `hsl(${Math.floor(Math.random() * 30) + 100}, ${Math.floor(Math.random() * 30) + 60}%, ${Math.floor(Math.random() * 30) + 40}%)`; }
function getRedShade() { return `hsl(${Math.floor(Math.random() * 20) + 0}, ${Math.floor(Math.random() * 30) + 60}%, ${Math.floor(Math.random() * 30) + 40}%)`; }

const USER = "demoUser";

async function loadFromDatabase() {
    try {
        const response = await fetch(`/api/entries/${USER}`);
        const data = await response.json();
        entries = data;

        const itemMap = {};
        entries.forEach(e => {
            if (!itemMap[e.description]) {
                itemMap[e.description] = { amount: e.amount, type: e.type };
            }
        });
        savedItems = itemMap;

        updateDropdown();
        applyFilter();
    } catch (e) {
        console.error('DB load error', e);
        entries = [
            { date: todayISO, description: 'Salary', amount: 2000, type: 'income' },
            { date: todayISO, description: 'Coffee', amount: 3.50, type: 'expense' }
        ];
        savedItems['Salary'] = { amount: 2000, type: 'income' };
        savedItems['Coffee'] = { amount: 3.5, type: 'expense' };
        savedItems['Rent'] = { amount: 1200, type: 'expense' };
        updateDropdown();
        applyFilter();
    }
}

window.addEventListener('DOMContentLoaded', loadFromDatabase);

async function saveToDatabase(entry) {
    try {
        const response = await fetch("/api/entries", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: USER, ...entry })
        });
        const data = await response.json();
        return data.id;
    } catch (e) {
        console.error('DB save error', e);
        return null;
    }
}

async function deleteFromDatabase(entryId) {
    try {
        await fetch(`/api/entries/${entryId}`, {
            method: 'DELETE'
        });
    } catch (e) {
        console.error('DB delete error', e);
    }
}

function getFilteredEntries() {
    const start = startDateInput.value ? new Date(startDateInput.value) : null;
    const end = endDateInput.value ? new Date(endDateInput.value) : null;
    return entries.filter(e => {
        const d = new Date(e.date);
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
    });
}

function applyFilter() {
    const filtered = getFilteredEntries();
    updateTable(filtered);
    updateSummary(filtered);
    updateCashFlowChart(filtered);
    updateNetFlowChart(filtered);
}

function updateTable(filteredEntries) {
    const tbody = document.getElementById('entryTable');
    tbody.innerHTML = '';
    filteredEntries.forEach((e, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.description}</td>
      <td>$${e.amount.toFixed(2)}</td>
      <td>${e.type}</td>
      <td><button class="delete-btn" data-index="${index}" data-id="${e.id || ''}">Delete</button></td>
    `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const index = parseInt(e.target.dataset.index);
            const entryId = e.target.dataset.id;

            if (confirm('Are you sure you want to delete this entry?')) {
                if (entryId) {
                    await deleteFromDatabase(entryId);
                }
                entries.splice(entries.indexOf(filteredEntries[index]), 1);
                applyFilter();
            }
        });
    });
}

function updateSummary(filteredEntries) {
    let income = 0, expense = 0;
    filteredEntries.forEach(e => e.type === 'income' ? income += e.amount : expense += e.amount);
    document.getElementById('totalIncome').innerText = income.toFixed(2);
    document.getElementById('totalExpenses').innerText = expense.toFixed(2);
    document.getElementById('netFlow').innerText = (income - expense).toFixed(2);
}

function updateCashFlowChart(filteredEntries) {
    const dataMap = {};
    const colorMap = {};
    filteredEntries.forEach(e => {
        dataMap[e.description] = (dataMap[e.description] || 0) + e.amount;
        colorMap[e.description] = e.type === 'income' ? getGreenShade() : getRedShade();
    });
    const labels = Object.keys(dataMap);
    const data = Object.values(dataMap);
    const colors = labels.map(l => colorMap[l]);
    cashFlowChart.data.labels = labels;
    cashFlowChart.data.datasets[0].data = data;
    cashFlowChart.data.datasets[0].backgroundColor = colors;
    cashFlowChart.update();
}

function updateNetFlowChart(filteredEntries) {
    const sorted = [...filteredEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = [];
    const data = [];
    let cumulative = 0;
    sorted.forEach(e => {
        cumulative += e.type === 'income' ? e.amount : -e.amount;
        labels.push(e.date);
        data.push(+cumulative.toFixed(2));
    });
    netFlowChart.data.labels = labels;
    netFlowChart.data.datasets[0].data = data;
    netFlowChart.update();
}

form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const date = dateInput.value;
    const selectedItem = itemDropdown.value;

    if (!date || !selectedItem) {
        alert('Please select a date and item');
        return;
    }

    if (selectedItem === '__add_new__') {
        openModal();
        return;
    }

    const itemData = savedItems[selectedItem];
    if (!itemData) {
        alert('Invalid item selected');
        return;
    }

    const entry = {
        date,
        description: selectedItem,
        amount: itemData.amount,
        type: itemData.type
    };

    const newId = await saveToDatabase(entry);
    entry.id = newId;
    entries.push(entry);

    itemDropdown.value = '';
    applyFilter();
});

function openModal() {
    modal.style.display = 'flex';
    newItemForm.reset();
}

function closeModal() {
    modal.style.display = 'none';
    newItemForm.reset();
}

cancelItemBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

newItemForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const description = newItemDesc.value.trim();
    const type = newItemType.value;
    const amount = parseFloat(newItemAmount.value);
    const isRepeat = newItemRepeat.checked;

    if (!description || isNaN(amount)) {
        alert('Please fill all fields correctly');
        return;
    }

    const date = dateInput.value;
    const entry = { date, description, amount, type };
    const newId = await saveToDatabase(entry);
    entry.id = newId;
    entries.push(entry);

    if (isRepeat) {
        savedItems[description] = { amount, type };
        updateDropdown();
    }

    closeModal();
    itemDropdown.value = '';
    applyFilter();
});

function updateDropdown() {
    itemDropdown.innerHTML = '<option value="">-- Select Item --</option><option value="__add_new__">+ Add New Item</option>';
    const sortedItems = Object.keys(savedItems).sort();
    sortedItems.forEach(desc => {
        const item = savedItems[desc];
        const option = document.createElement('option');
        option.value = desc;
        option.textContent = `${desc} ($${item.amount.toFixed(2)} - ${item.type})`;
        itemDropdown.appendChild(option);
    });
}

applyFilterBtn.addEventListener('click', () => {
    applyFilter();
});