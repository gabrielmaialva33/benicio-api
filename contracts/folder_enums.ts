/**
 * Folder System Enums and Constants
 * Centralized definitions for the folder management system
 */

export enum FolderStatus {
  PRE_REGISTRATION = 'pre_registration',
  AWAITING_INFO = 'awaiting_info',
  REGISTERED = 'registered',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  ARCHIVED = 'archived',
  CLOSED = 'closed',
}

export enum FolderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Numeric values for priority comparison/sorting
 */
export const FolderPriorityValues = {
  [FolderPriority.LOW]: 1,
  [FolderPriority.NORMAL]: 2,
  [FolderPriority.HIGH]: 3,
  [FolderPriority.URGENT]: 4,
}

export enum PartyType {
  AUTHOR = 'author',
  DEFENDANT = 'defendant',
  THIRD_PARTY = 'third_party',
  INTERESTED = 'interested',
  WITNESS = 'witness',
  LAWYER = 'lawyer',
}

export enum MovementType {
  PETITION = 'petition',
  DISPATCH = 'dispatch',
  DECISION = 'decision',
  SENTENCE = 'sentence',
  HEARING = 'hearing',
  PUBLICATION = 'publication',
  OTHER = 'other',
}

export enum DocumentType {
  PETITION = 'petition',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  CONTRACT = 'contract',
  EVIDENCE = 'evidence',
  EXPERT_REPORT = 'expert_report',
  OTHER = 'other',
}

export enum DocumentConfidentiality {
  PUBLIC = 'public',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential',
}
