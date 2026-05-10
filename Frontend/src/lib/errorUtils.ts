 export const getApiErrorMessage = (error: unknown) => {
  if (!error) {
    return 'Something went wrong.'
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const apiError = error as { status?: number; data?: any }

    if (typeof apiError.data === 'string' && apiError.data.trim()) {
      return apiError.data
    }

    if (apiError.data && typeof apiError.data === 'object') {
      if (typeof apiError.data.message === 'string' && apiError.data.message.trim()) {
        return apiError.data.message
      }

      if (typeof apiError.data.error === 'string' && apiError.data.error.trim()) {
        return apiError.data.error
      }
    }

    if (apiError.status) {
      return `Request failed with status ${apiError.status}.`
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Something went wrong.'
}