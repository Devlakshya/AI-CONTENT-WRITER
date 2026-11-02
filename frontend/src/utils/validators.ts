export const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value)

export const isRequired = (value: string) => value.trim().length > 0
