'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { useEffect, useState } from 'react';
import { SubscriptionPlan, SubscriptionStatus } from '@/types/subscription';

/**
 * Limites do plano Free
 */
export const FREE_PLAN_LIMITS = {
  /** Número máximo de matérias permitidas */
  MAX_SUBJECTS: 5,
  /** Número máximo de conteúdos por matéria */
  MAX_CONTENTS_PER_SUBJECT: 10,
  /** Número máximo de eventos por matéria */
  MAX_EVENTS_PER_SUBJECT: 2,
  /** Número máximo de eventos gerais (sem matéria) */
  MAX_GENERAL_EVENTS: 2,
};

/**
 * Hook para gerenciar os limites do plano do usuário
 */
export function usePlanLimits() {
  // Garantir que isPremium sempre tenha um valor boolean, defaultando para false
  const { subscription, isPremium = false, isLoading = false } = useSubscription();
  
  // Verificação robusta do status premium
  const isReallyPremium = Boolean(
    !isLoading && 
    subscription && 
    subscription.plan === SubscriptionPlan.PREMIUM && 
    (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIALING)
  );
  
  /**
   * Verifica se o usuário atingiu o limite de matérias
   * @param subjectsCount número atual de matérias do usuário
   * @returns true se o usuário atingiu o limite de matérias
   */
  const hasReachedSubjectsLimit = (subjectsCount: number = 0): boolean => {
    if (isReallyPremium) return false;
    return subjectsCount >= FREE_PLAN_LIMITS.MAX_SUBJECTS;
  };
  
  /**
   * Verifica se o usuário atingiu o limite de conteúdos para uma matéria
   * @param contentCount número de conteúdos na matéria
   * @returns true se o usuário atingiu o limite de conteúdos para a matéria
   */
  const hasReachedContentsLimit = (contentCount: number): boolean => {
    if (isReallyPremium) return false;
    return contentCount >= FREE_PLAN_LIMITS.MAX_CONTENTS_PER_SUBJECT;
  };

  /**
   * Verifica se o usuário atingiu o limite de eventos para uma matéria específica
   * @param eventsCount número de eventos na matéria
   * @returns true se o usuário atingiu o limite de eventos para a matéria
   */
  const hasReachedSubjectEventsLimit = (eventsCount: number): boolean => {
    if (isReallyPremium) return false;
    return eventsCount >= FREE_PLAN_LIMITS.MAX_EVENTS_PER_SUBJECT;
  };

  /**
   * Verifica se o usuário atingiu o limite de eventos gerais (sem matéria)
   * @param generalEventsCount número de eventos sem matéria
   * @returns true se o usuário atingiu o limite de eventos gerais
   */
  const hasReachedGeneralEventsLimit = (generalEventsCount: number): boolean => {
    if (isReallyPremium) return false;
    return generalEventsCount >= FREE_PLAN_LIMITS.MAX_GENERAL_EVENTS;
  };

  /**
   * Retorna o número restante de matérias que o usuário pode criar
   * @param subjectsCount número atual de matérias do usuário
   * @returns número de matérias restantes ou Infinity se premium
   */
  const remainingSubjects = (subjectsCount: number = 0): number => {
    if (isReallyPremium) return Infinity;
    return Math.max(0, FREE_PLAN_LIMITS.MAX_SUBJECTS - subjectsCount);
  };

  /**
   * Retorna o número restante de conteúdos que o usuário pode criar em uma matéria
   * @param contentCount número atual de conteúdos na matéria
   * @returns número de conteúdos restantes ou Infinity se premium
   */
  const remainingContents = (contentCount: number): number => {
    if (isReallyPremium) return Infinity;
    return Math.max(0, FREE_PLAN_LIMITS.MAX_CONTENTS_PER_SUBJECT - contentCount);
  };

  /**
   * Retorna o número restante de eventos que o usuário pode criar para uma matéria
   * @param eventsCount número atual de eventos na matéria
   * @returns número de eventos restantes ou Infinity se premium
   */
  const remainingSubjectEvents = (eventsCount: number): number => {
    if (isReallyPremium) return Infinity;
    return Math.max(0, FREE_PLAN_LIMITS.MAX_EVENTS_PER_SUBJECT - eventsCount);
  };

  /**
   * Retorna o número restante de eventos gerais (sem matéria) que o usuário pode criar
   * @param generalEventsCount número atual de eventos sem matéria
   * @returns número de eventos gerais restantes ou Infinity se premium
   */
  const remainingGeneralEvents = (generalEventsCount: number): number => {
    if (isReallyPremium) return Infinity;
    return Math.max(0, FREE_PLAN_LIMITS.MAX_GENERAL_EVENTS - generalEventsCount);
  };

  return {
    isPremium: isReallyPremium,
    planLimits: FREE_PLAN_LIMITS,
    hasReachedSubjectsLimit,
    hasReachedContentsLimit,
    hasReachedSubjectEventsLimit,
    hasReachedGeneralEventsLimit,
    remainingSubjects,
    remainingContents,
    remainingSubjectEvents,
    remainingGeneralEvents,
  };
}
