import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'

type Schemas = { body?: ZodType; params?: ZodType; query?: ZodType }

/**
 * Valida body, params e query com Zod. Os valores parseados (com coerções e defaults)
 * substituem os originais; erros seguem para o errorHandling como ZodError (400).
 */
export function validate(schemas: Schemas): RequestHandler {
  return (request, _response, next) => {
    if (schemas.params) request.params = schemas.params.parse(request.params) as typeof request.params
    if (schemas.query) {
      // No Express 5 `req.query` é um getter; redefinimos a propriedade com o valor parseado.
      Object.defineProperty(request, 'query', {
        value: schemas.query.parse(request.query),
        writable: true,
        configurable: true,
      })
    }
    if (schemas.body) request.body = schemas.body.parse(request.body ?? {})
    next()
  }
}
