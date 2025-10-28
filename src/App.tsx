import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

const CafeVoltaireApp = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [points, setPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [authMode, setAuthMode] = useState('signin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    { title: 'ICED LATTE', subtitle: 'Try our new', bgColor: 'from-amber-100 to-orange-100' },
    { title: 'CAPPUCCINO', subtitle: 'Classic favorite', bgColor: 'from-stone-100 to-amber-50' },
    { title: 'SWEET CREPES', subtitle: 'Dessert time', bgColor: 'from-rose-100 to-pink-100' }
  ];

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      loadPoints(savedToken);
    }
    setLoading(false);
  }, []);

  const loadPoints = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/rewards/points`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPoints(data.points);
      }
    } catch (err) {
      console.error('Error loading points:', err);
    }
  };

  const handleSignIn = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Login failed');
        return;
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      setPoints(data.user.points);
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setToken(null);
    setPoints(0);
    setCurrentScreen('home');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const earnPoints = async (amount = 50) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/rewards/earn`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        const data = await response.json();
        setPoints(data.points);
      }
    } catch (err) {
      console.error('Error earning points:', err);
    }
  };

  const redeemReward = async (cost) => {
    if (!token || points < cost) return;
    
    try {
      const response = await fetch(`${API_URL}/rewards/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points: cost })
      });

      if (response.ok) {
        const data = await response.json();
        setPoints(data.points);
      }
    } catch (err) {
      console.error('Error redeeming reward:', err);
    }
  };

  const AuthScreen = () => (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-950 mb-2">Café Voltaire</h1>
          <p className="text-gray-600">Welcome back!</p>
          <p className="text-xs text-gray-500 mt-4">Demo: john@example.com / password123</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSignIn}
            className="w-full bg-amber-900 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="space-y-6 pb-6">
      <div className="px-6 flex justify-between items-start">
        <div>
          <p className="text-amber-800 text-sm font-medium mb-1">LIMITED TIME</p>
          <h1 className="text-5xl font-bold text-amber-950 leading-tight">
            ICED LATTE<br />IS BACK
          </h1>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Sign Out
        </button>
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

      <div className="px-6">
        <button
          onClick={() => earnPoints(50)}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Simulate Purchase (+50 points)
        </button>
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
          REDEEM YOUR POINTS
        </h3>
        <div className="space-y-3">
          {rewards.map((reward, idx) => (
            <button
              key={idx}
              onClick={() => redeemReward(reward.points)}
              disabled={points < reward.points}
              className={`w-full bg-white rounded-2xl p-5 border transition-all text-left ${
                points >= reward.points
                  ? 'border-gray-200 hover:border-amber-300 hover:shadow-md cursor-pointer'
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
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
                {points >= reward.points && (
                  <span className="text-amber-900 font-semibold text-sm">Redeem</span>
                )}
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
          <p className="text-xl font-bold text-gray-800">{user?.name || 'User'}</p>
          <p className="text-sm text-gray-600">{user?.email}</p>
          <p className="text-sm font-mono text-gray-600 mt-1">#{user?.id || '0000000'}</p>
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

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-stone-50 min-h-screen flex items-center justify-center">
        <div className="text-amber-900 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-stone-50 min-h-screen">
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-stone-50 min-h-screen flex flex-col">
      <div className="flex-1 pt-6 pb-24 overflow-y-auto">
        <div className="px-6">
          {currentScreen === 'home' && <HomeScreen />}
          {currentScreen === 'menu' && <MenuScreen />}
          {currentScreen === 'rewards' && <RewardsScreen />}
          {currentScreen === 'scan' && <ScanScreen />}
        </div>
      </div>

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
