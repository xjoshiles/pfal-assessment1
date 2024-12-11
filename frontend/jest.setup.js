// Utility function to mock fetch
global.mockFetch = (response) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: response.ok,
      status: response.status,
      json: () => Promise.resolve(response.json),
    })
  )
}
