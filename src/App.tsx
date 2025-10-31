import React, { useState, useEffect } from 'react';

const CafeVoltaireApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [points, setPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showRedeemQR, setShowRedeemQR] = useState(null);
  
  // Check for existing session on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('cafeToken');
    const savedUser = sessionStorage.getItem('cafeUser');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      fetchPointsFromBackend(savedToken);
    }
  }, []);
  
  const fetchPointsFromBackend = async (authToken) => {
    try {
      const response = await fetch('http://localhost:3001/rewards/points', {
        headers: {
          'Authorization': `Bearer ${authToken || token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPoints(data.points);
      }
    } catch (error) {
      console.error('Failed to fetch points:', error);
    }
  };
  
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        setPoints(data.user.points);
        setIsAuthenticated(true);
        
        // Save to sessionStorage
        sessionStorage.setItem('cafeToken', data.token);
        sessionStorage.setItem('cafeUser', JSON.stringify(data.user));
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Connection failed' };
    }
  };
  
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setPoints(0);
    setIsAuthenticated(false);
    sessionStorage.removeItem('cafeToken');
    sessionStorage.removeItem('cafeUser');
    setCurrentScreen('home');
  };
  
  const earnPoints = async () => {
    try {
      const response = await fetch('http://localhost:3001/rewards/earn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: 50 })
      });
      if (response.ok) {
        const data = await response.json();
        setPoints(data.points);
        alert(`You earned 50 points! Total: ${data.points} points`);
      }
    } catch (error) {
      console.error('Failed to earn points:', error);
    }
  };
  
  const redeemReward = async (reward) => {
    try {
      const response = await fetch('http://localhost:3001/rewards/redeem', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points: reward.points })
      });
      
      if (response.ok) {
        const data = await response.json();
        setPoints(data.points);
        // Generate QR code data
        const qrData = {
          rewardName: reward.name,
          userId: user.id,
          timestamp: Date.now(),
          code: Math.random().toString(36).substring(2, 15)
        };
        setShowRedeemQR(qrData);
      } else {
        const error = await response.json();
        alert(error.error || 'Redemption failed');
      }
    } catch (error) {
      console.error('Failed to redeem:', error);
      alert('Connection failed');
    }
  };

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

  // QR Code Generator Component (simplified pattern-based)
  const QRCodeDisplay = ({ data }) => {
    const qrString = JSON.stringify(data);
    const size = 12;
    
    // Simple hash function for demo QR pattern
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };
    
    const hash = hashCode(qrString);
    
    return (
      <div className="bg-white p-6 rounded-2xl">
        <div className="grid gap-1" style={{ 
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          width: '240px',
          height: '240px'
        }}>
          {[...Array(size * size)].map((_, i) => {
            const x = i % size;
            const y = Math.floor(i / size);
            const isCorner = (x < 3 && y < 3) || (x >= size - 3 && y < 3) || (x < 3 && y >= size - 3);
            const pattern = (hash + x * 7 + y * 13) % 2 === 0;
            const isFilled = isCorner || pattern;
            
            return (
              <div
                key={i}
                className={`${isFilled ? 'bg-gray-900' : 'bg-white'} rounded-sm`}
              />
            );
          })}
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500 font-mono">Code: {data.code}</p>
          <p className="text-sm font-semibold text-gray-700 mt-2">{data.rewardName}</p>
        </div>
      </div>
    );
  };

  // Login Screen
  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);
      
      const result = await handleLogin(email, password);
      
      if (result.success) {
        setCurrentScreen('home');
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-950 mb-2">CAFÉ VOLTAIRE</h1>
            <p className="text-gray-600">Sign in to your rewards account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-900 text-white font-semibold py-3 rounded-xl hover:bg-amber-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-800">Email: john@example.com</p>
            <p className="text-xs text-blue-800">Password: password123</p>
          </div>
        </div>
      </div>
    );
  };

  const HomeScreen = () => (
    <div className="space-y-6 pb-6">
      <div className="px-6 flex justify-between items-start">
        <div>
          <p className="text-amber-800 text-sm font-medium mb-1">WELCOME BACK</p>
          <h1 className="text-4xl font-bold text-amber-950 leading-tight">
            {user?.name || 'Guest'}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Logout
        </button>
      </div>

      <div className="px-6">
        <p className="text-amber-800 text-sm font-medium mb-1">LIMITED TIME</p>
        <h2 className="text-5xl font-bold text-amber-950 leading-tight">
          ICED LATTE<br />IS BACK
        </h2>
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
              <h3 className="text-3xl font-bold text-amber-950 mb-4">
                {card.title}
              </h3>
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
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-600">You've got</p>
          <h1 className="text-4xl font-bold text-amber-950">{points} POINTS</h1>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          TEST FEATURES
        </h3>
        <div className="text-center py-8 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-600 mb-4">Test backend connection</p>
          <button 
            onClick={earnPoints}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
          >
            + EARN 50 POINTS
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
              onClick={() => redeemReward(reward)}
              className={`w-full bg-white rounded-2xl p-5 border transition-all text-left ${
                points >= reward.points
                  ? 'border-gray-200 hover:border-amber-300 hover:shadow-md'
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{reward.name}</h3>
                    <p className="text-sm text-gray-600">{reward.points} Points</p>
                  </div>
                </div>
                {points >= reward.points && (
                  <span className="text-amber-900 font-semibold">Redeem →</span>
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
        <p className="text-amber-800 text-sm font-medium mb-2">MEMBER CARD</p>
        <h2 className="text-4xl font-bold text-amber-950 mb-2">SCAN TO EARN</h2>
        <p className="text-gray-600">Show this at checkout</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg relative">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 bg-amber-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
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
          <p className="text-sm font-semibold text-gray-600 mb-1">MEMBER</p>
          <p className="text-xl font-bold text-gray-800">{user?.name || 'Guest'}</p>
          <p className="text-sm font-mono text-gray-600 mt-1">#{user?.id || '0000'}</p>
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

  // QR Modal for redeemed rewards
  const RedeemQRModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-stone-50 rounded-3xl p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reward Redeemed!</h2>
          <p className="text-gray-600">Show this QR code to staff</p>
        </div>
        
        <div className="flex justify-center mb-6">
          <QRCodeDisplay data={showRedeemQR} />
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-900 text-center">
            Valid for 15 minutes from redemption
          </p>
        </div>
        
        <button
          onClick={() => setShowRedeemQR(null)}
          className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

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
      
      {/* QR Modal */}
      {showRedeemQR && <RedeemQRModal />}
    </div>
  );
};

export default CafeVoltaireApp;
