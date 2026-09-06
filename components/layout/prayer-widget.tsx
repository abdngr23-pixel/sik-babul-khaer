'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Moon, Sun, Sunrise, Sunset, ChevronDown } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePrayerState = () => {
      const now = new Date();
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

      // Past Isya, next prayer is Subuh tomorrow
      if (diffMinutes === 0 && currentMinutes >= 19 * 60 + 21) {
        nextPrayer = PRAYER_SCHEDULE[0];
        const [subuhH, subuhM] = PRAYER_SCHEDULE[0].time.split(':').map(Number);
        diffMinutes = 24 * 60 - currentMinutes + (subuhH * 60 + subuhM);
      }

      setActivePrayer(nextPrayer.name);

      const hoursLeft = Math.floor(diffMinutes / 60);
      const minsLeft = diffMinutes % 60;
      if (hoursLeft > 0) {
        setCountdownText(`${hoursLeft}j ${minsLeft}m`);
      } else {
        setCountdownText(`${minsLeft}m`);
      }
    };

    updatePrayerState();
    const interval = setInterval(updatePrayerState, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentPrayerItem = PRAYER_SCHEDULE.find((p) => p.name === activePrayer) || PRAYER_SCHEDULE[2];
  const ActiveIcon = currentPrayerItem.icon;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Compact Interactive Capsule */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 bg-slate-50/90 hover:bg-slate-100/90 p-1 pr-2.5 rounded-xl border border-slate-200/80 text-xs shadow-2xs transition-all cursor-pointer select-none group"
        title="Klik untuk melihat seluruh jadwal waktu sholat Makassar (WITA)"
      >
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200/60">
          <Clock className="w-3 h-3 text-emerald-600" />
          <span>WITA</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] sm:text-[11px] shadow-xs">
          <ActiveIcon className="w-3 h-3 text-emerald-200" />
          <span>{currentPrayerItem.name}</span>
          <span className="font-mono text-emerald-100 font-bold">{currentPrayerItem.time}</span>
        </div>

        {countdownText && (
          <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
            {countdownText}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Floating Popover Schedule Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Jadwal Sholat Makassar</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              WITA (GMT+8)
            </span>
          </div>

          <div className="space-y-1.5">
            {PRAYER_SCHEDULE.map((p) => {
              const isCurrent = p.name === activePrayer;
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                    isCurrent
                      ? 'bg-emerald-600 text-white font-bold shadow-soft-sm'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-200' : 'text-slate-400'}`} />
                    <span>{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold">{p.time}</span>
                    {isCurrent && (
                      <span className="text-[9px] bg-emerald-700/90 text-emerald-100 px-1.5 py-0.2 rounded-md font-semibold">
                        {countdownText}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            DKM Masjid Babul Khaer • BTP Blok AE
          </div>
        </div>
      )}
    </div>
  );
}
