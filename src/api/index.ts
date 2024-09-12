import axios, { AxiosRequestConfig } from 'axios'
import { useMutation, UseMutationOptions, useQuery, useQueryClient } from 'react-query'
import { devUrl, prodUrl } from '../constants'

const client = axios.create({
  baseURL: devUrl,
})

export const request = async (options: AxiosRequestConfig<any>) => {
  const token = process.env.REACT_APP_DEV_TOKEN

  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  const onSuccess = (response) => {
    return response?.data?.data
  }

  const onError = (error) => {
    return Promise.reject(error.response?.data)
  }

  return client(options).then(onSuccess).catch(onError)
}
export const useApiGet = (
  key: string[],
  fn: (params: any) => Promise<any>,
  options: { enabled: boolean; refetchOnWindowFocus: boolean; retry: number },
) =>
  useQuery({
    queryKey: key,
    queryFn: fn,
    ...options,
  })

export const useApiSend = (
  fn: (variables: any) => Promise<any>,
  success?: (data: any) => void,
  error?: (error: Error) => void,
  invalidateKey?: string[],
  options?: UseMutationOptions<any, Error, any>,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      if (invalidateKey) {
        invalidateKey.forEach((key) => {
          queryClient.invalidateQueries(key)
        })
        if (success) {
          success(data)
        }
      }
    },
    onError: error,
    retry: 2,
    ...options,
  })
}
