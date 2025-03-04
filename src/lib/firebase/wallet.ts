import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  Timestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { Wallet, WalletTransaction } from '../../types/wallet';

// Create or update wallet
export const getOrCreateWallet = async (userId: string): Promise<Wallet> => {
  const walletRef = doc(db, 'wallets', userId);
  const walletSnap = await getDoc(walletRef);
  
  if (walletSnap.exists()) {
    const walletData = walletSnap.data();
    return { 
      id: walletSnap.id, 
      userId, 
      balance: walletData.balance || 0,
      createdAt: walletData.createdAt.toDate(),
      updatedAt: walletData.updatedAt?.toDate()
    };
  } else {
    // Create new wallet with 0 balance
    const newWallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      balance: 0
    };
    
    await setDoc(walletRef, {
      ...newWallet,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { 
      id: userId, 
      userId, 
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};

// Get wallet balance
export const getWalletBalance = async (userId: string): Promise<number> => {
  const wallet = await getOrCreateWallet(userId);
  return wallet.balance;
};

// Add funds to wallet (using Razorpay)
export const addFundsToWallet = async (
  userId: string, 
  amount: number,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      // Get wallet reference
      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await transaction.get(walletRef);
      
      // Create transaction record
      const transactionRef = doc(collection(db, 'wallet_transactions'));
      const transactionData: Omit<WalletTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        amount,
        type: 'deposit',
        status: 'completed',
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        description: `Added ₹${amount} to wallet`
      };
      
      // If wallet exists, update balance, otherwise create it
      if (walletSnap.exists()) {
        transaction.update(walletRef, { 
          balance: increment(amount),
          updatedAt: serverTimestamp()
        });
      } else {
        transaction.set(walletRef, {
          userId,
          balance: amount,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Save transaction record
      transaction.set(transactionRef, {
        ...transactionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    console.log(`Successfully added ₹${amount} to wallet for user ${userId}`);
  } catch (error) {
    console.error('Error adding funds to wallet:', error);
    throw error;
  }
};

// Get wallet transactions
export const getWalletTransactions = async (userId: string): Promise<WalletTransaction[]> => {
  try {
    const q = query(
      collection(db, 'wallet_transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: WalletTransaction[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        status: data.status,
        razorpayPaymentId: data.razorpayPaymentId,
        razorpayOrderId: data.razorpayOrderId,
        razorpaySignature: data.razorpaySignature,
        description: data.description,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    throw error;
  }
}; 