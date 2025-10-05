#[starknet::contract]
mod PaymentRouter {
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
        next_payment_id: u256,
        pending_payments: LegacyMap<u256, Payment>,
        payment_status: LegacyMap<u256, PaymentStatus>,
        lightning_invoice_map: LegacyMap<felt252, u256>,
        vault_address: ContractAddress,
        payment_config: PaymentConfig,
    }

    #[derive(Drop, Serde)]
    struct Payment {
        id: u256,
        from: ContractAddress,
        amount: u256,
        lightning_invoice: felt252,
        timestamp: u256,
        expiry: u256,
        proof: felt252,
        status: PaymentStatus,
    }

    #[derive(Drop, Serde, Copy)]
    enum PaymentStatus {
        Pending,
        Completed,
        Failed,
        Refunded,
        Expired,
    }

    #[derive(Drop, Serde)]
    struct PaymentConfig {
        max_payment_amount: u256,
        min_payment_amount: u256,
        payment_timeout: u256,
        fee_rate: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PaymentCreated {
            payment_id: u256,
            from: ContractAddress,
            amount: u256,
            lightning_invoice: felt252,
            timestamp: u256,
        },
        PaymentCompleted {
            payment_id: u256,
            proof: felt252,
            timestamp: u256,
        },
        PaymentRefunded {
            payment_id: u256,
            reason: felt252,
            timestamp: u256,
        },
        PaymentFailed {
            payment_id: u256,
            error_code: u256,
            timestamp: u256,
        },
    }

    #[constructor]
    fn constructor(
        owner_: ContractAddress,
        vault_address: ContractAddress,
        config: PaymentConfig
    ) {
        Pausable::initializer();
        ReentrancyGuard::initializer();
        Ownable::initializer(owner_);
        let storage = Storage::read();
        storage.owner.write(owner_);
        storage.paused.write(false);
        storage.locked.write(false);
        storage.next_payment_id.write(1);
        storage.vault_address.write(vault_address);
        storage.payment_config.write(config);
    }

    // View functions
    #[view]
    fn get_payment_status(payment_id: u256) -> PaymentStatus {
        let storage = Storage::read();
        storage.payment_status.read(payment_id)
    }

    #[view]
    fn get_payment(payment_id: u256) -> Payment {
        let storage = Storage::read();
        storage.pending_payments.read(payment_id)
    }

    #[view]
    fn get_payment_config() -> PaymentConfig {
        let storage = Storage::read();
        storage.payment_config.read()
    }

    #[view]
    fn get_payment_by_invoice(invoice: felt252) -> u256 {
        let storage = Storage::read();
        storage.lightning_invoice_map.read(invoice)
    }

    // External functions
    #[external]
    fn create_payment(
        amount: u256,
        lightning_invoice: felt252,
        expiry: u256
    ) -> u256 {
        Pausable::assert_not_paused();
        ReentrancyGuard::non_reentrant();

        let storage = Storage::read();
        let config = storage.payment_config.read();
        let caller = starknet::get_caller_address();

        // Validate payment amount
        assert!(amount >= config.min_payment_amount, 'Payment amount below minimum');
        assert!(amount <= config.max_payment_amount, 'Payment amount exceeds maximum');

        // Validate expiry time
        let current_time = starknet::get_block_timestamp();
        assert!(expiry > current_time, 'Expiry time must be in the future');

        // Create payment
        let payment_id = storage.next_payment_id.read();
        storage.next_payment_id.write(payment_id + 1);

        let payment = Payment {
            id: payment_id,
            from: caller,
            amount,
            lightning_invoice,
            timestamp: current_time,
            expiry,
            proof: 0,
            status: PaymentStatus::Pending,
        };

        storage.pending_payments.write(payment_id, payment);
        storage.payment_status.write(payment_id, PaymentStatus::Pending);
        storage.lightning_invoice_map.write(lightning_invoice, payment_id);

        emit Event::PaymentCreated {
            payment_id,
            from: caller,
            amount,
            lightning_invoice,
            timestamp: current_time,
        };

        payment_id
    }

    #[external]
    fn complete_payment(payment_id: u256, proof: felt252) {
        Pausable::assert_not_paused();
        ReentrancyGuard::non_reentrant();

        let storage = Storage::read();
        let mut payment = storage.pending_payments.read(payment_id);

        // Validate payment status
        assert!(payment.status == PaymentStatus::Pending, 'Payment is not pending');

        // Validate expiry
        let current_time = starknet::get_block_timestamp();
        assert!(current_time <= payment.expiry, 'Payment has expired');

        // Verify Lightning payment proof (implementation depends on specific verification method)
        assert!(proof != 0, 'Invalid payment proof');

        // Update payment status
        payment.proof = proof;
        payment.status = PaymentStatus::Completed;
        storage.pending_payments.write(payment_id, payment);
        storage.payment_status.write(payment_id, PaymentStatus::Completed);

        emit Event::PaymentCompleted {
            payment_id,
            proof,
            timestamp: current_time,
        };

        // Notify vault contract to release funds
        // This would typically call the vault contract to release the locked funds
    }

    #[external]
    fn refund_payment(payment_id: u256, reason: felt252) {
        Pausable::assert_not_paused();
        ReentrancyGuard::non_reentrant();

        let storage = Storage::read();
        let mut payment = storage.pending_payments.read(payment_id);

        // Validate payment status
        assert!(payment.status == PaymentStatus::Pending, 'Payment is not pending');

        // Check if payment has expired
        let current_time = starknet::get_block_timestamp();
        let is_expired = current_time > payment.expiry;

        assert!(is_expired || reason != 0, 'Refund requires expiry or valid reason');

        // Update payment status
        payment.status = PaymentStatus::Refunded;
        storage.pending_payments.write(payment_id, payment);
        storage.payment_status.write(payment_id, PaymentStatus::Refunded);

        emit Event::PaymentRefunded {
            payment_id,
            reason,
            timestamp: current_time,
        };

        // Return funds to user (implementation depends on token standard)
    }

    #[external]
    fn expire_payment(payment_id: u256) {
        Pausable::assert_not_paused();
        ReentrancyGuard::non_reentrant();

        let storage = Storage::read();
        let mut payment = storage.pending_payments.read(payment_id);

        // Validate payment status
        assert!(payment.status == PaymentStatus::Pending, 'Payment is not pending');

        // Check if payment has expired
        let current_time = starknet::get_block_timestamp();
        assert!(current_time > payment.expiry, 'Payment has not expired yet');

        // Update payment status
        payment.status = PaymentStatus::Expired;
        storage.pending_payments.write(payment_id, payment);
        storage.payment_status.write(payment_id, PaymentStatus::Expired);

        emit Event::PaymentRefunded {
            payment_id,
            reason: 'Payment expired',
            timestamp: current_time,
        };

        // Return funds to user
    }

    // Admin functions
    #[external]
    fn update_config(new_config: PaymentConfig) {
        Ownable::assert_owner();
        let storage = Storage::read();
        storage.payment_config.write(new_config);
    }

    #[external]
    fn update_vault_address(new_vault_address: ContractAddress) {
        Ownable::assert_owner();
        let storage = Storage::read();
        storage.vault_address.write(new_vault_address);
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
    fn emergency_refund_all_pending() {
        Ownable::assert_owner();
        let storage = Storage::read();
        let current_time = starknet::get_block_timestamp();
        let next_id = storage.next_payment_id.read();

        // Iterate through all pending payments and refund them
        // This is a simplified implementation - in practice, you'd want to handle this more efficiently
        for i in 1..next_id {
            if storage.payment_status.read(i) == PaymentStatus::Pending {
                refund_payment(i, 'Emergency refund');
            }
        }
    }

    // Internal function to calculate payment fees
    #[internal]
    fn calculate_fee(amount: u256) -> u256 {
        let storage = Storage::read();
        let config = storage.payment_config.read();
        (amount * config.fee_rate) / 10000 // Fee rate is in basis points
    }

    // Internal function to validate Lightning invoice format
    #[internal]
    fn validate_lightning_invoice(invoice: felt252) -> bool {
        // Basic validation - in practice, this would involve more sophisticated validation
        invoice > 0
    }
}