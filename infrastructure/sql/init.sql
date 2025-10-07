-- Create database if not exists
CREATE DATABASE IF NOT EXISTS farlabs;
USE farlabs;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    username VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    kyc_status VARCHAR(20) DEFAULT 'pending',
    tier VARCHAR(20) DEFAULT 'basic'
);

-- GPU Nodes table
CREATE TABLE gpu_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id VARCHAR(100) UNIQUE NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    gpu_model VARCHAR(100),
    vram_gb INTEGER,
    cuda_cores INTEGER,
    bandwidth_mbps DECIMAL(10, 2),
    location_country VARCHAR(2),
    location_region VARCHAR(100),
    status VARCHAR(20) DEFAULT 'offline',
    reliability_score DECIMAL(5, 2) DEFAULT 80.00,
    tasks_completed INTEGER DEFAULT 0,
    total_earned DECIMAL(20, 8) DEFAULT 0,
    uptime_percentage DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (owner_address) REFERENCES users(wallet_address)
);

-- Inference Tasks table
CREATE TABLE inference_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    node_id UUID,
    model_name VARCHAR(100) NOT NULL,
    prompt TEXT,
    max_tokens INTEGER,
    temperature DECIMAL(3, 2),
    status VARCHAR(20) DEFAULT 'pending',
    tokens_generated INTEGER,
    cost_far DECIMAL(20, 8),
    cost_usd DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    response_time_ms INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (node_id) REFERENCES gpu_nodes(id)
);

-- Staking Records table
CREATE TABLE staking_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    lock_period_days INTEGER NOT NULL,
    apy_at_stake DECIMAL(5, 2),
    status VARCHAR(20) DEFAULT 'active',
    staked_at TIMESTAMP DEFAULT NOW(),
    unlock_at TIMESTAMP,
    withdrawn_at TIMESTAMP,
    rewards_earned DECIMAL(20, 8) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Revenue Streams table
CREATE TABLE revenue_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_type VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL,
    amount_far DECIMAL(20, 8),
    amount_usd DECIMAL(10, 4),
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    transaction_hash VARCHAR(66),
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    key_hash VARCHAR(64) NOT NULL,
    name VARCHAR(100),
    permissions JSONB,
    rate_limit INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_gpu_nodes_status ON gpu_nodes(status);
CREATE INDEX idx_gpu_nodes_owner ON gpu_nodes(owner_address);
CREATE INDEX idx_tasks_user ON inference_tasks(user_id);
CREATE INDEX idx_tasks_status ON inference_tasks(status);
CREATE INDEX idx_staking_user ON staking_records(user_id);
CREATE INDEX idx_staking_status ON staking_records(status);
CREATE INDEX idx_revenue_user ON revenue_streams(user_id);
CREATE INDEX idx_revenue_type ON revenue_streams(stream_type);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);

-- Create functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data for testing
INSERT INTO users (wallet_address, email, username, kyc_status, tier)
VALUES
    ('0x0000000000000000000000000000000000000001', 'admin@farlabs.ai', 'admin', 'verified', 'premium'),
    ('0x0000000000000000000000000000000000000002', 'test@farlabs.ai', 'testuser', 'verified', 'basic');

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;