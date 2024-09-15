import { useApiSend } from '../api'
import { saveWills } from '../utils'

function useSaveWills() {
  return useApiSend(
    saveWills,
    (data) => console.log('Wills saved successfully', data),
    (error) => console.error('Error saving wills', error),
    ['wills'],
  )
}
export { useSaveWills }
