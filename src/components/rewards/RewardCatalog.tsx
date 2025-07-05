import React, { useState, useEffect } from 'react'
import { Student } from '../../lib/supabase'
import { TokenService, Reward, RewardClaim } from '../../services/tokenService'
import { Button } from '../ui/Button'
import { 
  Coins, 
  Gift, 
  Trophy, 
  BookOpen, 
  Gamepad2, 
  Ticket, 
  ShoppingCart,
  Star,
  Clock,
  Check,
  X,
  Loader2
} from 'lucide-react'

interface RewardCatalogProps {
  student: Student
  isOpen: boolean
  onClose: () => void
}

export function RewardCatalog({ student, isOpen, onClose }: RewardCatalogProps) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [claims, setClaims] = useState<RewardClaim[]>([])
  const [tokenBalance, setTokenBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [claimingReward, setClaimingReward] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (isOpen) {
      loadRewardData()
    }
  }, [isOpen, student.id])

  const loadRewardData = async () => {
    setLoading(true)
    try {
      const studentAge = calculateAge(student.date_of_birth)
      const [rewardsData, claimsData, balance] = await Promise.all([
        TokenService.getAvailableRewards(studentAge),
        TokenService.getRewardClaims(student.id),
        TokenService.getTokenBalance(student.id)
      ])

      setRewards(rewardsData)
      setClaims(claimsData)
      setTokenBalance(balance)
    } catch (error) {
      console.error('Error loading reward data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId)
    try {
      const result = await TokenService.claimReward(student.id, rewardId)
      
      if (result.success) {
        // Update local state
        setTokenBalance(result.newBalance || 0)
        
        // Reload claims to show new claim
        const updatedClaims = await TokenService.getRewardClaims(student.id)
        setClaims(updatedClaims)
        
        // Show success message (you can add a toast here)
        alert('Reward claimed successfully! Please wait for parent approval.')
      } else {
        alert(result.error || 'Failed to claim reward')
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      alert('An error occurred while claiming the reward')
    } finally {
      setClaimingReward(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'digital':
        return <Gamepad2 className="w-5 h-5" />
      case 'physical':
        return <Gift className="w-5 h-5" />
      case 'experience':
        return <Ticket className="w-5 h-5" />
      default:
        return <Star className="w-5 h-5" />
    }
  }

  const getRewardStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'fulfilled':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory)

  const isRewardAlreadyClaimed = (rewardId: string) => {
    return claims.some(claim => claim.reward_id === rewardId && claim.status === 'pending')
  }

  const canAffordReward = (cost: number) => {
    return tokenBalance >= cost
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Reward Store</h2>
                <p className="text-purple-100">Exchange your tokens for amazing rewards!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  <span className="font-bold text-lg">{tokenBalance}</span>
                </div>
                <div className="text-xs text-purple-100">Your Tokens</div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'All Rewards', icon: Star },
              { id: 'digital', label: 'Digital', icon: Gamepad2 },
              { id: 'physical', label: 'Physical', icon: Gift },
              { id: 'experience', label: 'Experience', icon: Ticket }
            ].map(category => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="ml-2 text-gray-600">Loading rewards...</span>
            </div>
          ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredRewards.map((reward: Reward) => {
                 const alreadyClaimed = isRewardAlreadyClaimed(reward.id)
                 const canAfford = canAffordReward(reward.token_cost)
                 const claiming = claimingReward === reward.id

                 return (
                   <div
                     key={reward.id}
                     className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow ${
                       canAfford ? 'border-purple-200' : 'border-gray-200'
                     }`}
                   >
                    {/* Reward Image */}
                    <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-xl flex items-center justify-center">
                      {getCategoryIcon(reward.category)}
                    </div>

                    {/* Reward Details */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{reward.name}</h3>
                        <div className="flex items-center text-purple-600 font-bold">
                          <Coins className="w-4 h-4 mr-1" />
                          {reward.token_cost}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="capitalize">{reward.category}</span>
                        {reward.stock_count > 0 && (
                          <span>{reward.stock_count} left</span>
                        )}
                      </div>

                      {/* Claim Button */}
                      <Button
                        onClick={() => handleClaimReward(reward.id)}
                        disabled={!canAfford || alreadyClaimed || claiming || reward.stock_count === 0}
                        className={`w-full ${
                          canAfford && !alreadyClaimed 
                            ? 'bg-purple-500 hover:bg-purple-600' 
                            : 'bg-gray-300'
                        }`}
                        icon={claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                      >
                        {claiming ? 'Claiming...' : 
                         alreadyClaimed ? 'Claimed' :
                         !canAfford ? `Need ${reward.token_cost - tokenBalance} more tokens` :
                         reward.stock_count === 0 ? 'Out of Stock' :
                         'Claim Reward'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* My Claims Section */}
        {claims.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              My Recent Claims
            </h3>
                         <div className="space-y-2 max-h-32 overflow-y-auto">
               {claims.slice(0, 3).map((claim: RewardClaim) => (
                 <div key={claim.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      {getCategoryIcon(claim.reward?.category || 'digital')}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{claim.reward?.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(claim.claimed_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {claim.tokens_spent} tokens
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRewardStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}