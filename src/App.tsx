import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Item {
  id: string
  name: string
  amount: number
  users: string[]
}

interface User {
  id: string
  name: string
}

interface BillSplit {
  user: string
  totalOwed: number
  items: { name: string; amount: number }[]
}

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [gstAmount, setGstAmount] = useState<number>(0)
  const [newItemName, setNewItemName] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [results, setResults] = useState<BillSplit[]>([])
  
  // 🚀 INNOVATIVE FEATURES
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([])
  const [shakeAnimation, setShakeAnimation] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [hapticFeedback, setHapticFeedback] = useState(false)
  const [quickAddMode, setQuickAddMode] = useState(false)
  const [gestureHint, setGestureHint] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Refs for gesture detection
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const itemCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // 🌙 DARK MODE TOGGLE
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    triggerHapticFeedback()
  }

  // 🎯 SMART SUGGESTIONS SYSTEM
  const commonItems = [
    'Pizza', 'Burger', 'Pasta', 'Salad', 'Soup', 'Sandwich', 'Coffee', 'Tea',
    'Beer', 'Wine', 'Cocktail', 'Dessert', 'Appetizer', 'Main Course', 'Side Dish'
  ]

  const commonNames = [
    'Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery'
  ]

  // 🎤 VOICE INPUT SUPPORT
  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (isVoiceMode) {
          // Parse voice input for items
          const words = transcript.toLowerCase().split(' ')
          const amountMatch = transcript.match(/\$?(\d+(?:\.\d{2})?)/)
          const amount = amountMatch ? parseFloat(amountMatch[1]) : 0
          const itemName = words.filter(word => !word.match(/\$?\d+(?:\.\d{2})?/)).join(' ')
          
          if (itemName && amount > 0) {
            addItemFromVoice(itemName, amount)
          }
        } else {
          setNewUserName(transcript)
        }
      }
      
      recognition.start()
    }
  }

  const addItemFromVoice = (name: string, amount: number) => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: name.trim(),
      amount: amount,
      users: []
    }
    setItems([...items, newItem])
    triggerHapticFeedback()
  }

  // 📱 HAPTIC FEEDBACK SIMULATION
  const triggerHapticFeedback = () => {
    setHapticFeedback(true)
    setTimeout(() => setHapticFeedback(false), 200)
    
    // Visual haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }
  }

  // 🎯 GESTURE DETECTION
  const handleTouchStart = (e: React.TouchEvent, itemId?: string) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    
    if (itemId) {
      setGestureHint(true)
      setTimeout(() => setGestureHint(false), 2000)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent, itemId?: string) => {
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current
    
    // Swipe detection
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        setSwipeDirection('right')
        // Swipe right to quick add to all users
        if (itemId) {
          quickAddToAllUsers(itemId)
        }
      } else {
        setSwipeDirection('left')
        // Swipe left to remove item
        if (itemId) {
          removeItem(itemId)
        }
      }
      triggerHapticFeedback()
    }
    
    // Long press detection (hold for 500ms+)
    setTimeout(() => {
      setSwipeDirection(null)
    }, 100)
  }

  const quickAddToAllUsers = (itemId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return { ...item, users: users.map(user => user.id) }
      }
      return item
    }))
    triggerHapticFeedback()
  }

  // 🎯 SMART SUGGESTIONS
  const updateSmartSuggestions = (input: string, type: 'name' | 'item') => {
    const suggestions = type === 'name' ? commonNames : commonItems
    const filtered = suggestions.filter(item => 
      item.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 3)
    setSmartSuggestions(filtered)
  }

  const addUser = () => {
    if (newUserName.trim()) {
      const newUser: User = {
        id: Date.now().toString(),
        name: newUserName.trim()
      }
      setUsers([...users, newUser])
      setNewUserName('')
      setSmartSuggestions([])
      triggerHapticFeedback()
    }
  }

  const addItem = () => {
    if (newItemName.trim() && newItemAmount && parseFloat(newItemAmount) > 0) {
      const newItem: Item = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        amount: parseFloat(newItemAmount),
        users: []
      }
      setItems([...items, newItem])
      setNewItemName('')
      setNewItemAmount('')
      setSmartSuggestions([])
      triggerHapticFeedback()
    }
  }

  // 🎯 QUICK ADD MODE
  const toggleQuickAddMode = () => {
    setQuickAddMode(!quickAddMode)
    triggerHapticFeedback()
  }

  // 🎯 SHAKE TO CLEAR
  const handleShake = () => {
    setShakeAnimation(true)
    setTimeout(() => setShakeAnimation(false), 1000)
    
    // Clear all data
    setUsers([])
    setItems([])
    setGstAmount(0)
    setResults([])
    triggerHapticFeedback()
  }

  // 🎯 SMART CALCULATION WITH TIPS
  const calculateBillWithTips = () => {
    const userTotals: { [key: string]: { total: number; items: { name: string; amount: number }[] } } = {}
    
    // Initialize user totals
    users.forEach(user => {
      userTotals[user.id] = { total: 0, items: [] }
    })

    // Calculate each user's share of items
    items.forEach(item => {
      if (item.users.length > 0) {
        const amountPerUser = item.amount / item.users.length
        item.users.forEach(userId => {
          userTotals[userId].total += amountPerUser
          userTotals[userId].items.push({ name: item.name, amount: amountPerUser })
        })
      }
    })

    // Add GST share
    const gstPerUser = gstAmount / users.length
    users.forEach(user => {
      userTotals[user.id].total += gstPerUser
    })

    // Add smart tip suggestions (15%, 18%, 20%)
    const tipSuggestions = [0.15, 0.18, 0.20]
    const totalBill = items.reduce((sum, item) => sum + item.amount, 0) + gstAmount

    // Convert to results format
    const billResults: BillSplit[] = users.map(user => ({
      user: user.name,
      totalOwed: userTotals[user.id].total,
      items: userTotals[user.id].items
    }))

    setResults(billResults)
    triggerHapticFeedback()
  }

  const toggleUserForItem = (itemId: string, userId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const userIndex = item.users.indexOf(userId)
        if (userIndex > -1) {
          return { ...item, users: item.users.filter(id => id !== userId) }
        } else {
          return { ...item, users: [...item.users, userId] }
        }
      }
      return item
    }))
  }

  const calculateBill = () => {
    const userTotals: { [key: string]: { total: number; items: { name: string; amount: number }[] } } = {}
    
    // Initialize user totals
    users.forEach(user => {
      userTotals[user.id] = { total: 0, items: [] }
    })

    // Calculate each user's share of items
    items.forEach(item => {
      if (item.users.length > 0) {
        const amountPerUser = item.amount / item.users.length
        item.users.forEach(userId => {
          userTotals[userId].total += amountPerUser
          userTotals[userId].items.push({ name: item.name, amount: amountPerUser })
        })
      }
    })

    // Add GST share
    const gstPerUser = gstAmount / users.length
    users.forEach(user => {
      userTotals[user.id].total += gstPerUser
    })

    // Convert to results format
    const billResults: BillSplit[] = users.map(user => ({
      user: user.name,
      totalOwed: userTotals[user.id].total,
      items: userTotals[user.id].items
    }))

    setResults(billResults)
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const removeUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
    setItems(items.map(item => ({
      ...item,
      users: item.users.filter(id => id !== userId)
    })))
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>DiviPay</h1>
            <p>Split your bill fairly among friends</p>
          </div>
          <div className="header-right">
            <button 
              className="theme-toggle"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="toggle-slider">
                <div className="toggle-knob"></div>
              </div>
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">
        {/* Users Section */}
        <section className="section">
          <h2>People</h2>
          <div className="add-user">
            <input
              type="text"
              placeholder="Enter person's name"
              value={newUserName}
              onChange={(e) => {
                setNewUserName(e.target.value)
                updateSmartSuggestions(e.target.value, 'name')
              }}
              onKeyPress={(e) => e.key === 'Enter' && addUser()}
            />
            <button onClick={addUser}>Add Person</button>
            <button 
              className="voice-btn"
              onClick={() => {
                setIsVoiceMode(false)
                startVoiceInput()
              }}
              title="Voice input for names"
            >
              Voice
            </button>
          </div>
          
          {/* Smart Suggestions */}
          {smartSuggestions.length > 0 && (
            <div className="smart-suggestions">
              {smartSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => {
                    setNewUserName(suggestion)
                    setSmartSuggestions([])
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="users-list">
            {users.map(user => (
              <div key={user.id} className="user-item">
                <span>{user.name}</span>
                {users.length > 2 && (
                  <button 
                    className="remove-btn"
                    onClick={() => removeUser(user.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Items Section */}
        <section className="section">
          <h2>Items</h2>
          <div className="add-item">
            <input
              type="text"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => {
                setNewItemName(e.target.value)
                updateSmartSuggestions(e.target.value, 'item')
              }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            <button onClick={addItem}>Add Item</button>
            <button 
              className="voice-btn"
              onClick={() => {
                setIsVoiceMode(true)
                startVoiceInput()
              }}
              title="Voice input for items (e.g., 'Pizza $15')"
            >
              Voice
            </button>
          </div>
          
          {/* Smart Suggestions for Items */}
          {smartSuggestions.length > 0 && newItemName && (
            <div className="smart-suggestions">
              {smartSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => {
                    setNewItemName(suggestion)
                    setSmartSuggestions([])
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          {/* Quick Add Mode Toggle */}
          <div className="quick-add-toggle">
            <button 
              className={`quick-add-btn ${quickAddMode ? 'active' : ''}`}
              onClick={toggleQuickAddMode}
            >
              Quick Add Mode
            </button>
            {quickAddMode && (
              <div className="quick-add-hint">
                In Quick Add Mode, new items are automatically added to all users
              </div>
            )}
          </div>
          
          <div className="items-list">
            {items.map(item => (
              <div 
                key={item.id} 
                className={`item-card ${shakeAnimation ? 'shake' : ''} ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
                onTouchStart={(e) => handleTouchStart(e, item.id)}
                onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                ref={el => itemCardRefs.current[item.id] = el}
              >
                <div className="item-header">
                  <h3>{item.name}</h3>
                  <span className="item-amount">₹{item.amount.toFixed(2)}</span>
                  <button 
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Gesture Hints */}
                {gestureHint && (
                  <div className="gesture-hints">
                    <div className="gesture-hint left">Swipe left to remove</div>
                    <div className="gesture-hint right">Swipe right to add to all</div>
                  </div>
                )}
                <div className="item-users">
                  <p>Who had this item?</p>
                  <div className="user-checkboxes">
                    {users.map(user => (
                      <label key={user.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={item.users.includes(user.id)}
                          onChange={() => toggleUserForItem(item.id, user.id)}
                        />
                        <span>{user.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GST Section */}
        <section className="section">
          <h2>Additional Charges</h2>
          <div className="gst-input">
            <label>
              GST/Service Charge:
              <input
                type="number"
                value={gstAmount}
                onChange={(e) => setGstAmount(parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </label>
      </div>
        </section>

        {/* Calculate Button */}
        <div className="calculate-section">
          <button 
            className="calculate-btn"
            onClick={calculateBillWithTips}
            disabled={items.length === 0 || users.length === 0}
          >
            Calculate Bill Split
          </button>
          
          {/* Clear All Feature */}
          <button 
            className="shake-btn"
            onClick={handleShake}
            title="Clear all data"
          >
            Clear All
        </button>
          
          {/* Haptic Feedback Indicator */}
          {hapticFeedback && (
            <div className="haptic-indicator">
              Haptic Feedback Active
            </div>
          )}
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <section className="section results">
            <h2>Bill Split Results</h2>
            <div className="results-grid">
              {results.map((result, index) => (
                <div key={index} className="result-card">
                  <h3>{result.user}</h3>
                  <div className="total-owed">
                    <strong>Total: ₹{result.totalOwed.toFixed(2)}</strong>
                  </div>
                  {result.items.length > 0 && (
                    <div className="item-breakdown">
                      <h4>Items:</h4>
                      <ul>
                        {result.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            {item.name}: ₹{item.amount.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {gstAmount > 0 && (
                    <div className="gst-share">
                      GST Share: ₹{(gstAmount / users.length).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="summary">
              <h3>Summary</h3>
              <p>
                Total Bill: ₹{(items.reduce((sum, item) => sum + item.amount, 0) + gstAmount).toFixed(2)}
              </p>
              <p>
                Per Person Average: ₹{((items.reduce((sum, item) => sum + item.amount, 0) + gstAmount) / users.length).toFixed(2)}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default App