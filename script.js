// Constants for calculations
const REGION_FACTORS = {
    sumatra: 0.82,
    jawa: 0.87,
    kalimantan: 0.84,
    sulawesi: 0.83,
    papua: 0.85
};

const DEVICE_WATTAGES = {
    ac: 900,
    tv: 60,
    kulkas: 100,
    mesin_cuci: 500,
    laptop: 65,
    rice_cooker: 400,
    setrika: 300,
    kipas: 45,
    lampu: 10
};

// State management
let calculations = [];

// Tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Update button states
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update panel visibility
        document.querySelectorAll('.calculator-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${button.dataset.tab}-panel`).classList.add('active');
    });
});

// Device selection handling
function updateWattage() {
    const deviceSelect = document.getElementById('device');
    const customWattageDiv = document.getElementById('custom-wattage');
    const wattageInput = document.getElementById('wattage');

    if (deviceSelect.value === 'custom') {
        customWattageDiv.style.display = 'block';
        wattageInput.value = '';
    } else {
        customWattageDiv.style.display = 'none';
        wattageInput.value = DEVICE_WATTAGES[deviceSelect.value] || '';
    }
}

// Calculation functions
function calculateElectricityCarbon() {
    const region = document.getElementById('region').value;
    const va = parseFloat(document.getElementById('va').value);

    if (!va || isNaN(va)) {
        alert('Mohon masukkan nilai daya listrik yang valid');
        return;
    }

    const monthlyKwh = va / 1000;
    const carbonFootprint = monthlyKwh * REGION_FACTORS[region];

    addToHistory('electricity', {
        region: region,
        va: va,
        result: carbonFootprint
    });
}

function calculateElectronicsCarbon() {
    const deviceSelect = document.getElementById('device');
    const device = deviceSelect.value;
    const deviceName = deviceSelect.options[deviceSelect.selectedIndex].text;
    const hours = parseFloat(document.getElementById('hours').value);
    let wattage;

    if (device === 'custom') {
        wattage = parseFloat(document.getElementById('wattage').value);
    } else {
        wattage = DEVICE_WATTAGES[device];
    }

    if (!wattage || !hours || isNaN(wattage) || isNaN(hours)) {
        alert('Mohon lengkapi semua field dengan nilai yang valid');
        return;
    }

    const dailyKwh = (wattage * hours) / 1000;
    const monthlyKwh = dailyKwh * 30;
    const carbonFootprint = monthlyKwh * 0.85; // Average carbon factor

    addToHistory('electronics', {
        device: deviceName,
        wattage: wattage,
        hours: hours,
        result: carbonFootprint
    });
}

// History management
function addToHistory(type, data) {
    const calculation = {
        type: type,
        data: data,
        timestamp: new Date()
    };

    calculations.push(calculation);
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyDiv = document.getElementById('history');
    const totalCarbonSpan = document.getElementById('total-carbon');

    // Clear current history
    historyDiv.innerHTML = '';

    // Add each calculation to history
    calculations.forEach(calc => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        let details = '';
        if (calc.type === 'electricity') {
            details = `${calc.data.region.toUpperCase()} - ${calc.data.va} VA`;
        } else {
            details = `${calc.data.device} - ${calc.data.wattage}W - ${calc.data.hours}h/hari`;
        }

        historyItem.innerHTML = `
            <div class="history-item-header">
                <div>
                    <span class="history-item-type">
                        ${calc.type === 'electricity' ? 'Listrik' : 'Elektronik'}:
                    </span>
                    <span class="history-item-details">${details}</span>
                </div>
                <div class="history-item-result">
                    <div class="result-value">${calc.data.result.toFixed(2)} kg CO2</div>
                    <div class="result-timestamp">${calc.timestamp.toLocaleString()}</div>
                </div>
            </div>
        `;

        historyDiv.appendChild(historyItem);
    });

    // Update total
    const totalCarbon = calculations.reduce((sum, calc) => sum + calc.data.result, 0);
    totalCarbonSpan.textContent = `${totalCarbon.toFixed(2)} kg CO2`;
}