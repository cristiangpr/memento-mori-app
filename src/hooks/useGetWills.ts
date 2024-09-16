import { useApiGet, getWills } from '../api'

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
