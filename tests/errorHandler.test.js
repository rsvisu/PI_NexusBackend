import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import AppError from '../errors/AppError.js'
import errorHandler from '../middlewares/errorHandler.js'

// Simula res de Express: status() devuelve this para poder encadenar .json()
function makeRes() {
    return {
        _status: null,
        _body: null,
        status(code) { this._status = code; return this },
        json(body)   { this._body  = body; return this },
    }
}

describe('errorHandler', () => {
    it('devuelve el statusCode y mensaje de un AppError', () => {
        const res = makeRes()
        errorHandler(new AppError('No encontrado', 404), {}, res, () => {})
        assert.strictEqual(res._status, 404)
        assert.deepStrictEqual(res._body, { error: 'No encontrado' })
    })

    it('devuelve 500 para errores inesperados', () => {
        const res = makeRes()
        errorHandler(new Error('Fallo interno'), {}, res, () => {})
        assert.strictEqual(res._status, 500)
        assert.ok(res._body.error.includes('problemas de conexión'))
    })
})
