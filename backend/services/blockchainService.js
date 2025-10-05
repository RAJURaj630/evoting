const crypto = require('crypto');

/**
 * Blockchain Service for Immutable Vote Storage
 * Implements a simplified blockchain for vote integrity
 */

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Proof of work difficulty
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), {
      type: 'GENESIS',
      message: 'E-Voting System Genesis Block',
      election: '2024-GENERAL'
    }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  createVoteBlock(voteData) {
    const block = new Block(
      this.chain.length,
      Date.now(),
      {
        type: 'VOTE',
        voteId: voteData.voteId,
        encryptedVote: voteData.encryptedVote,
        voteHash: voteData.voteHash,
        timestamp: voteData.timestamp,
        electionRound: voteData.electionRound
      }
    );
    
    this.addBlock(block);
    return block;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return {
          valid: false,
          error: `Block ${i} has been tampered with`,
          blockIndex: i
        };
      }

      // Verify chain linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          valid: false,
          error: `Block ${i} chain linkage broken`,
          blockIndex: i
        };
      }
    }

    return { valid: true, message: 'Blockchain is valid' };
  }

  getBlockByVoteId(voteId) {
    return this.chain.find(block => 
      block.data.type === 'VOTE' && block.data.voteId === voteId
    );
  }

  getChainStats() {
    return {
      totalBlocks: this.chain.length,
      totalVotes: this.chain.filter(b => b.data.type === 'VOTE').length,
      difficulty: this.difficulty,
      isValid: this.isChainValid().valid,
      latestBlock: this.getLatestBlock().hash,
      genesisBlock: this.chain[0].hash
    };
  }

  exportChain() {
    return {
      chain: this.chain,
      stats: this.getChainStats(),
      exportedAt: new Date().toISOString()
    };
  }
}

class BlockchainService {
  constructor() {
    this.blockchain = new Blockchain();
  }

  /**
   * Record vote on blockchain
   */
  async recordVote(voteData) {
    try {
      const block = this.blockchain.createVoteBlock({
        voteId: voteData._id || voteData.voteId,
        encryptedVote: voteData.encryptedVote,
        voteHash: voteData.voteHash,
        timestamp: voteData.timestamp || new Date(),
        electionRound: voteData.electionRound || '2024-GENERAL'
      });

      return {
        success: true,
        message: 'Vote recorded on blockchain',
        blockData: {
          blockIndex: block.index,
          blockHash: block.hash,
          previousHash: block.previousHash,
          timestamp: block.timestamp,
          nonce: block.nonce
        }
      };
    } catch (error) {
      throw new Error(`Blockchain recording failed: ${error.message}`);
    }
  }

  /**
   * Verify vote integrity
   */
  async verifyVote(voteId) {
    try {
      const block = this.blockchain.getBlockByVoteId(voteId);
      
      if (!block) {
        return {
          success: false,
          message: 'Vote not found on blockchain'
        };
      }

      const chainValidation = this.blockchain.isChainValid();
      
      return {
        success: chainValidation.valid,
        message: chainValidation.valid ? 'Vote integrity verified' : 'Vote integrity compromised',
        blockData: {
          blockIndex: block.index,
          blockHash: block.hash,
          timestamp: block.timestamp,
          voteData: block.data
        },
        chainValidation
      };
    } catch (error) {
      throw new Error(`Vote verification failed: ${error.message}`);
    }
  }

  /**
   * Get blockchain statistics
   */
  getStats() {
    return this.blockchain.getChainStats();
  }

  /**
   * Validate entire blockchain
   */
  validateChain() {
    return this.blockchain.isChainValid();
  }

  /**
   * Export blockchain for audit
   */
  exportForAudit() {
    return this.blockchain.exportChain();
  }

  /**
   * Generate Merkle root for batch verification
   */
  generateMerkleRoot(votes) {
    if (votes.length === 0) return null;
    
    let hashes = votes.map(vote => 
      crypto.createHash('sha256').update(JSON.stringify(vote)).digest('hex')
    );

    while (hashes.length > 1) {
      const newHashes = [];
      for (let i = 0; i < hashes.length; i += 2) {
        if (i + 1 < hashes.length) {
          const combined = hashes[i] + hashes[i + 1];
          newHashes.push(crypto.createHash('sha256').update(combined).digest('hex'));
        } else {
          newHashes.push(hashes[i]);
        }
      }
      hashes = newHashes;
    }

    return hashes[0];
  }
}

module.exports = new BlockchainService();
