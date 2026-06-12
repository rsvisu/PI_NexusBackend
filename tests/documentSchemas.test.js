import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ZodError } from 'zod'
import DocumentSchemas from '../schemas/documentSchemas.js'

describe('DocumentSchemas.validateId', () => {
    it('acepta un entero positivo', () => {
        const resultado = DocumentSchemas.validateId({ id: 5 })
        assert.deepStrictEqual(resultado, { id: 5 })
    })

    it('lanza ZodError para un número negativo', () => {
        assert.throws(() => DocumentSchemas.validateId({ id: -1 }), ZodError)
    })

    it('lanza ZodError para cero', () => {
        assert.throws(() => DocumentSchemas.validateId({ id: 0 }), ZodError)
    })
})

describe('DocumentSchemas.validateDocumentToggleActive', () => {
    it('acepta true y false', () => {
        assert.doesNotThrow(() => DocumentSchemas.validateDocumentToggleActive({ is_active: true }))
        assert.doesNotThrow(() => DocumentSchemas.validateDocumentToggleActive({ is_active: false }))
    })

    it('lanza ZodError para la cadena "true" (no es booleano)', () => {
        assert.throws(() => DocumentSchemas.validateDocumentToggleActive({ is_active: 'true' }), ZodError)
    })
})
