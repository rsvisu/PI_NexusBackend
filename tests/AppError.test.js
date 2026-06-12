import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import AppError from '../errors/AppError.js'

describe('AppError', () => {
    it('es instancia de Error', () => {
        const err = new AppError('Algo salió mal', 400)
        assert.ok(err instanceof Error)
    })

    it('es instancia de AppError', () => {
        const err = new AppError('Algo salió mal', 400)
        assert.ok(err instanceof AppError)
    })

    it('guarda el mensaje y el statusCode correctamente', () => {
        const err = new AppError('No encontrado', 404)
        assert.strictEqual(err.message, 'No encontrado')
        assert.strictEqual(err.statusCode, 404)
    })
})
