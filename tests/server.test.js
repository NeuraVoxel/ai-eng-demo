import { afterAll, beforeAll, expect, test } from 'vitest'
import { createServer } from '../server.js'

let server
let baseUrl

// Port 0 has the OS assign a free port, so the suite never contends for the example's default.
beforeAll(async () => {
  server = createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

afterAll(() => new Promise(resolve => server.close(resolve)))

test('a GET returns 200, a plain-text content type, and Hello World', async () => {
  const response = await fetch(baseUrl)

  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toBe('text/plain')
  expect(await response.text()).toBe('Hello World\n')
})

test('an unknown path gets the same response, because there is no routing', async () => {
  const response = await fetch(`${baseUrl}/no/such/path`)

  expect(response.status).toBe(200)
  expect(await response.text()).toBe('Hello World\n')
})
