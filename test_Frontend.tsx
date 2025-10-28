import React, { useState } from 'react';

const CafeVoltaireApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [points, setPoints] = useState(450);
  const [selectedCategory, setSelectedCategory] = useState('coffee');

  const menu = {
    galettes: [
      { name: 'Jambon & Fromage', price: 12.00, desc: '' },
      { name: 'Bacon, Egg, Cheese', price: 14.50, desc: 'Confit onion' },
      { name: 'Spinach, Goat Chz, Egg', price: 12.50, desc: '' },
      { name: 'Salmon, Goat Chz, Egg', price: 15.00, desc: 'Confit onion caper' },
      { name: 'Gruyère, Nutmeg, Confit Onion', price: 15.00, desc: '' },
      { name: 'Brie, Pear, Walnut + Honey', price: 15.00, desc: '' },
      { name: 'Salami, Bell Pepper, Cheese', price: 13.50, desc: 'Confit onion' },
      { name: 'Raclette, Potato', price: 15.00, desc: 'Confit onion' },
      { name: 'Mushroom, Spinach, Bell Pepper', price: 13.50, desc: 'Confit onion cheese' }
    ],
    sweet: [
      { name: 'Sucrée', price: 8.50, desc: 'Brown sugar, lemon, orange & cinnamon' },
      { name: 'Nutella + Strawberry', price: 10.50, desc: '' },
      { name: 'Nutella + Banana', price: 12.00, desc: '' },
      { name: 'Honey, Pear, Walnut', price: 11.50, desc: 'Salt & butter, brown sugar' },
      { name: 'Housemade Blueberry & Cassonade', price: 12.50, desc: '' },
      { name: 'Chestnut Purée + Vanilla Meringue', price: 12.50, desc: '' }
    ],
    coffee: [
      { name: 'Espresso', price: 3.50, desc: 'W/ tonic' },
      { name: 'Macchiato', price: 4.00, desc: '' },
      { name: 'Café Crème', price: 5.00, desc: '' },
      { name: 'Cappuccino', price: 5.00, desc: '' },
      { name: 'Latté', price: 5.50, desc: '' },
      { name: 'Mocha', price: 6.50, desc: '' },
      { name: 'Pourover', price: 5.50, desc: 'Single origin' }
    ],
    tea: [
      { name: 'Matcha Latte', price: 5.50, desc: '' },
      { name: 'Yerba Mate', price: 4.50, desc: '' },
      { name: 'Earl Grey', price: 4.50, desc: '' },
      { name: 'Jasmine Green', price: 4.75, desc: '' },
      { name: 'Oolong', price: 4.75, desc: '' }
    ],
    other: [
      { name: 'Orangina', price: 4.50, desc: '' },
      { name: 'Coconut Water', price: 4.50, desc: '' },
      { name: 'Mexi-Coke', price: 4.50, desc: '' },
      { name: 'Fresh Orange Juice', price: 5.00, desc: '' }
    ]
  };

  const rewards = [
    { name: 'Espresso', points: 500 },
    { name: 'Latté', points: 650 },
    { name: 'Crepe', points: 720 },
    { name: 'Coffee for 2', points: 1000 }
  ];

  const promoCards = [
    {
      title: 'ICED LATTE',
      subtitle: 'Try our new',
      bgColor: 'from-amber-100 to-orange-100'
    },
    {
      title: 'CAPPUCCINO',
      subtitle: 'Classic favorite',
      bgColor: 'from-stone-100 to-amber-50'
    },
    {
      title: 'SWEET CREPES',
      subtitle: 'Dessert time',
      bgColor: 'from-rose-100 to-pink-100'
    }
  ];

  const HomeScreen = () => (
    <div className="space-y-6 pb-6">
      <div className="px-6">
        <p className="text-amber-800 text-sm font-medium mb-1">LIMITED TIME</p>
        <h1 className="text-5xl font-bold text-amber-950 leading-tight">
          ICED LATTE<br />IS BACK
        </h1>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-6">
          {promoCards.map((card, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 bg-gradient-to-br ${card.bgColor} rounded-2xl p-6 shadow-sm`}
              style={{ width: '80vw', maxWidth: '320px' }}
            >
              <p className="text-amber-800 text-xs font-semibold mb-2 uppercase tracking-wide">
                {card.subtitle}
              </p>
              <h2 className="text-3xl font-bold text-amber-950 mb-4">
                {card.title}
              </h2>
              <div className="h-32 bg-white/40 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MenuScreen = () => (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['coffee', 'tea', 'galettes', 'sweet', 'other'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-amber-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {menu[selectedCategory].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                {item.desc && (
                  <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                )}
              </div>
              <span className="text-lg font-bold text-amber-900 ml-4">
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RewardsScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-amber-900 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-600">You've got</p>
          <h1 className="text-4xl font-bold text-amber-950">{points} POINTS</h1>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          READY TO USE
        </h3>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Rewards</h2>
          <p className="text-gray-600 mb-6">Order to earn points for Rewards.</p>
          <button className="px-6 py-3 border-2 border-amber-900 text-amber-900 font-semibold rounded-full hover:bg-amber-50 transition-colors">
            SCAN IN RESTAURANT
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          REDEEM YOUR POINTS
        </h3>
        <div className="space-y-3">
          {rewards.map((reward, idx) => (
            <button
              key={idx}
              disabled={points < reward.points}
              className={`w-full bg-white rounded-2xl p-5 border transition-all text-left ${
                points >= reward.points
                  ? 'border-gray-200 hover:border-amber-300 hover:shadow-md'
                  : 'border-gray-200 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl"></div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{reward.name}</h3>
                    <p className="text-sm text-gray-600">{reward.points} Points</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ScanScreen = () => (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center">
        <p className="text-amber-800 text-sm font-medium mb-2">FORGOT TO SCAN?</p>
        <h2 className="text-4xl font-bold text-amber-950 mb-2">SCAN BEFORE PAYING</h2>
        <p className="text-gray-600">To earn points.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg relative">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 bg-amber-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
        </div>
        
        <div className="w-64 h-64 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 mt-4">
          <div className="grid grid-cols-3 gap-2 w-48 h-48">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-900 border-2 border-white'} rounded`}></div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600 mb-1">MEMBER CARD</p>
          <p className="text-xl font-bold text-gray-800">John Smith</p>
          <p className="text-sm font-mono text-gray-600 mt-1">#5297735</p>
        </div>
      </div>

      <button className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
        </svg>
        Add to Apple Wallet
      </button>

      <p className="text-xs text-gray-500">For use in the U.S. only.</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-stone-50 min-h-screen flex flex-col">
      {/* Content */}
      <div className="flex-1 pt-6 pb-24 overflow-y-auto">
        <div className="px-6">
          {currentScreen === 'home' && <HomeScreen />}
          {currentScreen === 'menu' && <MenuScreen />}
          {currentScreen === 'rewards' && <RewardsScreen />}
          {currentScreen === 'scan' && <ScanScreen />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-8 py-4 fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${
              currentScreen === 'home' ? 'text-amber-900 underline decoration-2 underline-offset-4' : 'text-gray-800'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentScreen('menu')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${
              currentScreen === 'menu' ? 'text-amber-900 underline decoration-2 underline-offset-4' : 'text-gray-800'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setCurrentScreen('rewards')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${
              currentScreen === 'rewards' ? 'text-amber-900 underline decoration-2 underline-offset-4' : 'text-gray-800'
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setCurrentScreen('scan')}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${
              currentScreen === 'scan' ? 'text-amber-900 underline decoration-2 underline-offset-4' : 'text-gray-800'
            }`}
          >
            Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CafeVoltaireApp;
