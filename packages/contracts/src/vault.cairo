#[starknet::contract]
mod YieldVault {
    use starknet::ContractAddress;
    use starknet::info::get_contract_address;
    use openzeppelin::security::pausable::Pausable;
    use openzeppelin::security::reentrancy_guard::ReentrancyGuard;
    use openzeppelin::access::ownable::Ownable;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        paused: bool,
        locked: bool,
        vault_balances: LegacyMap<ContractAddress, u256>,
        total_deposits: u256,
        accrued_yield: u256,
        yield_rate: u256,
        last_update: u256,
        vault_config: VaultConfig,
        next_vault_id: u256,
        vault_ids: LegacyMap<ContractAddress, u256>,
    }

    #[derive(Drop, Serde)]
    struct VaultConfig {
        min_deposit: u256,
        max_deposit: u256,
        withdrawal_fee: u256,
        emergency_withdrawal: bool,
        yield_sources: Array<ContractAddress>,
        required_confirmations: u256,
    }

    #[derive(Drop, Serde)]
    struct Vault {
        id: u256,
        owner: ContractAddress,
        balance: u256,
        yield_earned: u256,
        created_at: u256,
        last_yield_distribution: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Deposited {
            vault_id: u256,
            user: ContractAddress,
            amount: u256,
            timestamp: u256,
        },
        Withdrawn {
            vault_id: u256,
            user: ContractAddress,
            amount: u256,
            fee: u256,
            timestamp: u256,
        },
        YieldDistributed {
            vault_id: u256,
            amount: u256,
            apr: u256,
            timestamp: u256,
        },
        VaultCreated {
            vault_id: u256,
            owner: ContractAddress,
            timestamp: u256,
        },
        ConfigurationUpdated {
            updated_by: ContractAddress,
            timestamp: u256,
        },
    }

    #[constructor]
    fn constructor(
        owner_: ContractAddress,
        config: VaultConfig
    ) {
        Pausable::initializer();
        ReentrancyGuard::initializer();
        Ownable::initializer(owner_);
        let storage = Storage::read();
        storage.owner.write(owner_);
        storage.paused.write(false);
        storage.locked.write(false);
        storage.vault_config.write(config);
        storage.next_vault_id.write(1);
        storage.yield_rate.write(750); // 7.5% APR (basis points)
        storage.last_update.write(starknet::get_block_timestamp());
    }

    // View functions
    #[view]
    fn get_vault_balance(user: ContractAddress) -> u256 {
        let storage = Storage::read();
        storage.vault_balances.read(user)
    }

    #[view]
    fn get_total_deposits() -> u256 {
        let storage = Storage::read();
        storage.total_deposits.read()
    }

    #[view]
    fn get_yield_rate() -> u256 {
        let storage = Storage::read();
        storage.yield_rate.read()
    }

    #[view]
    fn get_vault_config() -> VaultConfig {
        let storage = Storage::read();
        storage.vault_config.read()
    }

    #[view]
    fn get_user_vault(user: ContractAddress) -> Vault {
        let storage = Storage::read();
        let vault_id = storage.vault_ids.read(user);
        Vault {
            id: vault_id,
            owner: user,
            balance: storage.vault_balances.read(user),
            yield_earned: storage.accrued_yield.read(user),
            created_at: starknet::get_block_timestamp(),
            last_yield_distribution: storage.last_update.read(),
        }
    }

    // External functions
    #[external]
    fn create_vault() -> u256 {
        Pausable::assert_not_paused();
        ReentrancyGuard::non_reentrant();

        let storage = Storage::read();
        let caller = starknet::get_caller_address();
        let vault_id = storage.next_vault_id.read();

        // Check if user already has a vault
        if storage.vault_ids.read(caller) != 0 {
            // User already has a vault, return existing vault ID
            return storage.vault_ids.read(caller);
        }

        // Create new vault
        storage.vault_ids.write(caller, vault_id);
        storage.next_vault_id.write(vault_id + 1);
        storage.vault_balances.write(caller, 0);
        storage.accrued_yield.write(caller, 0);

        emit Event::VaultCreated {
            vault_id,
            owner: caller,
            timestamp: starknet::get_block_timestamp(),
        };

        vault_id
    }

    #[external]
    fn deposit(amount: u256) {
        Pausable::assert_not_paused();
        ReentrancyGuard::non_reentrant();

        let storage = Storage::read();
        let config = storage.vault_config.read();
        let caller = starknet::get_caller_address();

        // Validate deposit amount
        assert!(amount >= config.min_deposit, 'Deposit amount below minimum');
        assert!(amount <= config.max_deposit, 'Deposit amount exceeds maximum');

        // Create vault if doesn't exist
        let vault_id = storage.vault_ids.read(caller);
        if vault_id == 0 {
            vault_id = create_vault();
        }

        // Update balances
        storage.vault_balances.write(caller, storage.vault_balances.read(caller) + amount);
        storage.total_deposits.write(storage.total_deposits.read() + amount);

        emit Event::Deposited {
            vault_id,
            user: caller,
            amount,
            timestamp: starknet::get_block_timestamp(),
        };
    }

    #[external]
    fn withdraw(amount: u256) {
        Pausable::assert_not_paused();
        ReentrancyGuard::non_reentrant();

        let storage = Storage::read();
        let config = storage.vault_config.read();
        let caller = starknet::get_caller_address();
        let vault_id = storage.vault_ids.read(caller);

        assert!(vault_id != 0, 'No vault found for user');
        let current_balance = storage.vault_balances.read(caller);
        assert!(amount <= current_balance, 'Insufficient balance');

        // Calculate withdrawal fee
        let fee = (amount * config.withdrawal_fee) / 10000; // Fee is in basis points
        let withdraw_amount = amount - fee;

        // Update balances
        storage.vault_balances.write(caller, current_balance - amount);
        storage.total_deposits.write(storage.total_deposits.read() - amount);

        // Transfer withdrawal amount to user (implementation depends on token standard)
        // This would typically call a token contract to transfer tokens

        emit Event::Withdrawn {
            vault_id,
            user: caller,
            amount: withdraw_amount,
            fee,
            timestamp: starknet::get_block_timestamp(),
        };
    }

    #[external]
    fn claim_yield() -> u256 {
        Pausable::assert_not_paused();
        ReentrancyGuard::non_reentrant();

        let storage = Storage::read();
        let caller = starknet::get_caller_address();
        let vault_id = storage.vault_ids.read(caller);

        assert!(vault_id != 0, 'No vault found for user');

        let yield_amount = storage.accrued_yield.read(caller);
        assert!(yield_amount > 0, 'No yield available to claim');

        // Reset yield for user
        storage.accrued_yield.write(caller, 0);

        // Transfer yield to user (implementation depends on token standard)
        // This would typically call a token contract to transfer tokens

        emit Event::YieldDistributed {
            vault_id,
            amount: yield_amount,
            apr: storage.yield_rate.read(),
            timestamp: starknet::get_block_timestamp(),
        };

        yield_amount
    }

    // Admin functions
    #[external]
    fn update_yield_rate(new_rate: u256) {
        Ownable::assert_owner();
        let storage = Storage::read();
        storage.yield_rate.write(new_rate);

        emit Event::ConfigurationUpdated {
            updated_by: starknet::get_caller_address(),
            timestamp: starknet::get_block_timestamp(),
        };
    }

    #[external]
    fn update_config(new_config: VaultConfig) {
        Ownable::assert_owner();
        let storage = Storage::read();
        storage.vault_config.write(new_config);

        emit Event::ConfigurationUpdated {
            updated_by: starknet::get_caller_address(),
            timestamp: starknet::get_block_timestamp(),
        };
    }

    #[external]
    fn pause() {
        Ownable::assert_owner();
        Pausable::pause();
    }

    #[external]
    fn unpause() {
        Ownable::assert_owner();
        Pausable::unpause();
    }

    #[external]
    fn emergency_withdraw(user: ContractAddress) {
        Ownable::assert_owner();
        let storage = Storage::read();
        let config = storage.vault_config.read();

        assert!(config.emergency_withdrawal, 'Emergency withdrawal not enabled');

        let vault_id = storage.vault_ids.read(user);
        assert!(vault_id != 0, 'No vault found for user');

        let balance = storage.vault_balances.read(user);
        let yield_amount = storage.accrued_yield.read(user);

        if balance > 0 || yield_amount > 0 {
            // Reset user balances
            storage.vault_balances.write(user, 0);
            storage.accrued_yield.write(user, 0);
            storage.total_deposits.write(storage.total_deposits.read() - balance);

            // Transfer full amount to user
            let total_amount = balance + yield_amount;

            emit Event::Withdrawn {
                vault_id,
                user,
                amount: total_amount,
                fee: 0,
                timestamp: starknet::get_block_timestamp(),
            };
        }
    }

    // Internal function to distribute yield
    #[internal]
    fn distribute_yield() {
        let storage = Storage::read();
        let yield_rate = storage.yield_rate.read();
        let current_time = starknet::get_block_timestamp();
        let time_diff = current_time - storage.last_update.read();

        // Calculate yield for the time period (assuming yearly rate)
        let yield_multiplier = (yield_rate * time_diff) / (365 * 24 * 60 * 60 * 10000);

        // Update last yield distribution time
        storage.last_update.write(current_time);

        // This would typically be called by an automated system or oracle
        // The actual yield calculation and distribution logic would depend on the specific yield strategies
    }
}