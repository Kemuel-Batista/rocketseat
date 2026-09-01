import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ChangeRoomDebug } from '@/lib/colyseus/useCellRoom';
import { colors } from '@/theme';

type OtherUserInfo = { username: string; id: string };

type MapColyseusDebugProps = {
  connected: boolean;
  error: string | null;
  roomName: string | null;
  /** Usuários na sala (para debug: ver quem está na mesma célula). */
  otherUsersInRoom: OtherUserInfo[];
  /** Última mensagem changeRoom recebida — foco do debug de sala. */
  lastChangeRoom: ChangeRoomDebug | null;
};

function formatAgo(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}min`;
}

export function MapColyseusDebug({
  connected,
  error,
  roomName,
  otherUsersInRoom,
  lastChangeRoom,
}: MapColyseusDebugProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.row}>
        <Text style={styles.label}>Sala</Text>
        <View style={styles.badges}>
          <Text style={[styles.badge, connected ? styles.badgeOk : styles.badgeOff]}>
            {connected ? 'conectado' : 'off'}
          </Text>
          <Text style={styles.badgeMuted}>{otherUsersInRoom.length} outros</Text>
        </View>
      </View>
      <Text style={styles.room} numberOfLines={1}>
        {roomName ?? '—'}
      </Text>
      {error ? (
        <Text style={styles.error} numberOfLines={2}>
          {error}
        </Text>
      ) : null}

      <View style={styles.usersSection}>
        <Text style={styles.usersLabel}>Usuários na sala</Text>
        {otherUsersInRoom.length === 0 ? (
          <Text style={styles.usersEmpty}>nenhum outro</Text>
        ) : (
          otherUsersInRoom.map((u) => (
            <Text key={u.id} style={styles.userLine} numberOfLines={1}>
              {u.username || '(sem nome)'} (id: {u.id})
            </Text>
          ))
        )}
      </View>

      <View style={styles.changeRoomSection}>
        <Text style={styles.changeRoomLabel}>changeRoom (servidor → cliente)</Text>
        {lastChangeRoom ? (
          <View style={styles.changeRoomBox}>
            <Text style={styles.changeRoomValue} numberOfLines={1}>
              {lastChangeRoom.newRoom}
            </Text>
            <Text style={styles.changeRoomAgo}>há {formatAgo(lastChangeRoom.at)}</Text>
          </View>
        ) : (
          <Text style={styles.changeRoomNone}>nenhum recebido nesta sessão</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 120,
    backgroundColor: 'rgba(2, 6, 23, 0.92)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    fontSize: 9,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeOk: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    color: '#4ade80',
  },
  badgeOff: {
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    color: colors.textMuted,
  },
  badgeMuted: {
    fontSize: 9,
    color: colors.textMuted,
  },
  room: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 8,
  },
  error: {
    fontSize: 10,
    color: colors.destructive,
    marginBottom: 8,
  },
  usersSection: {
    marginBottom: 6,
  },
  usersLabel: {
    fontSize: 9,
    color: colors.primaryLight,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  usersEmpty: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  userLine: {
    fontSize: 10,
    color: colors.text,
    marginLeft: 4,
    marginTop: 1,
  },
  changeRoomSection: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 182, 212, 0.2)',
  },
  changeRoomLabel: {
    fontSize: 9,
    color: colors.primaryLight,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  changeRoomBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  changeRoomValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#4ade80',
  },
  changeRoomAgo: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  changeRoomNone: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
