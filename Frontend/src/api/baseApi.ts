import { AxiosRequestConfig, AxiosError } from "axios";
import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import axiosClient from "./axiosClient";

type AxiosBaseQueryArgs = {
        url: string;
        method?: AxiosRequestConfig['method'];
        data?: AxiosRequestConfig['data'];
        params?: AxiosRequestConfig['params'];
        headers?: AxiosRequestConfig['headers'];
}

type AxiosBaseQueryError = {
    status?: number
    data: unknown
}

const axiosBaseQuery = (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError
> => async (args, api) => {
    try {
        const result = await axiosClient({
            ...args,
            signal: api.signal,
        })
        return {data: result.data}
    } catch (error) {
        const axiosError = error as AxiosError
        return {
            error: {
                status: axiosError.response?.status,
                data: axiosError.response?.data ?? axiosError.message,
            },
        }
    }
}

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Post'],
    endpoints: () => ({}),
})