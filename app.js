// DOM要素の取得
document.addEventListener('DOMContentLoaded', () => {
    // 入力フィールド
    const propertyPrice = document.getElementById('property-price');
    const monthlyRent = document.getElementById('monthly-rent');
    const purchaseExpenses = document.getElementById('purchase-expenses');
    const managementFee = document.getElementById('management-fee');
    const repairReserve = document.getElementById('repair-reserve');
    const propertyTax = document.getElementById('property-tax');
    const insurance = document.getElementById('insurance');
    const vacancyRate = document.getElementById('vacancy-rate');
    
    // 結果表示要素
    const grossYield = document.getElementById('gross-yield');
    const netYield = document.getElementById('net-yield');
    const annualIncome = document.getElementById('annual-income');
    const annualExpenses = document.getElementById('annual-expenses');
    const annualNetIncome = document.getElementById('annual-net-income');
    const paybackPeriod = document.getElementById('payback-period');
    
    // ボタン
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // チャート
    let yieldChart = null;
    let projectionChart = null;
    
    // 資産推移シミュレーション用の追加入力
    const propertyValueGrowth = document.getElementById('property-value-growth');
    const rentGrowth = document.getElementById('rent-growth');
    
    // 資産推移シミュレーション結果表示要素
    const futurePropertyValue = document.getElementById('future-property-value');
    const totalRentIncome = document.getElementById('total-rent-income');
    const totalNetIncome = document.getElementById('total-net-income');
    const totalAssetGrowth = document.getElementById('total-asset-growth');
    const totalROI = document.getElementById('total-roi');
    
    // 計算ボタンのイベントリスナー
    calculateBtn.addEventListener('click', () => {
        // 入力値の取得と数値変換
        const price = Number(propertyPrice.value) || 0;
        const rent = Number(monthlyRent.value) || 0;
        const expenses = Number(purchaseExpenses.value) || 0;
        const management = Number(managementFee.value) || 0;
        const repair = Number(repairReserve.value) || 0;
        const tax = Number(propertyTax.value) || 0;
        const ins = Number(insurance.value) || 0;
        const vacancy = Number(vacancyRate.value) || 0;
        
        // 総投資額の計算（物件価格 + 購入諸経費）
        const totalInvestment = price + expenses;
        
        // 空室率を考慮した年間家賃収入
        const yearlyRent = rent * 12 * (1 - vacancy / 100);
        
        // 年間経費の計算
        const yearlyExpenses = (management + repair) * 12 + tax + ins;
        
        // 年間純収益の計算
        const yearlyNetIncome = yearlyRent - yearlyExpenses;
        
        // 表面利回りの計算
        const grossYieldValue = (rent * 12 / price) * 100;
        
        // 実質利回りの計算
        const netYieldValue = (yearlyNetIncome / totalInvestment) * 100;
        
        // 投資回収期間（年）
        const paybackPeriodValue = totalInvestment / yearlyNetIncome;
        
        // 結果の表示（小数点第2位まで）
        grossYield.textContent = grossYieldValue.toFixed(2) + '%';
        netYield.textContent = netYieldValue.toFixed(2) + '%';
        annualIncome.textContent = formatCurrency(yearlyRent) + '円';
        annualExpenses.textContent = formatCurrency(yearlyExpenses) + '円';
        annualNetIncome.textContent = formatCurrency(yearlyNetIncome) + '円';
        paybackPeriod.textContent = paybackPeriodValue.toFixed(1) + '年';
        
        // チャートの更新
        updateChart(grossYieldValue, netYieldValue);
        
        // 20年間の資産推移シミュレーション
        updateProjectionChart({
            price,
            expenses,
            yearlyRent,
            yearlyExpenses,
            yearlyNetIncome,
            propertyValueGrowthRate: Number(propertyValueGrowth.value) || 0,
            rentGrowthRate: Number(rentGrowth.value) || 0
        });
    });
    
    // リセットボタンのイベントリスナー
    resetBtn.addEventListener('click', () => {
        // 入力フィールドのリセット
        propertyPrice.value = '';
        monthlyRent.value = '';
        purchaseExpenses.value = '';
        managementFee.value = '';
        repairReserve.value = '';
        propertyTax.value = '';
        insurance.value = '';
        vacancyRate.value = '';
        
        // 結果表示のリセット
        grossYield.textContent = '-';
        netYield.textContent = '-';
        annualIncome.textContent = '-';
        annualExpenses.textContent = '-';
        annualNetIncome.textContent = '-';
        paybackPeriod.textContent = '-';
        
        // チャートのリセット
        if (yieldChart) {
            yieldChart.destroy();
            yieldChart = null;
        }
        
        // 資産推移チャートのリセット
        if (projectionChart) {
            projectionChart.destroy();
            projectionChart = null;
        }
        
        // 資産推移シミュレーション結果のリセット
        futurePropertyValue.textContent = '-';
        totalRentIncome.textContent = '-';
        totalNetIncome.textContent = '-';
        totalAssetGrowth.textContent = '-';
        totalROI.textContent = '-';
    });
    
    // 金額のフォーマット関数
    function formatCurrency(amount) {
        return amount.toLocaleString('ja-JP');
    }
    
    // チャートの更新関数
    function updateChart(grossYieldValue, netYieldValue) {
        const ctx = document.getElementById('yield-chart').getContext('2d');
        
        // 既存のチャートがあれば破棄
        if (yieldChart) {
            yieldChart.destroy();
        }
        
        // 新しいチャートの作成
        yieldChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['表面利回り', '実質利回り'],
                datasets: [{
                    label: '利回り (%)',
                    data: [grossYieldValue, netYieldValue],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '利回り (%)'
                        }
                    }
                }
            }
        });
    }
    
    // 20年間の資産推移シミュレーションチャートの更新
    function updateProjectionChart(data) {
        const ctx = document.getElementById('asset-projection-chart').getContext('2d');
        const years = Array.from({length: 21}, (_, i) => i); // 0年目から20年目まで
        
        // 初期投資額（物件価格＋購入諸経費）
        const initialInvestment = data.price + data.expenses;
        
        // 各年の物件価値、累計収入、総資産価値を計算
        const propertyValues = [];
        const cumulativeRentIncomes = [];
        const cumulativeNetIncomes = [];
        const totalAssetValues = [];
        
        let currentPropertyValue = data.price;
        let cumulativeRentIncome = 0;
        let cumulativeNetIncome = 0;
        let currentRent = data.yearlyRent;
        let currentExpenses = data.yearlyExpenses;
        
        // 0年目の初期値
        propertyValues.push(currentPropertyValue);
        cumulativeRentIncomes.push(0);
        cumulativeNetIncomes.push(0);
        totalAssetValues.push(currentPropertyValue);
        
        // 1年目から20年目までの計算
        for (let year = 1; year <= 20; year++) {
            // 物件価値の成長（年間変動率を適用）
            currentPropertyValue *= (1 + data.propertyValueGrowthRate / 100);
            
            // 家賃収入の成長（年間上昇率を適用）
            currentRent *= (1 + data.rentGrowthRate / 100);
            
            // 経費は一定とする（より詳細なモデルでは経費も上昇させることができる）
            
            // 当年の純収益
            const yearlyNetIncome = currentRent - currentExpenses;
            
            // 累計値の更新
            cumulativeRentIncome += currentRent;
            cumulativeNetIncome += yearlyNetIncome;
            
            // 各年のデータをグラフ用配列に追加
            propertyValues.push(currentPropertyValue);
            cumulativeRentIncomes.push(cumulativeRentIncome);
            cumulativeNetIncomes.push(cumulativeNetIncome);
            totalAssetValues.push(currentPropertyValue + cumulativeNetIncome);
        }
        
        // 20年後の結果表示
        futurePropertyValue.textContent = formatCurrency(propertyValues[20]) + '円';
        totalRentIncome.textContent = formatCurrency(cumulativeRentIncomes[20]) + '円';
        totalNetIncome.textContent = formatCurrency(cumulativeNetIncomes[20]) + '円';
        totalAssetGrowth.textContent = formatCurrency(totalAssetValues[20] - initialInvestment) + '円';
        totalROI.textContent = ((totalAssetValues[20] - initialInvestment) / initialInvestment * 100).toFixed(2) + '%';
        
        // 既存のチャートがあれば破棄
        if (projectionChart) {
            projectionChart.destroy();
        }
        
        // 新しいチャートの作成
        projectionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: '物件価値',
                        data: propertyValues,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: '累計純収益',
                        data: cumulativeNetIncomes,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: '総資産価値',
                        data: totalAssetValues,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '経過年数'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '金額 (円)'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(0) + '百万';
                                } else if (value >= 10000) {
                                    return (value / 10000).toFixed(0) + '万';
                                }
                                return value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += formatCurrency(context.raw) + '円';
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '20年間の資産推移シミュレーション'
                    }
                }
            }
        });
    }

    // プリセットデータの設定（サンプル表示用）
    function loadSampleData() {
        propertyPrice.value = '30000000';
        monthlyRent.value = '150000';
        purchaseExpenses.value = '1000000';
        managementFee.value = '10000';
        repairReserve.value = '5000';
        propertyTax.value = '120000';
        insurance.value = '20000';
        vacancyRate.value = '5';
    }

    // ページロード時にサンプルデータをロード
    loadSampleData();
    
    // 物件価値変動率と家賃上昇率の入力イベントリスナー
    propertyValueGrowth.addEventListener('input', recalculateProjection);
    rentGrowth.addEventListener('input', recalculateProjection);
    
    // 資産推移の再計算
    function recalculateProjection() {
        // 計算ボタンがクリックされた状態（結果が表示されている状態）でのみ実行
        if (grossYield.textContent !== '-') {
            const price = Number(propertyPrice.value) || 0;
            const rent = Number(monthlyRent.value) || 0;
            const expenses = Number(purchaseExpenses.value) || 0;
            const management = Number(managementFee.value) || 0;
            const repair = Number(repairReserve.value) || 0;
            const tax = Number(propertyTax.value) || 0;
            const ins = Number(insurance.value) || 0;
            const vacancy = Number(vacancyRate.value) || 0;
            
            // 年間家賃収入と経費の計算
            const yearlyRent = rent * 12 * (1 - vacancy / 100);
            const yearlyExpenses = (management + repair) * 12 + tax + ins;
            const yearlyNetIncome = yearlyRent - yearlyExpenses;
            
            // 資産推移シミュレーションの更新
            updateProjectionChart({
                price,
                expenses,
                yearlyRent,
                yearlyExpenses,
                yearlyNetIncome,
                propertyValueGrowthRate: Number(propertyValueGrowth.value) || 0,
                rentGrowthRate: Number(rentGrowth.value) || 0
            });
        }
    }
});

// 入力フィールドのバリデーション（負の値防止）
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value < 0) {
            this.value = 0;
        }
    });
});