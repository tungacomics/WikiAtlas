
import React from 'react';
import { Icons } from './Icon';

interface Event {
  year: number;
  title: string;
  desc: string;
}

const mockEvents: Record<string, Event[]> = {
  'Feb 14': [
    { year: 1483, title: 'Zahiriddin Muhammad Bobur Tavalludi', desc: 'Buyuk shoh, shoir va Boburiylar sulolasi asoschisi Andijonda tavallud topgan.' },
    { year: 1876, title: 'Alexander Graham Bell', desc: 'Telefon ixtirochisi patent uchun ariza topshirgan kun.' }
  ],
  'Feb 09': [
    { year: 1441, title: 'Alisher Navoiy Tavalludi', desc: 'Oʻzbek adabiy tilining asoschisi, mutafakkir va davlat arbobi Hirotda tugʻilgan.' }
  ]
};

export const EventCalendar = () => {
  const today = new Date();
  const dateKey = today.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const events = mockEvents[dateKey] || [
    { year: 1946, title: 'ENIAC computer presented', desc: 'The first general-purpose electronic digital computer was formally dedicated.' }
  ];

  return (
    <div className="bg-white rounded-custom border border-brand-100 p-8 shadow-soft">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Icons.Clock className="w-5 h-5 text-brand-500" />
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Today in History</h3>
        </div>
        <span className="text-xs font-bold text-brand-500 uppercase px-3 py-1 bg-brand-50 rounded-full">{dateKey}</span>
      </div>

      <div className="space-y-8">
        {events.map((event, idx) => (
          <div key={idx} className="relative pl-6 border-l-2 border-brand-100 group">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-brand-200 group-hover:bg-brand-500 transition-colors" />
            <span className="text-[10px] font-black text-brand-500 uppercase block mb-1">{event.year}</span>
            <h4 className="font-extrabold text-gray-900 uppercase text-xs mb-1 group-hover:text-brand-600 transition-colors">{event.title}</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed italic">{event.desc}</p>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 pt-6 border-t border-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-500 transition-colors">
        View Full Calendar
      </button>
    </div>
  );
};
