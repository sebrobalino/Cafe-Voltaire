import React, { useState, useEffect } from "react";
import { auth, addPointsFromQr } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { Html5QrcodeScanner } from "html5-qrcode";

const CafeVoltaireApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<"home" | "menu" | "rewards" | "scan">("home");
  const [points, setPoints] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState("coffee");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [showRedeemQR, setShowRedeemQR] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      if (user) {
        setFirebaseUser(user);
        setIsAuthenticated(true);
      } else {
        setFirebaseUser(null);
        setIsAuthenticated(false);
        setPoints(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch points whenever firebaseUser changes
  useEffect(() => {
    if (firebaseUser) {
      fetchPointsFromBackend();
    }
  }, [firebaseUser]);

  const getAuthToken = async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken();
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  };

  const fetchPointsFromBackend = async () => {
    const token = await getAuthToken();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/rewards/points', {
        headers: {
          'Authorization': `Bearer ${token}`
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentScreen('home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const earnPoints = async () => {
    if (!firebaseUser) return;
    
    try {
      // Uses preGeneratedEarnCodes/COFFEE_BOOST_1
      const newTotal = await addPointsFromQr(firebaseUser.uid, "COFFEE_BOOST_1");
      setPoints(newTotal);
      alert(`You earned points! Total: ${newTotal} points`);
      // Also update backend
      await fetchPointsFromBackend();
    } catch (err: any) {
      console.error("Failed to earn points:", err);
      alert(err?.message ?? "Failed to earn points. Check console for details.");
    }
  };

  const redeemReward = async (reward: { name: string; points: number }) => {
    const token = await getAuthToken();
    if (!token) return;

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
          userId: firebaseUser?.uid,
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
      { name: "Jambon & Fromage", price: 12.0, desc: "" },
      { name: "Bacon, Egg, Cheese", price: 14.5, desc: "Confit onion" },
      { name: "Spinach, Goat Chz, Egg", price: 12.5, desc: "" },
      { name: "Salmon, Goat Chz, Egg", price: 15.0, desc: "Confit onion caper" },
      { name: "Gruyère, Nutmeg, Confit Onion", price: 15.0, desc: "" },
      { name: "Brie, Pear, Walnut + Honey", price: 15.0, desc: "" },
      { name: "Salami, Bell Pepper, Cheese", price: 13.5, desc: "Confit onion" },
      { name: "Raclette, Potato", price: 15.0, desc: "Confit onion" },
      { name: "Mushroom, Spinach, Bell Pepper", price: 13.5, desc: "Confit onion cheese" },
    ],
    sweet: [
      { name: "Sucrée", price: 8.5, desc: "Brown sugar, lemon, orange & cinnamon" },
      { name: "Nutella + Strawberry", price: 10.5, desc: "" },
      { name: "Nutella + Banana", price: 12.0, desc: "" },
      { name: "Honey, Pear, Walnut", price: 11.5, desc: "Salt & butter, brown sugar" },
      { name: "Housemade Blueberry & Cassonade", price: 12.5, desc: "" },
      { name: "Chestnut Purée + Vanilla Meringue", price: 12.5, desc: "" },
    ],
    coffee: [
      { name: "Espresso", price: 3.5, desc: "W/ tonic" },
      { name: "Macchiato", price: 4.0, desc: "" },
      { name: "Café Crème", price: 5.0, desc: "" },
      { name: "Cappuccino", price: 5.0, desc: "" },
      { name: "Latté", price: 5.5, desc: "" },
      { name: "Mocha", price: 6.5, desc: "" },
      { name: "Pourover", price: 5.5, desc: "Single origin" },
    ],
    tea: [
      { name: "Matcha Latte", price: 5.5, desc: "" },
      { name: "Yerba Mate", price: 4.5, desc: "" },
      { name: "Earl Grey", price: 4.5, desc: "" },
      { name: "Jasmine Green", price: 4.75, desc: "" },
      { name: "Oolong", price: 4.75, desc: "" },
    ],
    other: [
      { name: "Orangina", price: 4.5, desc: "" },
      { name: "Coconut Water", price: 4.5, desc: "" },
      { name: "Mexi-Coke", price: 4.5, desc: "" },
      { name: "Fresh Orange Juice", price: 5.0, desc: "" },
    ],
  };

  const rewards = [
    { name: "Espresso", points: 500 },
    { name: "Latté", points: 650 },
    { name: "Crepe", points: 720 },
    { name: "Coffee for 2", points: 1000 },
  ];

  const promoCards = [
    {
      title: "ICED LATTE",
      subtitle: "Try our new",
      bgColor: "from-amber-100 to-orange-100",
    },
    {
      title: "CAPPUCCINO",
      subtitle: "Classic favorite",
      bgColor: "from-stone-100 to-amber-50",
    },
    {
      title: "SWEET CREPES",
      subtitle: "Dessert time",
      bgColor: "from-rose-100 to-pink-100",
    },
  ];

  // QR Code Generator Component (simplified pattern-based)
  const QRCodeDisplay = ({ data }: { data: any }) => {
    const qrString = JSON.stringify(data);
    const size = 12;
    
    // Simple hash function for demo QR pattern
    const hashCode = (str: string) => {
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

  // Login/Signup Screen
  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsSubmitting(true);
      
      try {
        if (isSignup) {
          await createUserWithEmailAndPassword(auth, email.trim(), password);
        } else {
          await signInWithEmailAndPassword(auth, email.trim(), password);
        }
        // Auth state change will be handled by onAuthStateChanged
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError('Email already in use. Please sign in instead.');
        } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          setError('Invalid email or password.');
        } else if (err.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters.');
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email address.');
        } else {
          setError(err.message || 'Authentication failed');
        }
      } finally {
        setIsSubmitting(false);
      }
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-950 mb-2">CAFÉ VOLTAIRE</h1>
            <p className="text-gray-600">
              {isSignup ? 'Create your rewards account' : 'Sign in to your rewards account'}
            </p>
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
                minLength={6}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-900 text-white font-semibold py-3 rounded-xl hover:bg-amber-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-sm text-amber-900 hover:underline"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const HomeScreen = () => (
    <div className="pb-6">
      <div className="px-6 flex justify-between items-start">
        <div>
          <p className="text-amber-800 text-sm font-medium mb-1">WELCOME BACK</p>
          <h1 className="text-4xl font-bold text-amber-950 leading-tight">
            {firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Guest'}
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-amber-800 text-sm font-medium mr-2">LIMITED TIME</p>
          <img
            src="/Cafe_logo.png"
            alt="Cafe Voltaire"
            className="w-20"
            style={{ transform: 'rotate(20deg)' }}
          />
        </div>
        <h2 className="text-5xl font-bold text-amber-950 leading-tight text-center">
          ICED LATTE<br />IS BACK
        </h2>
        <img
          src="/iced_coffee.png"
          alt="Iced coffee"
          className="w-3/5 mx-auto my-4 drop-shadow-lg"
        />
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-6">
          {promoCards.map((card, idx) => {
            const { bgClass, imageSrc, alt } =
              card.title === "ICED LATTE"
                ? {
                    bgClass: "bg-amber-100",
                    imageSrc: "/matcha1.png",
                    alt: "Matcha latte",
                  }
                : card.title === "CAPPUCCINO"
                ? {
                    bgClass: "bg-white/40",
                    imageSrc: "/cappuccino.png",
                    alt: "Cappuccino",
                  }
                : card.title === "SWEET CREPES"
                ? {
                    bgClass: "bg-white/40",
                    imageSrc: "/crepe.png",
                    alt: "Crepe",
                  }
                : { bgClass: "bg-white/40", imageSrc: null, alt: "" };

            return (
              <div
                key={idx}
                className={`flex-shrink-0 bg-gradient-to-br ${card.bgColor} rounded-2xl p-6 shadow-sm`}
                style={{ width: "80vw", maxWidth: "320px" }}
              >
                <p className="text-amber-800 text-xs font-semibold mb-2 uppercase tracking-wide">
                  {card.subtitle}
                </p>
                <h2 className="text-3xl font-bold text-amber-950 mb-4">{card.title}</h2>
                <div className={`h-32 rounded-xl overflow-hidden flex items-center justify-center ${bgClass}`}>
                  {imageSrc ? (
                    <img src={imageSrc} alt={alt} className="h-full object-cover" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const MenuScreen = () => (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["coffee", "tea", "galettes", "sweet", "other"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
              ? "bg-amber-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {menu[selectedCategory as keyof typeof menu].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                {item.desc && <p className="text-sm text-gray-500 mt-1">{item.desc}</p>}
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

  const RewardsScreen = () => {
    // Fetch points when Rewards screen is opened
    useEffect(() => {
      if (firebaseUser) {
        fetchPointsFromBackend();
      }
    }, []); // Only run once when component mounts

    return (
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
  };

  const ScanScreen = () => {
    const scannerRef = React.useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
      if (!firebaseUser) return;
      
      // If scanner already exists, don't create another one
      if (scannerRef.current) {
        return;
      }

      // Manual cleanup: Ensure the container is empty before rendering the scanner
      const readerElement = document.getElementById("reader");
      if (readerElement) {
        readerElement.innerHTML = "";
      }

      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scannerRef.current = scanner;

      const onScanSuccess = async (decodedText: string) => {
        // Stop scanning after success
        try {
          await scanner.clear();
          scannerRef.current = null;
        } catch (e) {
          console.error("Failed to clear scanner", e);
        }

        try {
          if (!firebaseUser) {
            alert("You must be logged in to scan QR codes");
            return;
          }
          const newTotal = await addPointsFromQr(firebaseUser.uid, decodedText);
          setPoints(newTotal);
          alert(`Success! You earned points. Total: ${newTotal}`);
          // Also update backend
          await fetchPointsFromBackend();
        } catch (err: any) {
          console.error("Scan error:", err);
          alert(err.message || "Failed to add points");
        }
      };

      const onScanFailure = (error: any) => {
        // handle scan failure
      };

      scanner.render(onScanSuccess, onScanFailure);

      // Cleanup function
      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch((error) => {
            console.error("Failed to clear html5-qrcode scanner. ", error);
          });
          scannerRef.current = null;
        }
      };
    }, [firebaseUser]);

    return (
      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-amber-950 mb-2">SCAN QR CODE</h2>
          <p className="text-gray-600">Scan a code to earn points.</p>
        </div>

        <div className="w-full max-w-sm bg-white rounded-3xl p-4 border border-gray-200 shadow-lg">
          <div id="reader" style={{ width: "100%" }}></div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">Ensure good lighting for best results.</p>
        </div>
      </div>
    );
  };

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

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-950 mb-4">CAFÉ VOLTAIRE</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="max-w-md mx-auto bg-stone-50 min-h-screen flex flex-col">
      {/* Content */}
      <div className="flex-1 pt-6 pb-24 overflow-y-auto">
        <div className="px-6">
          {currentScreen === "home" && <HomeScreen />}
          {currentScreen === "menu" && <MenuScreen />}
          {currentScreen === "rewards" && <RewardsScreen />}
          {currentScreen === "scan" && <ScanScreen />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-8 py-4 fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen("home")}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentScreen === "home"
              ? "text-amber-900 underline decoration-2 underline-offset-4"
              : "text-gray-800"
              }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentScreen("menu")}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentScreen === "menu"
              ? "text-amber-900 underline decoration-2 underline-offset-4"
              : "text-gray-800"
              }`}
          >
            Menu
          </button>
          <button
            onClick={() => setCurrentScreen("rewards")}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentScreen === "rewards"
              ? "text-amber-900 underline decoration-2 underline-offset-4"
              : "text-gray-800"
              }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setCurrentScreen("scan")}
            className={`text-sm font-bold uppercase tracking-wide transition-colors ${currentScreen === "scan"
              ? "text-amber-900 underline decoration-2 underline-offset-4"
              : "text-gray-800"
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
