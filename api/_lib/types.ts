import type { IncomingMessage, ServerResponse } from 'node:http'

// Minimal shape of what Vercel's Node runtime passes to a serverless function.
// Avoids depending on the (heavy, transitively vulnerable) @vercel/node package
// just for types.

export interface ApiRequest extends IncomingMessage {
  body?: unknown
  query?: Record<string, string | string[]>
}

export interface ApiResponse extends ServerResponse {
  status(code: number): ApiResponse
  json(body: unknown): ApiResponse
  send(body: unknown): ApiResponse
}
