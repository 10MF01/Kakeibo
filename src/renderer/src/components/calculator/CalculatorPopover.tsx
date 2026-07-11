import { useEffect, useState } from 'react'
import { Button } from 'antd'

type Operator = '+' | '-' | '×' | '÷'

interface CalculatorPopoverProps {
  open: boolean
}

function calculate(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b === 0 ? NaN : a / b
  }
}

function formatResult(value: number): string {
  if (Number.isNaN(value)) return 'Error'
  return String(Math.round(value * 1e8) / 1e8)
}

const KEY_OPERATORS: Record<string, Operator> = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷'
}

function CalculatorPopover({ open }: CalculatorPopoverProps): React.JSX.Element {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [justEvaluated, setJustEvaluated] = useState(false)
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [pendingOperator, setPendingOperator] = useState<Operator | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = (digit: string): void => {
    if (justEvaluated) {
      setExpression('')
      setJustEvaluated(false)
    }
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  const inputDecimal = (): void => {
    if (justEvaluated) {
      setExpression('')
      setJustEvaluated(false)
    }
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const clear = (): void => {
    setDisplay('0')
    setExpression('')
    setJustEvaluated(false)
    setPreviousValue(null)
    setPendingOperator(null)
    setWaitingForOperand(false)
  }

  const backspace = (): void => {
    if (waitingForOperand) return
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0')
  }

  const applyOperator = (op: Operator): void => {
    const inputValue = parseFloat(display)
    setJustEvaluated(false)
    if (previousValue === null) {
      setPreviousValue(inputValue)
      setExpression(`${display} ${op} `)
    } else if (pendingOperator && !waitingForOperand) {
      const result = calculate(previousValue, inputValue, pendingOperator)
      setDisplay(formatResult(result))
      setPreviousValue(result)
      setExpression((prev) => `${prev}${display} ${op} `)
    } else {
      setExpression((prev) => prev.replace(/[+\-×÷] $/, `${op} `))
    }
    setPendingOperator(op)
    setWaitingForOperand(true)
  }

  const handleEquals = (): void => {
    const inputValue = parseFloat(display)
    if (pendingOperator && previousValue !== null) {
      const result = calculate(previousValue, inputValue, pendingOperator)
      setExpression(`${expression}${display} =`)
      setDisplay(formatResult(result))
      setPreviousValue(null)
      setPendingOperator(null)
      setWaitingForOperand(true)
      setJustEvaluated(true)
    }
  }

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      const activeTag = document.activeElement?.tagName
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        inputDigit(e.key)
      } else if (e.key === '.') {
        e.preventDefault()
        inputDecimal()
      } else if (e.key in KEY_OPERATORS) {
        e.preventDefault()
        applyOperator(KEY_OPERATORS[e.key])
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        handleEquals()
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        backspace()
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        clear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // Re-bind every render so the closures above see current display/operator state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, display, expression, justEvaluated, previousValue, pendingOperator, waitingForOperand])

  const buttons: { label: string; onClick: () => void; primary?: boolean; span?: number }[] = [
    { label: 'C', onClick: clear },
    { label: '⌫', onClick: backspace },
    { label: '÷', onClick: () => applyOperator('÷') },
    { label: '×', onClick: () => applyOperator('×') },
    { label: '7', onClick: () => inputDigit('7') },
    { label: '8', onClick: () => inputDigit('8') },
    { label: '9', onClick: () => inputDigit('9') },
    { label: '-', onClick: () => applyOperator('-') },
    { label: '4', onClick: () => inputDigit('4') },
    { label: '5', onClick: () => inputDigit('5') },
    { label: '6', onClick: () => inputDigit('6') },
    { label: '+', onClick: () => applyOperator('+') },
    { label: '1', onClick: () => inputDigit('1') },
    { label: '2', onClick: () => inputDigit('2') },
    { label: '3', onClick: () => inputDigit('3') },
    { label: '=', onClick: handleEquals, primary: true },
    { label: '0', onClick: () => inputDigit('0'), span: 2 },
    { label: '.', onClick: inputDecimal }
  ]

  return (
    <div style={{ width: 220 }}>
      <div
        style={{
          textAlign: 'right',
          padding: '10px 10px 6px',
          marginBottom: 8,
          background: '#f5f5f5',
          borderRadius: 6,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: 'rgba(0, 0, 0, 0.45)',
            fontVariantNumeric: 'tabular-nums',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minHeight: 18
          }}
        >
          {expression || ' '}
        </div>
        <div
          style={{
            fontSize: 24,
            fontVariantNumeric: 'tabular-nums',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {display}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {buttons.map((btn) => (
          <Button
            key={btn.label}
            type={btn.primary ? 'primary' : 'default'}
            onClick={btn.onClick}
            style={btn.span ? { gridColumn: `span ${btn.span}` } : undefined}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default CalculatorPopover
