export class TavilySearchAPIError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TavilySearchAPIError'
  }
}
