import { TokenBalance } from '@gnosis.pm/safe-apps-sdk'
import { useState, useEffect } from 'react'

function useSafeBalances(sdk): [TokenBalance[], boolean] {
  const [assets, setAssets] = useState<TokenBalance[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function loadBalances() {
      const balances = await sdk.safe.experimental_getBalances()
      console.log(balances)

      setAssets(balances.items)
      setLoaded(true)
    }

    loadBalances()
  }, [sdk])

  return [assets, loaded]
}

export { useSafeBalances }
