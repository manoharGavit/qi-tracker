import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api/apiError'
import { configureHttpClient, http } from '@/shared/api/httpClient'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('httpClient', () => {
  const fetchMock = vi.fn<typeof fetch>()
  const onUnauthorized = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    configureHttpClient({ getToken: () => 'token-123', onUnauthorized })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
    onUnauthorized.mockReset()
  })

  it('unwraps data, attaches the bearer token and drops empty query params', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: [1] }))

    const data = await http.get<number[]>('/api/inspections', {
      query: { severity: 'Critical,Major', status: '', from: undefined },
    })

    expect(data).toEqual([1])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/inspections?severity=Critical%2CMajor')
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-123')
  })

  it('throws a typed ApiError carrying code and details', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(422, {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid body',
          details: [{ path: ['machineId'], message: 'Required' }],
        },
      }),
    )

    const error = await http.post('/api/inspections', {}).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 422,
      code: 'VALIDATION_FAILED',
      message: 'Invalid body',
      details: [{ path: ['machineId'], message: 'Required' }],
    })
  })

  it('signals an expired session on 401 for authed requests only', async () => {
    const unauthorized = {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' },
    }
    fetchMock.mockImplementation(async () => jsonResponse(401, unauthorized))

    await expect(
      http.post('/api/auth/login', {}, { auth: false }),
    ).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' })
    expect(onUnauthorized).not.toHaveBeenCalled()
    expect(
      new Headers(fetchMock.mock.calls[0][1]?.headers).has('Authorization'),
    ).toBe(false)

    await expect(http.get('/api/auth/me')).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('maps network failures to NETWORK_ERROR', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(http.get('/api/inspections')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    })
  })
})
