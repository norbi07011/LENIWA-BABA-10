import React, { useEffect, useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { OPENING_HOURS } from '../constants';

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Is the restaurant open right now, in Den Haag time? */
export function isOpenNow(date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const wd = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24;
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
  const hours = OPENING_HOURS[day];
  if (!hours) return false;
  const now = h * 60 + m;
  return now >= toMin(hours.open) && now < toMin(hours.close);
}

export const OpenPill: React.FC = () => {
  const { t } = useAppContext();
  const [open, setOpen] = useState(() => isOpenNow());
  useEffect(() => {
    const id = window.setInterval(() => setOpen(isOpenNow()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className={`open-pill ${open ? 'is-open' : ''}`}>
      <i aria-hidden="true" />
      {open ? t('open_now') : t('closed_now')}
    </span>
  );
};

/** Opening hours: Tue–Fri, Saturday, Sunday, Monday closed. */
export const OpeningHours: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useAppContext();
  const rows: { day: string; lines: [string, string][] }[] = [
    {
      day: t('tuesday_friday'),
      lines: [
        [t('opening_hours_restaurant'), '16:00 – 23:00'],
        [t('opening_hours_kitchen'), t('kitchen_hours_close')],
      ],
    },
    {
      day: t('saturday'),
      lines: [
        [t('opening_hours_kitchen'), '12:00 – 21:00'],
        [t('opening_hours_bar'), t('bar_hours_close_sat')],
      ],
    },
    {
      day: t('sunday'),
      lines: [
        [t('opening_hours_kitchen'), '12:00 – 20:00'],
        [t('opening_hours_bar'), t('bar_hours_close_sun')],
      ],
    },
  ];
  return (
    <div className="hours" style={compact ? { gap: 10 } : undefined}>
      {rows.map((r) => (
        <div className="day" key={r.day} style={compact ? { paddingBottom: 10 } : undefined}>
          <span className="day-name">{r.day}</span>
          {r.lines.map(([l, v]) => (
            <React.Fragment key={l}>
              <span className="row-l">{l.replace(/:$|\s:$/, '')}</span>
              <span className="row-r">{v}</span>
            </React.Fragment>
          ))}
        </div>
      ))}
      <div className="closed">{t('monday_closed')}</div>
    </div>
  );
};
