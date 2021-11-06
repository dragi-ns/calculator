(function IIFE() {
    const OPERATIONS = {
        '+': add,
        '-': subtract,
        '*': multiply,
        '/': divide
    };

    function add(left, right) {
        return left + right;
    }

    function subtract(left, right) {
        return left - right;
    }

    function multiply(left, right) {
        return left * right;
    }

    function divide(left, right) {
        return left / right;
    }

    function operate(operator, left, right) {
        if (operator in OPERATIONS) {
            return OPERATIONS[operator](left, right);
        }
        return null;
    }
}());
