'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Moon, Sun, Sunrise, Sunset } from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string; // "HH:mm"
  icon: React.ComponentType<{ className?: string }>;
}

const PRAYER_SCHEDULE: PrayerTime[] = [
  { name: 'Subuh', time: '04:52', icon: Sunrise },
  { name: 'Dzuhur', time: '12:11', icon: Sun },
  { name: 'Ashar', time: '15:26', icon: Sun },
  { name: 'Maghrib', time: '18:12', icon: Sunset },
  { name: 'Isya', time: '19:21', icon: Moon },
];

export default function PrayerWidget() {
  const [activePrayer, setActivePrayer] = useState<string>('Ashar');
  const [countdownText, setCountdownText] = useState<string>('');

  useEffect(() => {
    const updatePrayerState = () => {
      const now = new Date();
      // Calculate current minutes in the day
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let nextPrayer = PRAYER_SCHEDULE[0];
      let diffMinutes = 0;

      for (const prayer of PRAYER_SCHEDULE) {
        const [h, m] = prayer.time.split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        if (currentMinutes < prayerMinutes) {
          nextPrayer = prayer;
          diffMinutes = prayerMinutes - currentMinutes;
          break;
        }
      }

      // If past Isya, next prayer is Subuh tomorrow
      if (diffMinutes === 0 && currentMinutes >= 19 * 60 + 21) {
        nextPrayer = PRAYER_SCHEDULE[0];
        const [subuhH, subuhM] = PRAYER_SCHEDULE[0].time.split(':').map(Number);
        diffMinutes = 24 * 60 - currentMinutes + (subuhH * 60 + subuhM);
      }

      setActivePrayer(nextPrayer.name);

      const hoursLeft = Math.floor(diffMinutes / 60);
      const minsLeft = diffMinutes % 60;
      if (hoursLeft > 0) {
        setCountdownText(`${hoursLeft}j ${minsLeft}m lagi`);
      } else {
        setCountdownText(`${minsLeft}m lagi`);
      }
    };

    updatePrayerState();
    const interval = setInterval(updatePrayerState, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden xl:flex items-center gap-1.5 bg-slate-50/80 p-1 rounded-2xl border border-slate-200/80 text-xs shadow-2xs">
      <div className="flex items-center gap-1 px-2 py-1 text-slate-500 font-medium text-[11px]">
        <Clock className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-semibold text-slate-700">WITA</span>
      </div>

      <div className="flex items-center gap-1">
        {PRAYER_SCHEDULE.map((p) => {
          const isNext = p.name === activePrayer;
          const Icon = p.icon;
          return (
            <div
              key={p.name}
              title={`Waktu Sholat ${p.name}: ${p.time} WITA (Makassar)`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
                isNext
                  ? 'bg-emerald-600 text-white font-bold shadow-soft-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
              }`}
            >
              <Icon className={`w-3 h-3 ${isNext ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-[11px]">{p.name}</span>
              <span
                className={`font-mono text-[11px] ${
                  isNext ? 'text-emerald-100' : 'text-slate-500'
                }`}
              >
                {p.time}
              </span>
              {isNext && (
                <span className="ml-1 text-[9px] bg-emerald-700/80 text-emerald-100 px-1.5 py-0.2 rounded-full hidden 2xl:inline">
                  {countdownText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
