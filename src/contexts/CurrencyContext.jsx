import { createContext, useContext, useState } from 'react'
import { getStoredCurrency, setStoredCurrency } from '../services/currency'

const CurrencyContext = createContext({ currency: 'USD', setCurrency: () => {} })

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(getStoredCurrency)

  function setCurrency(code) {
    setStoredCurrency(code)
    setCurrencyState(code)
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
