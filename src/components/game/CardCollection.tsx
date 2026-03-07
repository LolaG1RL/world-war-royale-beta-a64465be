import { GameCard, allCards, rarityColors } from '@/data/cards';
import CardComponent from './CardComponent';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface CardCollectionProps {
  deck: GameCard[];
  onDeckChange: (deck: GameCard[]) => void;
  onBack: () => void;
}

const CardCollection = ({ deck, onDeckChange, onBack }: CardCollectionProps) => {
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [filter, setFilter] = useState<'all' | 'troop' | 'spell' | 'building'>('all');

  const filtered = filter === 'all' ? allCards : allCards.filter(c => c.type === filter);
  const isInDeck = (card: GameCard) => deck.some(d => d.id === card.id);

  const toggleDeck = (card: GameCard) => {
    if (isInDeck(card)) {
      onDeckChange(deck.filter(d => d.id !== card.id));
    } else if (deck.length < 8) {
      onDeckChange([...deck, card]);
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <button onClick={onBack} className="text-muted-foreground text-sm">← Back</button>
        <h2 className="font-display font-bold text-foreground text-lg">Battle Deck</h2>
        <span className="text-primary text-sm font-bold">{deck.length}/8</span>
      </div>

      {/* Current deck */}
      <div className="px-3 py-3 bg-secondary/50 border-b border-border">
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4]">
              {deck[i] ? (
                <div onClick={() => toggleDeck(deck[i])}>
                  <CardComponent card={deck[i]} size="sm" />
                </div>
              ) : (
                <div className="w-full h-full rounded border-2 border-dashed border-muted-foreground/20" />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-2 text-xs text-muted-foreground">
          Avg Elixir: {deck.length > 0 ? (deck.reduce((a, c) => a + c.elixir, 0) / deck.length).toFixed(1) : '0.0'}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-3 py-2 bg-card border-b border-border">
        {(['all', 'troop', 'spell', 'building'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-4 gap-2">
          {filtered.map(card => (
            <motion.div
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCard(card)}
              className={`${isInDeck(card) ? 'ring-2 ring-primary rounded-lg' : ''}`}
            >
              <CardComponent card={card} size="md" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedCard(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="game-panel p-6 max-w-xs w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <CardComponent card={selectedCard} size="lg" showElixir />
            </div>
            <h3 className="font-display font-bold text-foreground text-xl text-center">{selectedCard.name}</h3>
            <p className="text-muted-foreground text-xs text-center mt-1">{selectedCard.era}</p>
            <p className="text-foreground/80 text-sm text-center mt-3">{selectedCard.description}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {selectedCard.hp && (
                <div className="bg-muted rounded p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">HP</div>
                  <div className="text-sm font-bold text-hp-green">{selectedCard.hp}</div>
                </div>
              )}
              <div className="bg-muted rounded p-2 text-center">
                <div className="text-[10px] text-muted-foreground">DMG</div>
                <div className="text-sm font-bold text-accent">{selectedCard.damage}</div>
              </div>
            </div>
            <button
              onClick={() => { toggleDeck(selectedCard); setSelectedCard(null); }}
              className={`w-full mt-4 py-2 rounded-lg font-bold text-sm ${isInDeck(selectedCard) ? 'bg-accent text-accent-foreground' : deck.length < 8 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
              disabled={!isInDeck(selectedCard) && deck.length >= 8}
            >
              {isInDeck(selectedCard) ? 'Remove from Deck' : 'Add to Deck'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CardCollection;
