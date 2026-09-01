import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRewardedAd } from 'react-native-google-mobile-ads';

import { useToast } from '@/components/toast/ToastContainer';
import type { AdRewardGrantedPayload, AdRewardRejectedPayload } from '@/lib/colyseus/types';
import { t } from '@/i18n';
import { useUserStore } from '@/store/userStore';

import { getRewardedAdUnitId } from './rewardedAdUnit';

export type UseMapRewardedAdOptions = {
  colyseusConnected: boolean;
  sendClaimAdReward: (payload: { clientRewardToken: string; rewardUnitId?: string }) => void;
  lastAdRewardGranted: AdRewardGrantedPayload | null;
  lastAdRewardRejected: AdRewardRejectedPayload | null;
  ackAdRewardFeedback: () => void;
};

function randomClientRewardToken(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function adRewardRejectMessage(reason: string): string {
  const key = `map.adRewardReject.${reason}`;
  const translated = t(key);
  if (translated !== key) return translated;
  return t('map.adRewardReject.unknown');
}

/**
 * Rewarded no mapa: pré-carrega com o foco da tela; no `EARNED_REWARD` envia
 * `claimAdReward` na sala Colyseus com token idempotente (ver AD_REWARD_MOBILE.md).
 */
export function useMapRewardedAd(opts: UseMapRewardedAdOptions) {
  const unitId = getRewardedAdUnitId();
  const rewarded = useRewardedAd(unitId);
  const toast = useToast();

  const [claimInFlight, setClaimInFlight] = useState(false);
  const claimInFlightRef = useRef(false);

  const showEpochRef = useRef(0);
  const lastEarnedEpochRef = useRef(-1);
  const wasAdOpenedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!unitId) return;
      rewarded.load();
    }, [unitId, rewarded.load]),
  );

  useEffect(() => {
    if (!unitId) return;
    if (!rewarded.isOpened) {
      wasAdOpenedRef.current = false;
      return;
    }
    if (!wasAdOpenedRef.current) {
      showEpochRef.current += 1;
      wasAdOpenedRef.current = true;
    }
  }, [unitId, rewarded.isOpened]);

  useEffect(() => {
    if (!unitId) return;
    if (!rewarded.isClosed) return;
    rewarded.load();
  }, [unitId, rewarded.isClosed, rewarded.load]);

  useEffect(() => {
    if (!unitId) return;
    if (!rewarded.isEarnedReward) return;

    const epoch = showEpochRef.current;
    if (epoch < 1 || lastEarnedEpochRef.current === epoch) return;
    lastEarnedEpochRef.current = epoch;

    if (!opts.colyseusConnected) {
      toast.showError(t('map.rewardedAdNotConnected'), {
        title: t('map.rewardedAdRewardTitle'),
      });
      return;
    }

    claimInFlightRef.current = true;
    setClaimInFlight(true);
    const token = randomClientRewardToken();
    opts.sendClaimAdReward({
      clientRewardToken: token,
      rewardUnitId: unitId ?? undefined,
    });
  }, [unitId, rewarded.isEarnedReward, opts.colyseusConnected, opts.sendClaimAdReward, toast]);

  useEffect(() => {
    const g = opts.lastAdRewardGranted;
    if (!g || !claimInFlightRef.current) return;

    claimInFlightRef.current = false;
    setClaimInFlight(false);

    const balance = Number(g.balance);
    const amount = Number(g.amount);
    if (Number.isFinite(balance)) {
      useUserStore.getState().setCoinBalance(balance);
    }
    const showBalance = Number.isFinite(balance) ? balance : useUserStore.getState().coinBalance;
    const showAmount = Number.isFinite(amount) ? amount : 0;
    toast.showSuccess(t('map.rewardedAdRewardMessage', { value: showAmount, balance: showBalance }), {
      title: t('map.rewardedAdRewardTitle'),
    });
    opts.ackAdRewardFeedback();
  }, [opts.lastAdRewardGranted, opts.ackAdRewardFeedback, toast]);

  useEffect(() => {
    const r = opts.lastAdRewardRejected;
    if (!r || !claimInFlightRef.current) return;

    claimInFlightRef.current = false;
    setClaimInFlight(false);

    toast.showError(adRewardRejectMessage(String(r.reason ?? 'server_error')), {
      title: t('map.rewardedAdRewardTitle'),
    });
    opts.ackAdRewardFeedback();
  }, [opts.lastAdRewardRejected, opts.ackAdRewardFeedback, toast]);

  const onPressWatchAd = useCallback(() => {
    if (!unitId || !rewarded.isLoaded || rewarded.isShowing) return;
    rewarded.show();
  }, [unitId, rewarded.isLoaded, rewarded.isShowing, rewarded.show]);

  return {
    showCta: unitId != null,
    ctaDisabled:
      !rewarded.isLoaded || rewarded.isShowing || !opts.colyseusConnected || claimInFlight,
    ctaLoading: !rewarded.isLoaded && !rewarded.error,
    onPressWatchAd,
  };
}
