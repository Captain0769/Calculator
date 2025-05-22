class Calculator {
    constructor() {
        // Normal calculator state
        this.expression = '';
        this.result = '0';
        this.history = [];
        this.isDarkMode = true;
        this.lastResult = null;
        this.isNewCalculation = true;
        this.lastOperator = null;
        this.currentMode = 'calculator';

        // Scientific calculator state
        this.scientificExpression = '';
        this.scientificResult = '0';
        this.isScientificNewCalculation = true;
        
        // DOM Elements
        this.initializeDOMElements();
        this.initializeEventListeners();
        this.loadHistory();
        this.loadTheme();
        this.initializeConverters();
    }

    initializeDOMElements() {
        // Calculator elements
        this.expressionDisplay = document.querySelector('#calculator .expression');
        this.resultDisplay = document.querySelector('#calculator .result');
        this.keypad = document.querySelector('.keypad');
        this.historyList = document.querySelector('.history-list');
        this.historyPanel = document.querySelector('.history-panel');
        this.historyToggle = document.querySelector('#history-toggle');
        this.themeToggle = document.querySelector('#theme-toggle');
        this.clearHistoryBtn = document.querySelector('.clear-history');

        // Scientific calculator elements
        this.scientificExpressionDisplay = document.querySelector('#scientific .expression');
        this.scientificResultDisplay = document.querySelector('#scientific .result');
        this.scientificKeypad = document.querySelector('.scientific-keypad');
        this.themeToggleScientific = document.querySelector('#theme-toggle-scientific');
        this.historyToggleScientific = document.querySelector('#history-toggle-scientific');

        // Mode switcher
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.calculator = document.getElementById('calculator');
        this.scientific = document.getElementById('scientific');
        this.converter = document.getElementById('converter');

        // Converter elements
        this.converterTabs = document.querySelectorAll('.tab-btn');
        this.unitConverter = document.getElementById('unit-converter');
        this.currencyConverter = document.getElementById('currency-converter');
        this.unitType = document.getElementById('unit-type');
        this.fromUnit = document.getElementById('from-unit');
        this.toUnit = document.getElementById('to-unit');
        this.fromValue = document.getElementById('from-value');
        this.toValue = document.getElementById('to-value');
        this.fromCurrency = document.getElementById('from-currency');
        this.toCurrency = document.getElementById('to-currency');
        this.fromAmount = document.getElementById('from-amount');
        this.toAmount = document.getElementById('to-amount');
        this.exchangeRate = document.getElementById('exchange-rate');

        // Swap arrows
        this.unitSwapArrow = document.querySelector('#unit-converter .converter-arrow');
        this.currencySwapArrow = document.querySelector('#currency-converter .converter-arrow');
    }

    initializeEventListeners() {
        // Mode switching
        this.modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchMode(button.dataset.mode);
            });
        });

        // Calculator keypad
        this.keypad.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn')) {
                this.handleButtonClick(e.target);
            }
        });

        // Scientific calculator keypad
        this.scientificKeypad.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn')) {
                this.handleScientificButtonClick(e.target);
            }
        });

        // Converter events
        this.converterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchConverterTab(tab.dataset.tab);
            });
        });

        this.unitType.addEventListener('change', () => {
            this.updateUnitOptions();
        });

        this.fromUnit.addEventListener('change', () => this.convertUnit());
        this.toUnit.addEventListener('change', () => this.convertUnit());
        this.fromValue.addEventListener('input', () => this.convertUnit());

        this.fromCurrency.addEventListener('change', () => this.convertCurrency());
        this.toCurrency.addEventListener('change', () => this.convertCurrency());
        this.fromAmount.addEventListener('input', () => this.convertCurrency());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.themeToggleScientific.addEventListener('click', () => this.toggleTheme());

        // History toggle
        this.historyToggle.addEventListener('click', () => this.toggleHistoryPanel());
        this.historyToggleScientific.addEventListener('click', () => this.toggleHistoryPanel());

        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (this.currentMode === 'calculator') {
                this.handleKeyboardInput(e);
            } else if (this.currentMode === 'scientific') {
                this.handleScientificKeyboardInput(e);
            }
        });

        // Close history panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.historyPanel.contains(e.target) && 
                !this.historyToggle.contains(e.target) && 
                !this.historyToggleScientific.contains(e.target) &&
                this.historyPanel.classList.contains('active')) {
                this.historyPanel.classList.remove('active');
            }
        });

        // Vibration feedback
        if ('vibrate' in navigator) {
            this.keypad.addEventListener('click', () => navigator.vibrate(50));
            this.scientificKeypad.addEventListener('click', () => navigator.vibrate(50));
        }

        // Swap arrows
        if (this.unitSwapArrow) {
            this.unitSwapArrow.addEventListener('click', () => this.swapUnits());
        }
        if (this.currencySwapArrow) {
            this.currencySwapArrow.addEventListener('click', () => this.swapCurrencies());
        }
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        this.calculator.style.display = mode === 'calculator' ? 'block' : 'none';
        this.scientific.style.display = mode === 'scientific' ? 'block' : 'none';
        this.converter.style.display = mode === 'converter' ? 'block' : 'none';

        // Update display based on current mode
        if (mode === 'calculator') {
            this.updateDisplay();
        } else if (mode === 'scientific') {
            this.updateScientificDisplay();
        }
    }

    switchConverterTab(tab) {
        this.converterTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        this.unitConverter.style.display = tab === 'unit' ? 'block' : 'none';
        this.currencyConverter.style.display = tab === 'currency' ? 'block' : 'none';
    }

    handleButtonClick(button) {
        const action = button.dataset.action;
        const value = button.textContent;

        if (action) {
            this.handleAction(action);
        } else {
            this.appendNumber(value);
        }

        this.updateDisplay();
        this.playClickSound();
    }

    handleKeyboardInput(e) {
        const key = e.key;

        if (/[0-9]/.test(key)) {
            this.appendNumber(key);
        } else if (key === '.') {
            this.appendDecimal();
        } else if (key === '%') {
            this.handleAction('percent');
        } else if (key === '+') {
            this.handleAction('add');
        } else if (key === '-') {
            this.handleAction('subtract');
        } else if (key === '*') {
            this.handleAction('multiply');
        } else if (key === '/') {
            this.handleAction('divide');
        } else if (key === 'Enter' || key === '=') {
            this.handleAction('calculate');
        } else if (key === 'Backspace') {
            this.handleAction('delete');
        } else if (key === 'Escape') {
            this.handleAction('clear');
        }

        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'percent':
                this.calculatePercent();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.appendOperator(action);
                break;
            case 'calculate':
                this.calculate();
                break;
            case 'decimal':
                this.appendDecimal();
                break;
        }
    }

    appendNumber(number) {
        if (this.isNewCalculation) {
            this.result = number;
            this.isNewCalculation = false;
        } else if (this.result === '0') {
            this.result = number;
        } else {
            this.result += number;
        }
    }

    appendDecimal() {
        if (this.isNewCalculation) {
            this.result = '0.';
            this.isNewCalculation = false;
        } else if (!this.result.includes('.')) {
            this.result += '.';
        }
    }

    appendOperator(operator) {
        const operators = {
            add: '+',
            subtract: '−',
            multiply: '×',
            divide: '÷'
        };

        if (this.isNewCalculation && this.lastResult !== null) {
            this.expression = this.lastResult + operators[operator];
            this.result = '0';
            this.isNewCalculation = false;
        } else if (this.expression && this.result === '0') {
            this.expression = this.expression.slice(0, -1) + operators[operator];
        } else {
            if (this.expression) {
                this.calculate();
            }
            this.expression = this.result + operators[operator];
            this.result = '0';
        }
        this.lastOperator = operator;
    }

    calculate() {
        if (!this.expression) return;

        const expression = this.expression + this.result;
        try {
            let sanitizedExpression = expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/\^/g, '**'); // Handle power operation
            
            // Handle scientific notation
            sanitizedExpression = sanitizedExpression.replace(/(\d+)e(\d+)/g, '$1*10**$2');
            
            // Use Function constructor instead of eval for better security
            const calculatedResult = new Function('return ' + sanitizedExpression)();
            
            if (!isFinite(calculatedResult)) {
                throw new Error('Invalid calculation');
            }

            // Handle division by zero
            if (this.lastOperator === 'divide' && parseFloat(this.result) === 0) {
                throw new Error('Division by zero');
            }

            this.lastResult = this.formatResult(calculatedResult);
            this.addToHistory(expression, this.lastResult);
            this.result = this.lastResult;
            this.expression = '';
            this.isNewCalculation = true;
            this.lastOperator = null;
        } catch (error) {
            this.handleCalculationError(error);
        }
    }

    handleCalculationError(error) {
        if (error.message === 'Division by zero') {
            this.result = 'Cannot divide by zero';
        } else if (error.message.includes('Invalid input')) {
            this.result = error.message;
        } else {
            this.result = 'Error';
        }
        this.expression = '';
        this.isNewCalculation = true;
        this.lastResult = null;
        this.lastOperator = null;
    }

    calculatePercent() {
        try {
            let percentValue;
            if (this.expression) {
                // If there's an expression, calculate percentage of the last number
                const lastNumber = parseFloat(this.result);
                if (isNaN(lastNumber)) {
                    throw new Error('Invalid number');
                }
                percentValue = lastNumber / 100;
            } else {
                // If no expression, just convert current number to percentage
                percentValue = parseFloat(this.result) / 100;
                if (isNaN(percentValue)) {
                    throw new Error('Invalid number');
                }
            }
            
            if (!isFinite(percentValue)) {
                throw new Error('Invalid percentage calculation');
            }

            this.result = this.formatResult(percentValue);
            this.isNewCalculation = true;
        } catch (error) {
            this.handleCalculationError(error);
        }
    }

    formatResult(number) {
        // Handle very large or small numbers
        if (Math.abs(number) > 1e15 || (Math.abs(number) < 1e-15 && number !== 0)) {
            return number.toExponential(8);
        }

        // For trigonometric results, use more precise formatting
        if (Math.abs(number) < 1e-10) {
            return '0';
        }

        // Format regular numbers
        const formatted = Number.isInteger(number) 
            ? number.toString() 
            : number.toFixed(8).replace(/\.?0+$/, '');

        // Handle very long numbers
        if (formatted.length > 15) {
            return Number(number).toExponential(8);
        }

        return formatted;
    }

    updateDisplay() {
        this.expressionDisplay.textContent = this.expression;
        this.resultDisplay.textContent = this.result;
    }

    addToHistory(expression, result) {
        const historyItem = {
            expression,
            result,
            timestamp: new Date().toISOString()
        };

        this.history.unshift(historyItem);
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = this.history
            .map(item => `
                <div class="history-item">
                    <div class="history-expression">${item.expression} = ${item.result}</div>
                    <div class="history-timestamp">${new Date(item.timestamp).toLocaleTimeString()}</div>
                </div>
            `)
            .join('');
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
            this.updateHistoryDisplay();
        }
    }

    toggleHistoryPanel() {
        this.historyPanel.classList.toggle('active');
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('light-mode');
        
        // Update theme icon
        const themeIcon = this.themeToggle.querySelector('i');
        themeIcon.className = this.isDarkMode ? 'fas fa-moon' : 'fas fa-sun';
        
        localStorage.setItem('calculatorTheme', this.isDarkMode ? 'dark' : 'light');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('calculatorTheme');
        if (savedTheme === 'light') {
            this.isDarkMode = false;
            document.body.classList.add('light-mode');
            const themeIcon = this.themeToggle.querySelector('i');
            themeIcon.className = 'fas fa-sun';
        }
    }

    playClickSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.volume = 0.1;
        audio.play().catch(() => {});
    }

    clear() {
        this.expression = '';
        this.result = '0';
        this.lastResult = null;
        this.isNewCalculation = true;
        this.lastOperator = null;
        this.updateDisplay();
    }

    delete() {
        if (this.isNewCalculation) {
            this.clear();
            return;
        }

        if (this.result.length > 1) {
            this.result = this.result.slice(0, -1);
        } else {
            this.result = '0';
        }
        this.updateDisplay();
    }

    handleScientificButtonClick(button) {
        const action = button.dataset.action;
        const value = button.textContent;

        if (action) {
            this.handleScientificAction(action);
        } else {
            this.appendScientificNumber(value);
        }

        this.updateScientificDisplay();
        this.playClickSound();
    }

    appendScientificNumber(number) {
        if (this.isScientificNewCalculation) {
            this.scientificResult = number;
            this.isScientificNewCalculation = false;
        } else if (this.scientificResult === '0') {
            this.scientificResult = number;
        } else {
            this.scientificResult += number;
        }
    }

    handleScientificAction(action) {
        try {
            let result;
            const currentValue = parseFloat(this.scientificResult);

            switch (action) {
                case 'sin':
                    if (isNaN(currentValue)) throw new Error('Invalid input');
                    result = this.calculateSin(currentValue);
                    break;
                case 'cos':
                    if (isNaN(currentValue)) throw new Error('Invalid input');
                    result = this.calculateCos(currentValue);
                    break;
                case 'tan':
                    if (isNaN(currentValue)) throw new Error('Invalid input');
                    result = this.calculateTan(currentValue);
                    break;
                case 'log':
                    if (isNaN(currentValue) || currentValue <= 0) {
                        throw new Error('Invalid input for logarithm');
                    }
                    result = Math.log10(currentValue);
                    break;
                case 'ln':
                    if (isNaN(currentValue) || currentValue <= 0) {
                        throw new Error('Invalid input for natural logarithm');
                    }
                    result = Math.log(currentValue);
                    break;
                case 'pi':
                    result = Math.PI;
                    break;
                case 'square':
                    if (isNaN(currentValue)) throw new Error('Invalid input');
                    result = Math.pow(currentValue, 2);
                    break;
                case 'sqrt':
                    if (isNaN(currentValue) || currentValue < 0) {
                        throw new Error('Invalid input for square root');
                    }
                    result = Math.sqrt(currentValue);
                    break;
                case 'power':
                    if (isNaN(currentValue)) throw new Error('Invalid input');
                    this.scientificExpression = this.scientificResult + '^';
                    this.scientificResult = '0';
                    return;
                case 'exp':
                    if (isNaN(currentValue)) throw new Error('Invalid input');
                    this.scientificExpression = this.scientificResult + 'e';
                    this.scientificResult = '0';
                    return;
                case 'factorial':
                    if (isNaN(currentValue) || !Number.isInteger(currentValue) || currentValue < 0) {
                        throw new Error('Invalid input for factorial');
                    }
                    if (currentValue > 170) {
                        throw new Error('Number too large for factorial');
                    }
                    result = this.factorial(currentValue);
                    break;
                case 'clear':
                    this.clearScientific();
                    return;
                case 'calculate':
                    this.calculateScientific();
                    return;
                case 'delete':
                    this.deleteScientific();
                    return;
                case 'add':
                    this.appendScientificOperator('+');
                    return;
                case 'subtract':
                    this.appendScientificOperator('−');
                    return;
                case 'multiply':
                    this.appendScientificOperator('×');
                    return;
                case 'divide':
                    this.appendScientificOperator('÷');
                    return;
                case 'decimal':
                    this.appendScientificDecimal();
                    return;
                default:
                    return;
            }

            if (!isFinite(result)) {
                throw new Error('Result is not a finite number');
            }

            this.scientificResult = this.formatResult(result);
            this.isScientificNewCalculation = true;
        } catch (error) {
            this.handleScientificError(error);
        }
    }

    appendScientificOperator(operator) {
        if (this.isScientificNewCalculation && this.scientificResult !== '0') {
            this.scientificExpression = this.scientificResult + operator;
            this.scientificResult = '0';
            this.isScientificNewCalculation = false;
        } else if (this.scientificExpression) {
            this.calculateScientific();
            this.scientificExpression = this.scientificResult + operator;
            this.scientificResult = '0';
        } else {
            this.scientificExpression = this.scientificResult + operator;
            this.scientificResult = '0';
        }
    }

    deleteScientific() {
        if (this.isScientificNewCalculation) {
            this.clearScientific();
            return;
        }

        if (this.scientificResult.length > 1) {
            this.scientificResult = this.scientificResult.slice(0, -1);
        } else {
            this.scientificResult = '0';
        }
        this.updateScientificDisplay();
    }

    calculateScientific() {
        if (!this.scientificExpression) return;

        const expression = this.scientificExpression + this.scientificResult;
        try {
            let sanitizedExpression = expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/\^/g, '**');
            
            sanitizedExpression = sanitizedExpression.replace(/(\d+)e(\d+)/g, '$1*10**$2');
            
            const calculatedResult = new Function('return ' + sanitizedExpression)();
            
            if (!isFinite(calculatedResult)) {
                throw new Error('Invalid calculation');
            }

            this.scientificResult = this.formatResult(calculatedResult);
            this.addToHistory(expression, this.scientificResult);
            this.scientificExpression = '';
            this.isScientificNewCalculation = true;
        } catch (error) {
            this.handleScientificError(error);
        }
    }

    handleScientificError(error) {
        if (error.message === 'Division by zero') {
            this.scientificResult = 'Cannot divide by zero';
        } else if (error.message.includes('Invalid input')) {
            this.scientificResult = error.message;
        } else if (error.message.includes('too large')) {
            this.scientificResult = error.message;
        } else {
            this.scientificResult = 'Error';
        }
        this.scientificExpression = '';
        this.isScientificNewCalculation = true;
    }

    updateScientificDisplay() {
        this.scientificExpressionDisplay.textContent = this.scientificExpression;
        this.scientificResultDisplay.textContent = this.scientificResult;
    }

    handleScientificKeyboardInput(e) {
        const key = e.key.toLowerCase();
        
        if (/[0-9]/.test(key)) {
            this.appendScientificNumber(key);
        } else if (key === '.') {
            this.appendScientificDecimal();
        } else if (key === 'p') {
            this.handleScientificAction('pi');
        } else if (key === 'e') {
            this.handleScientificAction('exp');
        } else if (key === '^') {
            this.handleScientificAction('power');
        } else if (key === '!') {
            this.handleScientificAction('factorial');
        } else if (key === 'enter' || key === '=') {
            this.handleScientificAction('calculate');
        } else if (key === 'escape') {
            this.handleScientificAction('clear');
        } else if (key === 'backspace') {
            this.handleScientificAction('delete');
        } else if (key === '+') {
            this.handleScientificAction('add');
        } else if (key === '-') {
            this.handleScientificAction('subtract');
        } else if (key === '*') {
            this.handleScientificAction('multiply');
        } else if (key === '/') {
            this.handleScientificAction('divide');
        }
        
        this.updateScientificDisplay();
    }

    appendScientificDecimal() {
        if (this.isScientificNewCalculation) {
            this.scientificResult = '0.';
            this.isScientificNewCalculation = false;
        } else if (!this.scientificResult.includes('.')) {
            this.scientificResult += '.';
        }
    }

    initializeConverters() {
        // Unit conversion data
        this.units = {
            length: {
                meter: 1,
                kilometer: 1000,
                centimeter: 0.01,
                millimeter: 0.001,
                inch: 0.0254,
                foot: 0.3048,
                yard: 0.9144,
                mile: 1609.344
            },
            weight: {
                kilogram: 1,
                gram: 0.001,
                pound: 0.45359237,
                ounce: 0.028349523125
            },
            temperature: {
                celsius: 1,
                fahrenheit: 1,
                kelvin: 1
            },
            area: {
                'square meter': 1,
                'square kilometer': 1000000,
                'square centimeter': 0.0001,
                'square millimeter': 0.000001,
                'square inch': 0.00064516,
                'square foot': 0.09290304,
                'square yard': 0.83612736,
                acre: 4046.8564224,
                hectare: 10000
            },
            volume: {
                'cubic meter': 1,
                liter: 0.001,
                milliliter: 0.000001,
                'cubic centimeter': 0.000001,
                'cubic inch': 0.000016387064,
                'cubic foot': 0.028316846592,
                gallon: 0.003785411784,
                quart: 0.000946352946,
                pint: 0.000473176473
            }
        };

        // Initialize unit options
        this.updateUnitOptions();

        // Initialize currency converter
        this.initializeCurrencyConverter();
    }

    updateUnitOptions() {
        const type = this.unitType.value;
        const units = this.units[type];
        
        this.fromUnit.innerHTML = '';
        this.toUnit.innerHTML = '';
        
        Object.keys(units).forEach(unit => {
            this.fromUnit.add(new Option(unit, unit));
            this.toUnit.add(new Option(unit, unit));
        });

        // Set default values
        this.fromUnit.value = Object.keys(units)[0];
        this.toUnit.value = Object.keys(units)[1];
        
        this.convertUnit();
    }

    convertUnit() {
        const type = this.unitType.value;
        const fromUnit = this.fromUnit.value;
        const toUnit = this.toUnit.value;
        const value = parseFloat(this.fromValue.value) || 0;

        let result;
        if (type === 'temperature') {
            result = this.convertTemperature(value, fromUnit, toUnit);
        } else {
            const fromFactor = this.units[type][fromUnit];
            const toFactor = this.units[type][toUnit];
            result = (value * fromFactor) / toFactor;
        }

        this.toValue.value = this.formatResult(result);
    }

    convertTemperature(value, fromUnit, toUnit) {
        let celsius;
        
        // Convert to Celsius first
        switch (fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
        }

        // Convert from Celsius to target unit
        switch (toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return (celsius * 9/5) + 32;
            case 'kelvin':
                return celsius + 273.15;
        }
    }

    async initializeCurrencyConverter() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            this.exchangeRates = data.rates;
            
            // Populate currency selects
            Object.keys(this.exchangeRates).forEach(currency => {
                this.fromCurrency.add(new Option(currency, currency));
                this.toCurrency.add(new Option(currency, currency));
            });

            // Set default values
            this.fromCurrency.value = 'USD';
            this.toCurrency.value = 'EUR';
            
            this.convertCurrency();
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            this.exchangeRate.textContent = 'Error loading exchange rates';
        }
    }

    convertCurrency() {
        const fromCurrency = this.fromCurrency.value;
        const toCurrency = this.toCurrency.value;
        const amount = parseFloat(this.fromAmount.value) || 0;

        if (this.exchangeRates) {
            const fromRate = this.exchangeRates[fromCurrency];
            const toRate = this.exchangeRates[toCurrency];
            const result = (amount / fromRate) * toRate;
            
            this.toAmount.value = this.formatResult(result);
            this.exchangeRate.textContent = `1 ${fromCurrency} = ${this.formatResult(toRate / fromRate)} ${toCurrency}`;
        }
    }

    clearScientific() {
        this.scientificExpression = '';
        this.scientificResult = '0';
        this.isScientificNewCalculation = true;
        this.updateScientificDisplay();
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    factorial(n) {
        // Handle special cases
        if (n === 0) return 1;  // 0! = 1 by definition
        if (n < 0) return NaN;  // Factorial is not defined for negative numbers
        if (!Number.isInteger(n)) return NaN;  // Factorial is only defined for integers
        
        // Check for large numbers that would cause overflow
        if (n > 170) {
            throw new Error('Number too large for factorial');
        }

        // Calculate factorial
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    calculateSin(degrees) {
        // Normalize the angle to be between 0 and 360
        degrees = degrees % 360;
        if (degrees < 0) degrees += 360;

        // Handle common angles for perfect accuracy
        if (degrees === 0 || degrees === 180) return 0;
        if (degrees === 90) return 1;
        if (degrees === 270) return -1;
        if (degrees === 30) return 0.5;
        if (degrees === 150) return 0.5;
        if (degrees === 210) return -0.5;
        if (degrees === 330) return -0.5;
        if (degrees === 45) return Math.sqrt(2) / 2;
        if (degrees === 135) return Math.sqrt(2) / 2;
        if (degrees === 225) return -Math.sqrt(2) / 2;
        if (degrees === 315) return -Math.sqrt(2) / 2;
        if (degrees === 60) return Math.sqrt(3) / 2;
        if (degrees === 120) return Math.sqrt(3) / 2;
        if (degrees === 240) return -Math.sqrt(3) / 2;
        if (degrees === 300) return -Math.sqrt(3) / 2;

        // For other angles, use the standard calculation
        return Math.sin(this.toRadians(degrees));
    }

    calculateCos(degrees) {
        // Normalize the angle to be between 0 and 360
        degrees = degrees % 360;
        if (degrees < 0) degrees += 360;

        // Handle common angles for perfect accuracy
        if (degrees === 0) return 1;
        if (degrees === 180) return -1;
        if (degrees === 90 || degrees === 270) return 0;
        if (degrees === 60 || degrees === 300) return 0.5;
        if (degrees === 120 || degrees === 240) return -0.5;
        if (degrees === 45 || degrees === 315) return Math.sqrt(2) / 2;
        if (degrees === 135 || degrees === 225) return -Math.sqrt(2) / 2;
        if (degrees === 30 || degrees === 330) return Math.sqrt(3) / 2;
        if (degrees === 150 || degrees === 210) return -Math.sqrt(3) / 2;

        // For other angles, use the standard calculation
        return Math.cos(this.toRadians(degrees));
    }

    calculateTan(degrees) {
        // Normalize the angle to be between 0 and 360
        degrees = degrees % 360;
        if (degrees < 0) degrees += 360;

        // Handle undefined cases
        if (degrees === 90 || degrees === 270) {
            throw new Error('Tangent undefined for 90° and 270°');
        }

        // Handle common angles for perfect accuracy
        if (degrees === 0 || degrees === 180) return 0;
        if (degrees === 45 || degrees === 225) return 1;
        if (degrees === 135 || degrees === 315) return -1;
        if (degrees === 30 || degrees === 210) return 1 / Math.sqrt(3);
        if (degrees === 150 || degrees === 330) return -1 / Math.sqrt(3);
        if (degrees === 60 || degrees === 240) return Math.sqrt(3);
        if (degrees === 120 || degrees === 300) return -Math.sqrt(3);

        // For other angles, use the standard calculation
        return Math.tan(this.toRadians(degrees));
    }

    swapUnits() {
        // Swap selected units
        const tempUnit = this.fromUnit.value;
        this.fromUnit.value = this.toUnit.value;
        this.toUnit.value = tempUnit;
        // Swap values
        const tempValue = this.fromValue.value;
        this.fromValue.value = this.toValue.value;
        this.toValue.value = tempValue;
        this.convertUnit();
    }

    swapCurrencies() {
        // Swap selected currencies
        const tempCurrency = this.fromCurrency.value;
        this.fromCurrency.value = this.toCurrency.value;
        this.toCurrency.value = tempCurrency;
        // Swap values
        const tempAmount = this.fromAmount.value;
        this.fromAmount.value = this.toAmount.value;
        this.toAmount.value = tempAmount;
        this.convertCurrency();
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
}); 