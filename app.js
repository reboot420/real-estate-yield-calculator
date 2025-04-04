// DOM要素の取得
document.addEventListener('DOMContentLoaded', () => {
    // データベース管理用のオブジェクト
    const propertyDB = {
        // 保存された物件データを取得
        getProperties: function() {
            const properties = localStorage.getItem('properties');
            return properties ? JSON.parse(properties) : [];
        },
        
        // 新しい物件を保存
        saveProperty: function(property) {
            const properties = this.getProperties();
            // 一意のIDを生成
            property.id = Date.now().toString();
            properties.push(property);
            localStorage.setItem('properties', JSON.stringify(properties));
            return property;
        },
        
        // IDで物件を取得
        getPropertyById: function(id) {
            const properties = this.getProperties();
            return properties.find(property => property.id === id);
        },
        
        // 物件を削除
        deleteProperty: function(id) {
            const properties = this.getProperties();
            const filteredProperties = properties.filter(property => property.id !== id);
            localStorage.setItem('properties', JSON.stringify(filteredProperties));
        }
    };

    // 入力フィールド
    const propertyPrice = document.getElementById('property-price');
    const monthlyRent = document.getElementById('monthly-rent');
    const purchaseExpenses = document.getElementById('purchase-expenses');
    const managementFee = document.getElementById('management-fee');
    const repairReserve = document.getElementById('repair-reserve');
    const propertyTax = document.getElementById('property-tax');
    const insurance = document.getElementById('insurance');
    const vacancyRate = document.getElementById('vacancy-rate');
    const propertyName = document.getElementById('property-name');
    
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
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    
    // 保存済み物件リスト
    const savedPropertiesList = document.getElementById('saved-properties-list');
    
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
    
    // 保存ボタンのイベントリスナー
    saveBtn.addEventListener('click', () => {
        // 結果が表示されている場合のみ保存可能
        if (grossYield.textContent !== '-') {
            // 物件名のバリデーション
            if (!propertyName.value) {
                alert('物件名を入力してください');
                return;
            }
            
            // 保存する物件データの収集
            const propertyData = {
                name: propertyName.value,
                // 入力値
                inputs: {
                    propertyPrice: propertyPrice.value,
                    monthlyRent: monthlyRent.value,
                    purchaseExpenses: purchaseExpenses.value,
                    managementFee: managementFee.value,
                    repairReserve: repairReserve.value,
                    propertyTax: propertyTax.value,
                    insurance: insurance.value,
                    vacancyRate: vacancyRate.value
                },
                // 結果
                results: {
                    grossYield: grossYield.textContent,
                    netYield: netYield.textContent,
                    annualIncome: annualIncome.textContent,
                    annualExpenses: annualExpenses.textContent,
                    annualNetIncome: annualNetIncome.textContent,
                    paybackPeriod: paybackPeriod.textContent
                }
            };
            
            // データベースに保存
            propertyDB.saveProperty(propertyData);
            
            // 物件リストを更新
            renderPropertyList();
            
            alert('物件「' + propertyName.value + '」を保存しました');
        } else {
            alert('計算結果がありません。この物件を保存する前に計算してください。');
        }
    });
    
    // 読み込みボタンのイベントリスナー
    loadBtn.addEventListener('click', () => {
        const properties = propertyDB.getProperties();
        if (properties.length === 0) {
            alert('保存済みの物件がありません');
            return;
        }
        
        // 簡易的なウィンドウで選択できる一覧を表示
        let message = '読み込む物件の番号を入力してください:\n';
        properties.forEach((property, index) => {
            message += `${index + 1}) ${property.name} (${property.results.netYield})\n`;
        });
        
        const input = prompt(message);
        if (input === null) return;
        
        const index = parseInt(input) - 1;
        if (isNaN(index) || index < 0 || index >= properties.length) {
            alert('無効な番号です');
            return;
        }
        
        // 選択された物件を読み込む
        loadProperty(properties[index]);
    });
    
    // リセットボタンのイベントリスナー
    resetBtn.addEventListener('click', () => {
        // 物件名もリセット
        propertyName.value = '';
        
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
    
    // 物件リストのレンダリング
    function renderPropertyList() {
        const properties = propertyDB.getProperties();
        
        if (properties.length === 0) {
            savedPropertiesList.innerHTML = '<p class="no-properties-message">保存された物件はありません</p>';
            return;
        }
        
        let html = '';
        properties.forEach(property => {
            html += `
                <div class="property-item" data-id="${property.id}">
                    <div class="property-info">
                        <div class="property-name">${property.name}</div>
                        <div class="property-yield">実質利回り: ${property.results.netYield}</div>
                    </div>
                    <div class="property-actions">
                        <button class="property-load-btn">読み込む</button>
                        <button class="property-delete-btn">削除</button>
                    </div>
                </div>
            `;
        });
        
        savedPropertiesList.innerHTML = html;
        
        // 各ボタンにイベントリスナーを追加
        document.querySelectorAll('.property-load-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.property-item').dataset.id;
                const property = propertyDB.getPropertyById(id);
                if (property) {
                    loadProperty(property);
                }
            });
        });
        
        document.querySelectorAll('.property-delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.closest('.property-item').dataset.id;
                const property = propertyDB.getPropertyById(id);
                
                if (confirm(`物件 "${property.name}" を削除しますか？`)) {
                    propertyDB.deleteProperty(id);
                    renderPropertyList();
                }
            });
        });
    }
    
    // 物件データの読み込み
    function loadProperty(property) {
        // 入力値の設定
        propertyName.value = property.name;
        propertyPrice.value = property.inputs.propertyPrice;
        monthlyRent.value = property.inputs.monthlyRent;
        purchaseExpenses.value = property.inputs.purchaseExpenses;
        managementFee.value = property.inputs.managementFee;
        repairReserve.value = property.inputs.repairReserve;
        propertyTax.value = property.inputs.propertyTax;
        insurance.value = property.inputs.insurance;
        vacancyRate.value = property.inputs.vacancyRate;
        
        // 結果の表示
        grossYield.textContent = property.results.grossYield;
        netYield.textContent = property.results.netYield;
        annualIncome.textContent = property.results.annualIncome;
        annualExpenses.textContent = property.results.annualExpenses;
        annualNetIncome.textContent = property.results.annualNetIncome;
        paybackPeriod.textContent = property.results.paybackPeriod;
        
        // チャートの更新
        // 表面利回りと実質利回りの数値を抽出
        const grossYieldValue = parseFloat(property.results.grossYield);
        const netYieldValue = parseFloat(property.results.netYield);
        updateChart(grossYieldValue, netYieldValue);
        
        alert(`物件 "${property.name}" を読み込みました`);
    }
    
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
        propertyName.value = 'サンプル物件';
    }

    // 初期読み込み処理
    renderPropertyList();
    
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