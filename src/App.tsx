import { useState, useRef } from 'react'
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
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionConstructor) return

    const recognition: InstanceType<typeof SpeechRecognitionConstructor> = new SpeechRecognitionConstructor()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript
      if (isVoiceMode) {
        const words: string[] = transcript.toLowerCase().split(' ')
        const amountMatch = transcript.match(/\$?(\d+(?:\.\d{2})?)/)
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0
        const itemName = words.filter((w: string) => !w.match(/\$?\d+(?:\.\d{2})?/)).join(' ')
        if (itemName && amount > 0) addItemFromVoice(itemName, amount)
      } else {
        setNewUserName(transcript)
      }
    }

    recognition.start()
  }

  const addItemFromVoice = (name: string, amount: number) => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: name.trim(),
      amount,
      users: []
    }
    setItems([...items, newItem])
    triggerHapticFeedback()
  }

  // 📱 HAPTIC FEEDBACK SIMULATION
  const triggerHapticFeedback = () => {
    setHapticFeedback(true)
    setTimeout(() => setHapticFeedback(false), 200)

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

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        setSwipeDirection('right')
        if (itemId) quickAddToAllUsers(itemId)
      } else {
        setSwipeDirection('left')
        if (itemId) removeItem(itemId)
      }
      triggerHapticFeedback()
    }

    setTimeout(() => setSwipeDirection(null), 100)
  }

  const quickAddToAllUsers = (itemId: string) => {
    setItems(items.map(item => item.id === itemId ? { ...item, users: users.map(u => u.id) } : item))
    triggerHapticFeedback()
  }

  // 🎯 SMART SUGGESTIONS
  const updateSmartSuggestions = (input: string, type: 'name' | 'item') => {
    const suggestions = type === 'name' ? commonNames : commonItems
    setSmartSuggestions(suggestions.filter(item => item.toLowerCase().includes(input.toLowerCase())).slice(0, 3))
  }

  const addUser = () => {
    if (newUserName.trim()) {
      const newUser: User = { id: Date.now().toString(), name: newUserName.trim() }
      setUsers([...users, newUser])
      setNewUserName('')
      setSmartSuggestions([])
      triggerHapticFeedback()
    }
  }

  const addItem = () => {
    if (newItemName.trim() && newItemAmount && parseFloat(newItemAmount) > 0) {
      const newItem: Item = { id: Date.now().toString(), name: newItemName.trim(), amount: parseFloat(newItemAmount), users: [] }
      setItems([...items, newItem])
      setNewItemName('')
      setNewItemAmount('')
      setSmartSuggestions([])
      triggerHapticFeedback()
    }
  }

  const toggleQuickAddMode = () => {
    setQuickAddMode(!quickAddMode)
    triggerHapticFeedback()
  }

  const handleShake = () => {
    setShakeAnimation(true)
    setTimeout(() => setShakeAnimation(false), 1000)
    setUsers([])
    setItems([])
    setGstAmount(0)
    setResults([])
    triggerHapticFeedback()
  }

  const calculateBillWithTips = () => {
    const userTotals: { [key: string]: { total: number; items: { name: string; amount: number }[] } } = {}
    users.forEach(u => userTotals[u.id] = { total: 0, items: [] })

    items.forEach(item => {
      if (item.users.length > 0) {
        const perUser = item.amount / item.users.length
        item.users.forEach(uid => {
          userTotals[uid].total += perUser
          userTotals[uid].items.push({ name: item.name, amount: perUser })
        })
      }
    })

    const gstPerUser = gstAmount / users.length
    users.forEach(u => userTotals[u.id].total += gstPerUser)

    const billResults: BillSplit[] = users.map(u => ({
      user: u.name,
      totalOwed: userTotals[u.id].total,
      items: userTotals[u.id].items
    }))

    setResults(billResults)
    triggerHapticFeedback()
  }

  const toggleUserForItem = (itemId: string, userId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const exists = item.users.includes(userId)
        return exists ? { ...item, users: item.users.filter(id => id !== userId) } : { ...item, users: [...item.users, userId] }
      }
      return item
    }))
  }

  const removeItem = (itemId: string) => setItems(items.filter(i => i.id !== itemId))
  const removeUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId))
    setItems(items.map(item => ({ ...item, users: item.users.filter(id => id !== userId) })))
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* ... your JSX (header, users, items, results) goes here ... */}
    </div>
  )
}

export default App
