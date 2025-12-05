import React, { useState } from 'react';

const Calculator: React.FC = () => {
  const [value, setValue] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

  const clearAll = () => {
    setValue(null);
    setDisplayValue('0');
    setOperator(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
    } else if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const toggleSign = () => {
    setDisplayValue(String(parseFloat(displayValue) * -1));
  };
  
  const inputPercent = () => {
    const currentValue = parseFloat(displayValue);
    if (currentValue === 0) return;
    setDisplayValue(String(currentValue / 100));
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (value == null) {
      setValue(inputValue);
    } else if (operator) {
      const currentValue = value || 0;
      const newValue = calculate(currentValue, inputValue, operator);
      
      setValue(newValue);
      setDisplayValue(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };
  
  const calculate = (firstOperand: number, secondOperand: number, operator: string): number => {
    switch (operator) {
      case '/': return firstOperand / secondOperand;
      case '*': return firstOperand * secondOperand;
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '=': return secondOperand;
      default: return secondOperand;
    }
  };
  
  const buttonClasses = "rounded-2xl h-16 text-xl font-semibold flex items-center justify-center transition-all active:scale-95";
  const numButtonClasses = `${buttonClasses} bg-theme-body text-theme-main hover:bg-black/5 dark:hover:bg-white/5`;
  const opButtonClasses = `${buttonClasses} bg-theme-primary text-white hover:opacity-90`;
  const specialButtonClasses = `${buttonClasses} bg-black/10 text-theme-main hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20`;

  return (
    <div className="bg-theme-surface rounded-[28px] p-4 w-80 shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
      {/* Display */}
      <div className="bg-theme-body rounded-lg text-right p-4 mb-4 overflow-hidden">
        <span className="text-4xl font-bold text-theme-main break-all">{displayValue}</span>
      </div>
      {/* Buttons */}
      <div className="grid grid-cols-4 gap-3">
        <button onClick={clearAll} className={specialButtonClasses}>AC</button>
        <button onClick={toggleSign} className={specialButtonClasses}>+/-</button>
        <button onClick={inputPercent} className={specialButtonClasses}>%</button>
        <button onClick={() => performOperation('/')} className={opButtonClasses}>÷</button>
        
        <button onClick={() => inputDigit('7')} className={numButtonClasses}>7</button>
        <button onClick={() => inputDigit('8')} className={numButtonClasses}>8</button>
        <button onClick={() => inputDigit('9')} className={numButtonClasses}>9</button>
        <button onClick={() => performOperation('*')} className={opButtonClasses}>×</button>
        
        <button onClick={() => inputDigit('4')} className={numButtonClasses}>4</button>
        <button onClick={() => inputDigit('5')} className={numButtonClasses}>5</button>
        <button onClick={() => inputDigit('6')} className={numButtonClasses}>6</button>
        <button onClick={() => performOperation('-')} className={opButtonClasses}>−</button>
        
        <button onClick={() => inputDigit('1')} className={numButtonClasses}>1</button>
        <button onClick={() => inputDigit('2')} className={numButtonClasses}>2</button>
        <button onClick={() => inputDigit('3')} className={numButtonClasses}>3</button>
        <button onClick={() => performOperation('+')} className={opButtonClasses}>+</button>
        
        <button onClick={() => inputDigit('0')} className={`${numButtonClasses} col-span-2`}>0</button>
        <button onClick={inputDot} className={numButtonClasses}>.</button>
        <button onClick={() => performOperation('=')} className={opButtonClasses}>=</button>
      </div>
    </div>
  );
};

export default Calculator;
