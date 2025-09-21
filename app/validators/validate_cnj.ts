import vine from '@vinejs/vine'

export const validateCnjValidator = vine.compile(
  vine.object({
    cnj_number: vine
      .string()
      .trim()
      .minLength(15)
      .maxLength(25)
      .regex(/^[0-9\-\.]+$/),
  })
)
