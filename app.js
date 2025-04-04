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
});

// 入力フィールドのバリデーション（負の値防止）
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value < 0) {
            this.value = 0;
        }
    });
});