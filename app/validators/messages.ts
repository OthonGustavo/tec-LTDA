/**
 * Mensagens de validação em português, compartilhadas pelos validadores do CRM.
 *
 * O VineJS congela o provider de mensagens no momento em que o validador é
 * compilado, por isso cada módulo de validador aplica este provider logo após
 * o próprio `vine.compile()` — não adianta defini-lo num preload.
 */

import { SimpleMessagesProvider } from '@vinejs/vine'

/** Como cada campo é chamado nas mensagens, no lugar do nome técnico. */
const fields: Record<string, string> = {
  name: 'nome',
  email: 'e-mail',
  phone: 'telefone',
  company: 'empresa',
  status: 'status',
  title: 'título',
  estimatedValue: 'valor estimado',
  stage: 'etapa',
  note: 'anotação',
}

const messages: Record<string, string> = {
  'required': 'Informe o campo {{ field }}.',
  'string': 'O campo {{ field }} deve ser um texto.',
  'number': 'O campo {{ field }} deve ser um número.',
  'email': 'Informe um e-mail válido.',
  'enum': 'Selecione um valor válido para {{ field }}.',
  'minLength': 'O campo {{ field }} deve ter ao menos {{ min }} caracteres.',
  'maxLength': 'O campo {{ field }} deve ter no máximo {{ max }} caracteres.',
  'min': 'O campo {{ field }} não pode ser menor que {{ min }}.',
  'max': 'O campo {{ field }} não pode ser maior que {{ max }}.',
}

export const crmMessagesProvider = new SimpleMessagesProvider(messages, fields)
