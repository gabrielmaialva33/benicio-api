import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import DocumentValidatorService from '#services/utils/document_validator_service'

/**
 * Custom validation rule for Brazilian documents (CPF/CNPJ)
 */
const documentRule = vine.createRule((value: unknown, _, ctx: FieldContext) => {
  if (typeof value !== 'string') {
    return
  }

  const documentValidator = new DocumentValidatorService()

  if (!documentValidator.validate(value)) {
    ctx.report('The {{ field }} must be a valid CPF or CNPJ', 'document', ctx)
  }
})

export const document = () => documentRule()

/**
 * Custom validation rule for CPF
 */
const cpfRule = vine.createRule((value: unknown, _, ctx: FieldContext) => {
  if (typeof value !== 'string') {
    return
  }

  const documentValidator = new DocumentValidatorService()

  if (!documentValidator.validateCpf(value)) {
    ctx.report('The {{ field }} must be a valid CPF', 'cpf', ctx)
  }
})

export const cpf = () => cpfRule()

/**
 * Custom validation rule for CNPJ
 */
const cnpjRule = vine.createRule((value: unknown, _, ctx: FieldContext) => {
  if (typeof value !== 'string') {
    return
  }

  const documentValidator = new DocumentValidatorService()

  if (!documentValidator.validateCnpj(value)) {
    ctx.report('The {{ field }} must be a valid CNPJ', 'cnpj', ctx)
  }
})

export const cnpj = () => cnpjRule()
