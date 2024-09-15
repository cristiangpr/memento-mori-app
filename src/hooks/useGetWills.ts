import { useApiGet } from '../api'
import { getWills } from '../utils'

function useGetWills(address: string) {
  return useApiGet(
    ['wills'],
    getWills,
    { address },
    {
      enabled: !!address,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  )
}
export { useGetWills }
