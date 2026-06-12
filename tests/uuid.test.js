import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { uuidValidateV4 } from '../utils/uuid.js'

describe('uuidValidateV4', () => {
    it('devuelve true para un UUID v4 válido', () => {
        assert.strictEqual(uuidValidateV4('f47ac10b-58cc-4372-a567-0e02b2c3d479'), true)
    })

    it('devuelve false para un UUID v1', () => {
        // UUID v1: la tercera sección empieza por 1, no por 4
        assert.strictEqual(uuidValidateV4('550e8400-e29b-11d4-a716-446655440000'), false)
    })

    it('devuelve false para una cadena arbitraria', () => {
        assert.strictEqual(uuidValidateV4('no-soy-un-uuid'), false)
    })

    it('devuelve false para cadena vacía', () => {
        assert.strictEqual(uuidValidateV4(''), false)
    })
})
