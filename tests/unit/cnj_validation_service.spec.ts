import { test } from '@japa/runner'
import CnjValidationService from '#services/folders/cnj_validation_service'

test.group('CNJ Validation Service', () => {
  test('should validate a valid CNJ number', async ({ assert }) => {
    const service = new CnjValidationService()
    const validCnj = '5005618-74.2013.4.03.6109'

    const result = await service.validate(validCnj)

    assert.isTrue(result.isValid)
    assert.equal(result.errors.length, 0)
    assert.isNotNull(result.formatted)
    assert.equal(result.metadata.sequentialNumber, '5005618')
    assert.equal(result.metadata.verificationDigit, '74')
    assert.equal(result.metadata.year, '2013')
    assert.equal(result.metadata.judicialSegment, '4')
    assert.equal(result.metadata.tribunal, '03')
    assert.equal(result.metadata.originatingUnit, '6109')
  })

  test('should reject CNJ with invalid length', async ({ assert }) => {
    const service = new CnjValidationService()
    const invalidCnj = '12345'

    const result = await service.validate(invalidCnj)

    assert.isFalse(result.isValid)
    assert.include(result.errors, 'CNJ number must have exactly 20 digits')
    assert.isNull(result.formatted)
  })

  test('should reject CNJ with invalid verification digit', async ({ assert }) => {
    const service = new CnjValidationService()
    const invalidCnj = '5005618-99.2013.4.03.6109'

    const result = await service.validate(invalidCnj)

    assert.isFalse(result.isValid)
    assert.include(result.errors, 'Invalid verification digit')
  })

  test('should reject CNJ with invalid year', async ({ assert }) => {
    const service = new CnjValidationService()
    const invalidCnj = '5005618-74.1990.4.03.6109'

    const result = await service.validate(invalidCnj)

    assert.isFalse(result.isValid)
    assert.include(result.errors, 'Year must be between 1998 and current year + 1')
  })

  test('should reject CNJ with invalid judicial segment', async ({ assert }) => {
    const service = new CnjValidationService()
    const invalidCnj = '5005618-74.2013.0.03.6109'

    const result = await service.validate(invalidCnj)

    assert.isFalse(result.isValid)
    assert.include(result.errors, 'Invalid judicial segment')
  })

  test('should reject CNJ with invalid sequential number', async ({ assert }) => {
    const service = new CnjValidationService()
    const invalidCnj = '0000000-74.2013.4.03.6109'

    const result = await service.validate(invalidCnj)

    assert.isFalse(result.isValid)
    assert.include(result.errors, 'Sequential number must be between 0000001 and 9999999')
  })

  test('should format CNJ number correctly', async ({ assert }) => {
    const service = new CnjValidationService()
    const cleanNumber = '50056187420134036109'

    const formatted = service.formatCnjNumber(cleanNumber)

    assert.equal(formatted, '5005618-74.2013.4.03.6109')
  })

  test('should clean CNJ number removing non-numeric characters', async ({ assert }) => {
    const service = new CnjValidationService()
    const messyCnj = '5005618-74.2013.4.03.6109'

    const result = await service.validate(messyCnj)

    assert.isTrue(result.isValid)
    assert.equal(result.formatted, '5005618-74.2013.4.03.6109')
  })

  test('should generate valid test CNJ number', async ({ assert }) => {
    const service = new CnjValidationService()

    const testCnj = await service.generateTestCnj({
      year: 2024,
      judicialSegment: '8',
      tribunal: '26',
      originatingUnit: '0001',
    })

    assert.isString(testCnj)
    assert.match(testCnj, /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/)

    const validation = await service.validate(testCnj)
    assert.isTrue(validation.isValid)
    assert.equal(validation.metadata.year, '2024')
    assert.equal(validation.metadata.judicialSegment, '8')
    assert.equal(validation.metadata.tribunal, '26')
    assert.equal(validation.metadata.originatingUnit, '0001')
  })

  test('should validate batch of CNJ numbers', async ({ assert }) => {
    const service = new CnjValidationService()
    const cnjNumbers = ['5005618-74.2013.4.03.6109', '1234567-89.2024.8.26.0001', 'invalid-cnj']

    const results = await service.validateBatch(cnjNumbers)

    assert.equal(results.length, 3)
    assert.isTrue(results[0].isValid)
    assert.isFalse(results[1].isValid)
    assert.isFalse(results[2].isValid)
  })

  test('should handle CNJ with letters and special characters', async ({ assert }) => {
    const service = new CnjValidationService()
    const invalidCnj = '5005618-74.2013.4.03.610A'

    const result = await service.validate(invalidCnj)

    assert.isFalse(result.isValid)
    assert.include(result.errors, 'CNJ number must have exactly 20 digits')
  })

  test('should validate all judicial segments', async ({ assert }) => {
    const service = new CnjValidationService()
    const validSegments = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

    for (const segment of validSegments) {
      const testCnj = await service.generateTestCnj({
        year: 2024,
        judicialSegment: segment,
        tribunal: '26',
        originatingUnit: '0001',
      })

      const result = await service.validate(testCnj)
      assert.isTrue(result.isValid, `Segment ${segment} should be valid`)
      assert.equal(result.metadata.judicialSegment, segment)
    }
  })

  test('should reject future years beyond current year + 1', async ({ assert }) => {
    const service = new CnjValidationService()
    const futureYear = new Date().getFullYear() + 2
    const futureCnj = await service.generateTestCnj({
      year: futureYear,
      judicialSegment: '8',
      tribunal: '26',
      originatingUnit: '0001',
    })

    const result = await service.validate(futureCnj)

    assert.isFalse(result.isValid)
    assert.include(result.errors, 'Year must be between 1998 and current year + 1')
  })

  test('should validate tribunal codes within range', async ({ assert }) => {
    const service = new CnjValidationService()

    const validTribunal = await service.generateTestCnj({
      year: 2024,
      judicialSegment: '8',
      tribunal: '01',
      originatingUnit: '0001',
    })

    const result = await service.validate(validTribunal)
    assert.isTrue(result.isValid)
    assert.equal(result.metadata.tribunal, '01')
  })

  test('should handle empty or null CNJ gracefully', async ({ assert }) => {
    const service = new CnjValidationService()

    const emptyResult = await service.validate('')
    assert.isFalse(emptyResult.isValid)
    assert.include(emptyResult.errors, 'CNJ number must have exactly 20 digits')
  })
})
