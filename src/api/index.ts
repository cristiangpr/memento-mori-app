/* eslint-disable no-await-in-loop */
import axios, { AxiosRequestConfig } from 'axios'
import { useMutation, UseMutationOptions, useQuery, useQueryClient } from 'react-query'
import { devUrl, prodUrl } from '../constants'
import { FormTypes } from '../types'

const client = axios.create({
  baseURL: devUrl,
})

export const request = async (options: AxiosRequestConfig<any>) => {
  const token = process.env.REACT_APP_DEV_TOKEN

  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  const onSuccess = (response) => {
    console.log('suc', response)
    return response?.data?.data
  }

  const onError = (error) => {
    return Promise.reject(error.response?.data)
  }

  return client(options).then(onSuccess).catch(onError)
}
export const useApiGet = <TData, TParams>(
  key: string[],
  fn: (params: TParams) => Promise<TData>,
  params: TParams,
  options: { enabled: boolean; refetchOnWindowFocus: boolean; retry: number },
) =>
  useQuery({
    queryKey: [...key, params],
    queryFn: () => fn(params),
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
export const setRequestTime = async (requestTime: string, data: FormTypes): Promise<void> => {
  request({
    url: `/wills/${data.id}`,
    method: 'PUT',
    data: { data: { isActive: true, requestTime } },
  })
}
export const cancelExecution = async (data: FormTypes): Promise<void> => {
  request({
    url: `/wills/${data.id}`,
    method: 'PUT',
    data: { data: { isActive: false, requestTime: '0' } },
  })
}
export const deleteWill = async (data: FormTypes[]): Promise<void> => {
  for (let i = 0; i < data.length; i += 1) {
    request({
      url: `/wills/${data[i].id}`,
      method: 'DELETE',
    })
  }
}
export const getWills = async (params: { address: string }): Promise<any[]> => {
  const res = await request({
    url: `/wills?filters[baseAddress][$eq]=${params.address}&sort=id`,
    method: 'GET',
  })
  return res
}

export const hasWill = async (baseAddress: string, chainSelector: string): Promise<boolean> => {
  const req = await request({
    url: `/wills?filters[baseAddress][$eq]=${baseAddress}&filters[chainSelector][$eq]=${chainSelector}`,
    method: 'GET',
  })
  if (req.data.length === 0) {
    return false
  }
  return true
}

export const saveWills = async (data: FormTypes[]): Promise<void> => {
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].id) {
      console.log('update', data)
      await request({
        url: `/wills/${data[i].id}`,
        method: 'PUT',
        data: { data: data[i] },
      })
    } else {
      await request({
        url: `/wills`,
        method: 'POST',
        data: { data: data[i] },
      })
    }
  }
}
