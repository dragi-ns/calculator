(function IIFE() {
    const MAX_DISPLAY_LEGNTH = 12;
    const UNICODE_OPERATORS = {
        '+': '&plus;',
        '-': '&minus;',
        '/': '&divide;',
        'x': '&times;'
    };
    const KEY_TO_VALUE = Object.freeze({
        Backspace: 'lc',
        Enter: '=',
        '*': 'X'
    });
    const OPERATIONS = Object.freeze({
        '+': (leftOperand, rightOperand) => leftOperand + rightOperand,
        '-': (leftOperand, rightOperand) => leftOperand - rightOperand,
        'x': (leftOperand, rightOperand) => leftOperand * rightOperand,
        '/': (leftOperand, rightOperand) => leftOperand / rightOperand
    });
    const ACTIONS = Object.freeze({
        'ac': allClear,
        'lc': lastClear,
        '=': operate,
        '+/-': toggleSign
    });
    const state = {
        userValue: '0',
        leftOperand: null,
        rightOperand: null,
        operator: null,
        history: []
    };

    const display = document.querySelector('.display');
    const resultContainer = document.querySelector('.result-container');
    const resultContainerPadding = parseFloat(
        getComputedStyle(resultContainer).paddingLeft,
        10
    );
    const result = document.querySelector('.result');
    const resultBaseFontSize = parseFloat(getComputedStyle(result).fontSize, 10);
    updateResult(state.userValue);
    const displayHistory = document.querySelector('.history');

    const keyboard = document.querySelector('.keyboard');
    keyboard.addEventListener('click', handleInput);
    document.body.addEventListener('keydown', handleInput);
    document.body.addEventListener('keyup', handleInput);

    function updateResult(value) {
        result.style.fontSize = `${resultBaseFontSize}px`;
        result.textContent = value;
        if (result.clientWidth >= display.clientWidth - resultContainerPadding) {
            result.style.fontSize = `${resultBaseFontSize - result.textContent.length * 1.5}px`;
        }
    }

    function updateDisplayHistory() {
        displayHistory.innerHTML = state.history.join(' ') || '&nbsp;';
    }

    function handleInput(event) {
        if (event.altKey || event.ctrlKey || event.shiftKey) {
            return;
        }

        let target = null;
        if (event.type === 'click') {
            target = event.target;
            if (!isValidTarget(target)) {
                return;
            }
        } else {
            const value = KEY_TO_VALUE[event.key] ?? event.key;
            target = document.querySelector(`button[data-value="${value}"]`);
            if (!isValidTarget(target)) {
                return;
            }

            if (event.type === 'keyup') {
                target.classList.remove('active');
                return;
            }

            target.classList.add('active');
        }

        event.preventDefault();

        const targetType = target.dataset.type.toLowerCase();
        const targetValue = target.dataset.value.toLowerCase();
        if (targetType === 'operator' && targetValue in OPERATIONS) {
            handleOperator(targetValue);
        } else if (targetType === 'action' && targetValue in ACTIONS) {
            ACTIONS[targetValue]();
        } else if (targetType === 'operand' && targetValue.length === 1 && (targetValue === '.' || !isNaN(targetValue))) {
            handleOperand(targetValue);
        } else {
            console.warn('Invalid target type/value!');
        }
    }

    function isValidTarget(target) {
        if (!target || target.tagName !== 'BUTTON' || !target.dataset.type || !target.dataset.value) {
            return false;
        }
        return true;
    }

    function handleOperator(operator) {
        if (state.leftOperand === null) {
            state.leftOperand = +state.userValue;
            state.userValue = '';
            state.operator = operator;
            state.history.push(state.leftOperand, UNICODE_OPERATORS[state.operator]);
        } else if (!state.operator) {
            state.operator = operator;
            state.history = [state.leftOperand, UNICODE_OPERATORS[state.operator]];
        } else if (state.userValue) {
            operate(operator);
        } else {
            state.operator = operator;
            state.history[1] = UNICODE_OPERATORS[state.operator];
        }
        updateDisplayHistory();
    }

    function handleOperand(operand) {
        if (state.userValue.length >= MAX_DISPLAY_LEGNTH) {
            return;
        }

        if (state.leftOperand !== null && !state.operator) {
            state.leftOperand = null;
            state.history = [];
            updateDisplayHistory();
        }

        if (operand === '.') {
            if (!state.userValue) {
                state.userValue = '0.';
            } else if (!state.userValue.includes(operand)) {
                state.userValue += operand;
            }
        } else {
            if (operand !== '0' && state.userValue === '0') {
                state.userValue = operand;
            } else if (state.userValue !== '0') {
                state.userValue += operand;
            }
        }
        updateResult(state.userValue);
    }

    function allClear() {
        state.userValue = '0';
        state.leftOperand = null;
        state.rightOperand = null;
        state.operator = null;
        state.history = [];
        updateResult(state.userValue);
        updateDisplayHistory();
    }

    function lastClear() {
        if (state.leftOperand !== null && !state.operator) {
            state.leftOperand = null;
            state.history = [];
            updateDisplayHistory();
        }

        const newUserValue = state.userValue.slice(0, state.userValue.length - 1);
        if (!newUserValue || newUserValue === '-') {
            state.userValue = '0';
        } else {
            state.userValue = newUserValue;
        }
        updateResult(state.userValue);
    }

    function toggleSign() {
        if (!state.userValue && state.leftOperand !== null && state.leftOperand !== 0) {
            state.leftOperand = -state.leftOperand;
            state.history = [state.leftOperand];
            if (state.operator) {
                state.history.push(UNICODE_OPERATORS[state.operator]);
            }
            updateResult(state.leftOperand);
            updateDisplayHistory();
        } else if (state.userValue && state.userValue !== '0') {
            if (!state.userValue.startsWith('-')) {
                state.userValue = `-${state.userValue}`;
            } else {
                state.userValue = state.userValue.slice(1);
            }
            updateResult(state.userValue);
        }
    }

    function operate(newOperator = null) {
        if (state.leftOperand === null || (state.rightOperand === null && !state.userValue)) {
            return;
        }

        state.rightOperand = +state.userValue;
        state.userValue = '';
        const operationResult = OPERATIONS[state.operator](state.leftOperand, state.rightOperand);
        if (!Number.isFinite(operationResult)) {
            allClear();
            updateResult('Error');
            return;
        }
        let roundedResult = Math.round((operationResult + Number.EPSILON) * 100) / 100;
        if (roundedResult.toString().length > MAX_DISPLAY_LEGNTH) {
            roundedResult = roundedResult.toExponential(2);
        }
        state.leftOperand = +roundedResult;
        if (!newOperator) {
            state.history.push(state.rightOperand, '=');
        } else {
            state.history = [state.leftOperand, UNICODE_OPERATORS[state.operator]];
        }
        state.rightOperand = null;
        state.operator = newOperator;
        updateResult(roundedResult);
        updateDisplayHistory();
    }
}());
