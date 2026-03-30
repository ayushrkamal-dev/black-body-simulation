const ctx = document.getElementById('mainChart').getContext('2d');
let chart;

const H = 6.626e-34, C = 3e8, K = 1.381e-23, B = 2.898e-3;

function calculatePlanck(lambda, T) {
    const exponent = (H * C) / (lambda * K * T);
    return exponent > 700 ? 0 : (2 * H * Math.pow(C, 2)) / (Math.pow(lambda, 5) * (Math.exp(exponent) - 1));
}

function calculateRJ(lambda, T) { return (2 * C * K * T) / Math.pow(lambda, 4); }

function updateAnalytics(T) {
    const peakNm = (B / T * 1e9).toFixed(0);
    document.getElementById('peakWavelength').innerHTML = `${peakNm}<span class="text-xs ml-1 text-gray-500 font-bold uppercase">nm</span>`;
    document.getElementById('tempVal').innerText = T;
    
    let region = "Infrared";
    if (peakNm < 10) region = "X-Ray";
    else if (peakNm < 400) region = "UV";
    else if (peakNm < 700) region = "Visible";
    document.getElementById('regionName').innerText = region;
}

function initChart() {
    const labels = Array.from({length: 200}, (_, i) => 100 + i * 20);
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Planck",
                    borderColor: '#ffffff', // Solid White
                    borderWidth: 3, // Thicker line
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(255,255,255,0.05)'
                },
                {
                    label: "Classical",
                    borderColor: '#ff4d4d', // Bright Red
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    grid: { color: 'rgba(255,255,255,0.05)' }, 
                    ticks: { color: '#fff', font: { size: 9, weight: 'bold' } } 
                },
                y: { 
                    grid: { color: 'rgba(255,255,255,0.05)' }, 
                    ticks: { display: false } 
                }
            },
            plugins: { legend: { display: false } }
        }
    });
    updateChart();
}

function updateChart() {
    const T = parseInt(document.getElementById('tempSlider').value);
    const planckData = chart.data.labels.map(l => calculatePlanck(l * 1e-9, T));
    const rjData = chart.data.labels.map(l => calculateRJ(l * 1e-9, T));

    chart.data.datasets[0].data = planckData;
    chart.data.datasets[0].hidden = !document.getElementById('showPlanck').checked;
    chart.data.datasets[1].data = rjData;
    chart.data.datasets[1].hidden = !document.getElementById('showRJ').checked;

    chart.options.scales.y.max = Math.max(...planckData) * 1.3;
    chart.update('none');
    updateAnalytics(T);
}

function setPreset(temp) { document.getElementById('tempSlider').value = temp; updateChart(); }
function toggleOption(id) { const el = document.getElementById(id); el.checked = !el.checked; updateChart(); }
function resetSim() { document.getElementById('tempSlider').value = 3000; updateChart(); }
function downloadChart() {
    const link = document.createElement('a');
    link.download = `Analysis_${document.getElementById('tempSlider').value}K.png`;
    link.href = document.getElementById('mainChart').toDataURL('image/png');
    link.click();
}

document.getElementById('tempSlider').addEventListener('input', updateChart);
window.onload = initChart;