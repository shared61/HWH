import { Circle } from '@/types/circle';
import { WalletTransaction } from '@/types/wallet';

// Simulate investing in a circle
export const investInCircle = async (
  userId: string,
  circleId: string,
  amount: number,
  circleName: string
): Promise<{ success: boolean; message: string; transaction?: WalletTransaction }> => {
  try {
    // Simulate a delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create a transaction record
    const transaction: WalletTransaction = {
      id: `inv_${Date.now()}`,
      userId,
      amount,
      type: 'withdrawal',
      status: 'completed',
      description: `Invested ₹${amount} in ${circleName}`,
      createdAt: new Date()
    };
    
    console.log(`[SIMULATION] Invested ₹${amount} in circle ${circleId} for user ${userId}`);
    
    return {
      success: true,
      message: `Successfully invested ₹${amount} in ${circleName}`,
      transaction
    };
  } catch (error: any) {
    console.error('Error investing in circle:', error);
    return {
      success: false,
      message: error.message || 'Failed to invest in circle'
    };
  }
};

// Get user's investments in a circle
export const getUserInvestments = async (userId: string, circleId?: string): Promise<any[]> => {
  try {
    // Simulate a delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get investments from localStorage
    const investmentsKey = `user_investments_${userId}`;
    const savedInvestments = localStorage.getItem(investmentsKey);
    let investments = savedInvestments ? JSON.parse(savedInvestments) : [];
    
    // Filter by circleId if provided
    if (circleId) {
      investments = investments.filter((inv: any) => inv.circleId === circleId);
    }
    
    // Convert string dates back to Date objects
    return investments.map((inv: any) => ({
      ...inv,
      createdAt: new Date(inv.createdAt)
    }));
  } catch (error) {
    console.error('Error getting user investments:', error);
    return [];
  }
};

// Save an investment record
export const saveInvestment = async (
  userId: string,
  circleId: string,
  amount: number,
  circleName: string
): Promise<void> => {
  try {
    // Get existing investments
    const investmentsKey = `user_investments_${userId}`;
    const savedInvestments = localStorage.getItem(investmentsKey);
    const investments = savedInvestments ? JSON.parse(savedInvestments) : [];
    
    // Create new investment record
    const newInvestment = {
      id: `inv_${Date.now()}`,
      userId,
      circleId,
      circleName,
      amount,
      createdAt: new Date().toISOString()
    };
    
    // Add to investments array
    investments.unshift(newInvestment);
    
    // Save back to localStorage
    localStorage.setItem(investmentsKey, JSON.stringify(investments));
  } catch (error) {
    console.error('Error saving investment:', error);
    throw error;
  }
};

// Update circle's current amount
export const updateCircleAmount = async (
  circleId: string,
  amount: number
): Promise<void> => {
  try {
    // Get circles from localStorage
    const circlesKey = 'simulated_circles';
    const savedCircles = localStorage.getItem(circlesKey);
    let circles = savedCircles ? JSON.parse(savedCircles) : {};
    
    // Get or initialize the circle
    if (!circles[circleId]) {
      // Try to get from Firebase simulation
      const circle = await getSimulatedCircle(circleId);
      if (circle) {
        circles[circleId] = {
          ...circle,
          currentAmount: circle.currentAmount || 0
        };
      } else {
        // Create a new entry if not found
        circles[circleId] = {
          id: circleId,
          currentAmount: 0
        };
      }
    }
    
    // Update the amount
    circles[circleId].currentAmount = (circles[circleId].currentAmount || 0) + amount;
    circles[circleId].updatedAt = new Date().toISOString();
    
    // Save back to localStorage
    localStorage.setItem(circlesKey, JSON.stringify(circles));
    
    console.log(`[SIMULATION] Updated circle ${circleId} amount by ₹${amount}`);
  } catch (error) {
    console.error('Error updating circle amount:', error);
    throw error;
  }
};

// Get a simulated circle from localStorage
export const getSimulatedCircle = async (circleId: string): Promise<Circle | null> => {
  try {
    // Get circles from localStorage
    const circlesKey = 'simulated_circles';
    const savedCircles = localStorage.getItem(circlesKey);
    const circles = savedCircles ? JSON.parse(savedCircles) : {};
    
    return circles[circleId] || null;
  } catch (error) {
    console.error('Error getting simulated circle:', error);
    return null;
  }
}; 