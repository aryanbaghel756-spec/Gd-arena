'use client';

import React, { useState } from 'react';
import { Topic, TopicCategory } from '@/types/arena';
import { TOPIC_PRESETS } from '@/data/mockData';
import { Sparkles, Edit3, Check, Shuffle } from 'lucide-react';
import { RectButton } from '../ui/RectButton';

interface TopicPickerProps {
  selectedTopic: Topic;
  onSelectTopic: (topic: Topic) => void;
  onShuffleTopic: () => void;
}

export function TopicPicker({ selectedTopic, onSelectTopic, onShuffleTopic }: TopicPickerProps) {
  const [activeCategory, setActiveCategory] = useState<TopicCategory>(selectedTopic.category);
  const [customTitle, setCustomTitle] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const categories: TopicCategory[] = ['Current affairs', 'Case-based', 'Controversial', 'Abstract'];

  const categoryTopics = TOPIC_PRESETS.filter((t) => t.category === activeCategory);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const customTopic: Topic = {
      id: `custom-${Date.now()}`,
      category: activeCategory,
      title: customTitle.trim(),
      description: 'Custom student-defined problem statement for group debate.',
      contextPoints: [
        'Explore primary stakeholder tensions and trade-offs',
        'Identify second-order macroeconomic or cultural implications',
        'Synthesize pragmatic actionable interventions'
      ]
    };
    onSelectTopic(customTopic);
    setIsCustomMode(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Category Hex-Chips */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-amber-300 mb-3">
          1. Choose Topic Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  const firstMatch = TOPIC_PRESETS.find((t) => t.category === cat);
                  if (firstMatch) onSelectTopic(firstMatch);
                }}
                className={`
                  relative px-4 py-3 text-xs sm:text-sm font-display font-bold uppercase tracking-wider
                  transition-all duration-200 clip-hex-flat-sm select-none
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc400]
                  ${isSelected
                    ? 'bg-gradient-to-r from-[#ff1e2d] to-[#ffc400] text-white shadow-[0_0_18px_rgba(255,30,45,0.6)]'
                    : 'bg-[#150d14] text-zinc-400 hover:text-white border border-[#2d1825] hover:border-[#ff1e2d]/50'
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Topics Under Selected Category */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono uppercase tracking-widest text-amber-300">
            2. Select Statement or Prompt
          </label>
          <button
            type="button"
            onClick={onShuffleTopic}
            className="inline-flex items-center gap-1.5 text-xs text-[#ffc400] hover:text-[#ffe066] font-mono transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle Random</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {categoryTopics.map((topic) => {
            const isChosen = selectedTopic.id === topic.id;
            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className={`
                  p-4 rounded-xl border transition-all cursor-pointer relative group
                  ${isChosen
                    ? 'bg-[#220d1c] border-[#ffc400] shadow-[0_0_20px_rgba(255,196,0,0.35)] ring-1 ring-[#ffc400]/40'
                    : 'bg-[#120a11]/90 border-[#2b1725] hover:border-[#ff1e2d]/50 hover:bg-[#180e17]'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-amber-100 transition-colors">
                      {topic.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  </div>

                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center shrink-0 border mt-0.5
                    ${isChosen ? 'bg-[#ffc400] text-black border-[#ffc400]' : 'border-zinc-700 bg-black/40'}
                  `}>
                    {isChosen ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                  </div>
                </div>

                {/* Bullet Points */}
                {isChosen && (
                  <div className="mt-3 pt-3 border-t border-[#381a2e] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-200/80">
                    {topic.contextPoints.map((pt, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff1e2d]" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Topic Input Accordion / Drawer */}
      <div className="p-4 rounded-xl bg-[#0f090e] border border-[#2b1624]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#ffc400]" />
            <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Have a custom discussion topic?
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-xs text-[#ffc400] hover:underline font-mono"
          >
            {isCustomMode ? 'Hide Input' : 'Type Custom Topic'}
          </button>
        </div>

        {isCustomMode && (
          <form onSubmit={handleApplyCustom} className="mt-3.5 space-y-3">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Should algorithmic trading be taxed at higher rates?"
              className="w-full px-4 py-2.5 rounded-lg bg-[#180f17] border border-[#ff1e2d]/40 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#ffc400] focus:ring-1 focus:ring-[#ffc400]"
            />
            <div className="flex justify-end">
              <RectButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={!customTitle.trim()}
              >
                Use Custom Topic
              </RectButton>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
